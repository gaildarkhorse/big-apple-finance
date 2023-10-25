import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { useCustomWallet } from "../WalletContext"
import ERC20_abi from './abi/ERC20.json'
import Router_abi from './abi/IPancakeRouter02.json'
import Pair_abi from './abi/IPancakeSwapPair.json'
import Nova_abi from './abi/Nova.json'
import Dividend_abi from './abi/DividendDistributor.json'
import walletConfig from '../WalletContext/config'
import ADDRESS from './address'
import axios from 'axios'
import qs from 'qs'

import BigNumber from 'bignumber.js'
import { useGlobal } from "../GlobalContext"
import { useDispatch, useSelector } from "react-redux"
import {
    updateAddress, updateName, updateSymbol, updateDecimals, updateOwner, updatePrice, updateSupply,
    updateCirculatingSupply, updateLastRebasedTime, updateInitRebaseTime, updateFirePitAddress, updateTreasuryAddress,
    updateInsuranceReceiverAddress, updatePoolBalance, updateRebaseRate, updateRebasePeriod,
    updateTreasuryUSDC, updateInsuranceReceiverUSDC, updateFirePitBalance, updateMaxWallet,
    updateRemainingToBuy, updateRemainingToSell, updateFeeExempted, updateETHPrice, updateBalance, updateTreasuryBalance
} from "../ReduxContext/reducers/token"
import { updateChainId, updateExplorer, updateRPC } from "../ReduxContext/reducers/chain"
import { updateTotalShare, updateTotalReward, updateTotalDistributed, updateSecsToReward, updateRewardPeriod, updateRewardedAmount, updateUnpaidAmount } from '../ReduxContext/reducers/reflection'

const Web3 = require("web3")

export const ContractContext = createContext();

export const ContractProvider = (props) => {
    const { wallet } = useCustomWallet()
    const { chainId } = useGlobal()
    const { treasuryAddress, insuranceReceiverAddress, firePitAddress } = useSelector(state => state.token)

    const dispatch = useDispatch()

    const [reloadCounter, setReloadCounter] = useState(0)
    const web3Provider = useMemo(() => { return new Web3(walletConfig[chainId].rpcUrls[0]) }, [chainId])

    const buildEncodedData = useCallback((types, values) => {
        var encoded = web3Provider.eth.abi.encodeParameters(types, values);
        if (encoded.slice(0, 2) === '0x') {
            encoded = encoded.slice(2)
        }
        return encoded
    }, [web3Provider])

    useEffect(() => {
        let ac = new AbortController();

        const reload = () => {
            setReloadCounter(t => { return t + 1 })
        }

        let tmr = setInterval(() => {
            if (ac.signal.aborted === false) {
                reload()
            }
        }, 50000)

        return () => {
            ac.abort()
            clearInterval(tmr)
        }
    }, [])

    useEffect(() => {
        setReloadCounter(t => { return t + 1 })
    }, [wallet])

    const refreshPages = () => {
        setTimeout(() => {
            setReloadCounter(t => { return t + 1 })
        }, 2000)
    }

    const assertValidAddress = useCallback((addr) => {
        if (!web3Provider.utils.isAddress(addr)) {
            throw new Error('Invalid Address')
        }
    }, [web3Provider])

    const makeTx = useCallback(async (addr, tx, gasPlus) => {
        const web3 = window.web3;
        web3.eth.getGasPrice()
        tx.estimateGas({ from: wallet.address })

        const [gasPrice, gasCost] = await Promise.all([
            web3.eth.getGasPrice(),
            tx.estimateGas({ from: wallet.address }),
        ]);
        const data = tx.encodeABI();
        const txData = {
            from: wallet.address,
            to: addr,
            data,
            gas: gasCost + (gasPlus !== undefined ? gasPlus : 0),
            gasPrice
        };
        const receipt = await web3.eth.sendTransaction(txData);
        return receipt;
    }, [wallet.address])

    const makeTxWithNativeCurrency = useCallback(async (addr, tx, nativeCurrencyAmount, gasPlus) => {
        const web3 = window.web3;

        const [gasPrice, gasCost] = await Promise.all([
            web3.eth.getGasPrice(),
            tx.estimateGas({
                value: nativeCurrencyAmount,
                from: wallet.address
            }),
        ]);
        const data = tx.encodeABI();
        const txData = {
            from: wallet.address,
            to: addr,
            value: nativeCurrencyAmount,
            data,
            gas: gasCost + (gasPlus !== undefined ? gasPlus : 0),
            gasPrice
        };
        const receipt = await web3.eth.sendTransaction(txData);
        return receipt;
    }, [wallet.address])

    const A2D = useCallback(async (addr, amount) => {
        const web3 = web3Provider
        assertValidAddress(addr)
        const erc20 = new web3.eth.Contract(ERC20_abi.abi, addr);

        let tval = await erc20.methods.decimals().call()
        let tt = new BigNumber(amount).div(new BigNumber(`1e${tval}`))
        return tt
    }, [web3Provider, assertValidAddress])

    const D2A = useCallback(async (addr, amount) => {
        const web3 = web3Provider;
        const toBN = web3.utils.toBN;
        assertValidAddress(addr)
        const erc20 = new web3.eth.Contract(ERC20_abi.abi, addr);
        let tval = await erc20.methods.decimals().call();
        tval = new BigNumber(amount).times(new BigNumber(`1e${tval}`))
        return toBN(tval.toFixed(0));
    }, [web3Provider, assertValidAddress])

    const balanceOf = useCallback(async (token, address) => {
        const web3 = web3Provider;

        assertValidAddress(token)
        const tokenContract = new web3.eth.Contract(ERC20_abi.abi, token);
        let ret = await tokenContract.methods.balanceOf(address).call();

        return await A2D(token, ret)
    }, [A2D, web3Provider, assertValidAddress])

    const balanceETH = useCallback(async (address) => {
        const web3 = web3Provider;

        assertValidAddress(address)
        const ret = await web3.eth.getBalance(address)

        return web3.utils.fromWei(ret)
    }, [web3Provider, assertValidAddress])

    const getTokenApprovedAmount = useCallback(async (token, owner, spender) => {
        const web3 = web3Provider;

        assertValidAddress(token)
        const tokenContract = new web3.eth.Contract(ERC20_abi.abi, token);
        let ret = await tokenContract.methods.allowance(owner, spender).call();

        return await A2D(token, ret)
    }, [A2D, web3Provider, assertValidAddress])

    const approveToken = useCallback(async (token, spender) => {
        const web3 = window.web3;

        assertValidAddress(token)
        const tokenContract = new web3.eth.Contract(ERC20_abi.abi, token);
        let tx = await makeTx(token, tokenContract.methods.approve(spender, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'));

        return tx;
    }, [makeTx, assertValidAddress])

    const transferOwnership = useCallback(async (ownable, newOwner) => {
        const web3 = window.web3;

        assertValidAddress(ownable)
        const ownableContract = new web3.eth.Contract(Nova_abi.abi, ownable);
        let tx = await makeTx(ownable,
            ownableContract.methods.transferOwnership(newOwner));

        return tx;
    }, [makeTx, assertValidAddress])

    const renounceOwnership = useCallback(async (ownable) => {
        const web3 = window.web3;

        assertValidAddress(ownable)
        const ownableContract = new web3.eth.Contract(Nova_abi.abi, ownable);
        let tx = await makeTx(ownable,
            ownableContract.methods.renounceOwnership());

        return tx;
    }, [makeTx, assertValidAddress])

    const getTokenName = useCallback(async (token) => {
        const web3 = web3Provider
        assertValidAddress(token)
        const tokenContract = new web3.eth.Contract(ERC20_abi.abi, token)
        return await tokenContract.methods.name().call()
    }, [web3Provider, assertValidAddress])

    const getTokenSymbol = useCallback(async (token) => {
        const web3 = web3Provider
        assertValidAddress(token)
        const tokenContract = new web3.eth.Contract(ERC20_abi.abi, token)
        return await tokenContract.methods.symbol().call()
    }, [web3Provider, assertValidAddress])

    const getTokenDecimals = useCallback(async (token) => {
        const web3 = web3Provider
        assertValidAddress(token)
        const tokenContract = new web3.eth.Contract(ERC20_abi.abi, token)
        const decimals = await tokenContract.methods.decimals().call()
        return parseInt(decimals.toString())
    }, [web3Provider, assertValidAddress])

    const getTokenSupply = useCallback(async (token) => {
        const web3 = web3Provider
        assertValidAddress(token)
        const tokenContract = new web3.eth.Contract(ERC20_abi.abi, token)
        return await A2D(token, await tokenContract.methods.totalSupply().call())
    }, [web3Provider, A2D, assertValidAddress])

    const getOwner = useCallback(async (token) => {
        const web3 = web3Provider
        assertValidAddress(token)
        const tokenContract = new web3.eth.Contract(Nova_abi.abi, token)
        return await tokenContract.methods.owner().call()
    }, [web3Provider, assertValidAddress])

    const isAddressFormat = useCallback((addr) => {
        return web3Provider.utils.isAddress(addr)
    }, [web3Provider])

    const tokenPriceToUSDC = useCallback(async (amount) => {
        const web3 = web3Provider;

        const tokenContract = new web3.eth.Contract(Nova_abi.abi, ADDRESS[chainId].token)
        let routerAddress = await tokenContract.methods.router().call()
        const routerContract = new web3.eth.Contract(Router_abi.abi, routerAddress);
        const wethAddress = await routerContract.methods.WETH().call()

        let realVal = await D2A(ADDRESS[chainId].token, amount)

        let t2 = await routerContract.methods.getAmountsOut(realVal.toString(), [ADDRESS[chainId].token, wethAddress, ADDRESS[chainId].usdc]).call()
        return await A2D(ADDRESS[chainId].usdc, t2[t2.length - 1])
    }, [D2A, A2D, web3Provider, chainId])

    const firePit = useCallback(async () => {
        const web3 = web3Provider
        const tokenContract = new web3.eth.Contract(Nova_abi.abi, ADDRESS[chainId].token)
        const ret = await tokenContract.methods.firePit().call()

        return ret
    }, [web3Provider, chainId])

    const treasuryReceiver = useCallback(async () => {
        const web3 = web3Provider
        const tokenContract = new web3.eth.Contract(Nova_abi.abi, ADDRESS[chainId].token)
        const ret = await tokenContract.methods.treasuryReceiver().call()
        return ret
    }, [web3Provider, chainId])

    const insuranceReceiver = useCallback(async (address) => {
        const web3 = web3Provider
        const tokenContract = new web3.eth.Contract(Nova_abi.abi, ADDRESS[chainId].token)
        const ret = await tokenContract.methods.insuranceFundReceiver().call()
        return ret
    }, [web3Provider, chainId])

    const getCirculatingSupply = useCallback(async () => {
        const web3 = web3Provider
        const tokenContract = new web3.eth.Contract(Nova_abi.abi, ADDRESS[chainId].token)
        const ret = await tokenContract.methods.getCirculatingSupply().call()

        let ts = await A2D(ADDRESS[chainId].token, ret)
        let faddress = await firePit()
        let fb = await balanceOf(ADDRESS[chainId].token, faddress)

        return ts.minus(fb)
    }, [web3Provider, A2D, firePit, balanceOf, chainId])

    const lastRebasedTime = useCallback(async () => {
        const web3 = web3Provider
        const tokenContract = new web3.eth.Contract(Nova_abi.abi, ADDRESS[chainId].token)
        const ret = await tokenContract.methods.lastRebasedTime().call()
        return parseInt(ret.toString());
    }, [web3Provider, chainId])

    const initRebaseTime = useCallback(async () => {
        const web3 = web3Provider
        const tokenContract = new web3.eth.Contract(Nova_abi.abi, ADDRESS[chainId].token)
        const ret = await tokenContract.methods.initRebaseStartTime().call()
        return parseInt(ret.toString());
    }, [web3Provider, chainId])

    const getPoolBalance = useCallback(async () => {
        const web3 = web3Provider

        const tokenContract = new web3.eth.Contract(Nova_abi.abi, ADDRESS[chainId].token)
        let pairAddress = await tokenContract.methods.pair().call()
        const pairContract = new web3.eth.Contract(Pair_abi.abi, pairAddress);
        let tval = await pairContract.methods.getReserves().call()
        let token0 = await pairContract.methods.token0().call()

        if (token0.toLowerCase() === ADDRESS[chainId].token.toLowerCase()) {
            return await A2D(ADDRESS[chainId].token, tval[0].toString())
        } else {
            return await A2D(ADDRESS[chainId].token, tval[1].toString())
        }
    }, [web3Provider, A2D, chainId])

    const getRebaseRate = useCallback(async () => {
        const web3 = web3Provider
        const tokenContract = new web3.eth.Contract(Nova_abi.abi, ADDRESS[chainId].token)
        const rebaseEnabled = await tokenContract.methods.autoRebase().call()
        if (rebaseEnabled !== true) return 0

        const ret = await tokenContract.methods.rebaseRate().call()
        const rd = await tokenContract.methods.RATE_DECIMALS().call()

        return parseInt(ret.toString()) / Math.pow(10, parseInt(rd.toString()))
    }, [web3Provider, chainId])

    const getRebasePeriod = useCallback(async () => {
        const web3 = web3Provider
        const tokenContract = new web3.eth.Contract(Nova_abi.abi, ADDRESS[chainId].token)
        const ret = await tokenContract.methods.rebasePeriod().call()
        return parseInt(ret.toString())
    }, [web3Provider, chainId])

    const getMaxTokenPerWallet = useCallback(async () => {
        const web3 = web3Provider

        const tokenContract = new web3.eth.Contract(Nova_abi.abi, ADDRESS[chainId].token)
        let ret = await tokenContract.methods.getMaxTokenPerWallet().call()

        return await A2D(ADDRESS[chainId].token, ret);
    }, [web3Provider, A2D, chainId])

    const getOverviewOf = useCallback(async () => {
        const web3 = web3Provider;

        const tokenContract = new web3.eth.Contract(Nova_abi.abi, ADDRESS[chainId].token);
        let ret = await tokenContract.methods.getOverviewOf(wallet.address).call()

        return [await A2D(ADDRESS[chainId].token, ret[3]), await A2D(ADDRESS[chainId].token, ret[4])]
    }, [web3Provider, A2D, chainId, wallet.address])

    const isFeeExempt = useCallback(async () => {
        const web3 = web3Provider;

        const tokenContract = new web3.eth.Contract(Nova_abi.abi, ADDRESS[chainId].token);
        return await tokenContract.methods.isFeeExempt(wallet.address).call()
    }, [web3Provider, chainId, wallet.address])

    const ethAmountByUSDC = useCallback(async (amount) => {
        const web3 = web3Provider
        const routerContract = new web3.eth.Contract(Router_abi.abi, ADDRESS[chainId].router)
        const wethAddress = await routerContract.methods.WETH().call()

        let tval = await routerContract.methods.getAmountsOut(web3.utils.toWei(amount.toString()), [wethAddress, ADDRESS[chainId].usdc]).call()

        const ret = await A2D(ADDRESS[chainId].usdc, tval[tval.length - 1].toString())
        return ret
    }, [chainId, A2D, web3Provider])

    const wethBalanceByUSDC = useCallback(async (account) => {
        const balance = await balanceETH(account)

        if (BigNumber(balance).eq(0)) return new BigNumber(0)
        return await ethAmountByUSDC(balance)
    }, [balanceETH, ethAmountByUSDC, web3Provider])

    const getTotalBalanceInRewards = useCallback(async () => {
        const web3 = web3Provider

        const rewardContract = new web3.eth.Contract(Dividend_abi.abi, ADDRESS[chainId].dividend)
        let ret = await rewardContract.methods.totalShares().call()

        return await A2D(ADDRESS[chainId].token, ret)
    }, [web3Provider, A2D, chainId])

    const getTotalRewards = useCallback(async () => {
        const web3 = web3Provider

        const rewardContract = new web3.eth.Contract(Dividend_abi.abi, ADDRESS[chainId].dividend)
        let ret = await rewardContract.methods.totalDividends().call()

        return web3.utils.fromWei(ret)
    }, [web3Provider, chainId])

    const getTotalDistributed = useCallback(async () => {
        const web3 = web3Provider

        const rewardContract = new web3.eth.Contract(Dividend_abi.abi, ADDRESS[chainId].dividend)
        let ret = await rewardContract.methods.totalDistributed().call()

        return web3.utils.fromWei(ret)
    }, [web3Provider, chainId])

    const getElapsedTimeFromLastReward = useCallback(async () => {
        const web3 = web3Provider

        const rewardContract = new web3.eth.Contract(Dividend_abi.abi, ADDRESS[chainId].dividend)
        let ret = await rewardContract.methods.getRemainingTimeToBeRewarded(wallet.address).call()

        return parseInt(ret)
    }, [web3Provider, chainId, wallet.address])

    const getRewardPeriod = useCallback(async () => {
        const web3 = web3Provider

        const rewardContract = new web3.eth.Contract(Dividend_abi.abi, ADDRESS[chainId].dividend)
        let ret = await rewardContract.methods.minPeriod().call()

        return parseInt(ret)
    }, [web3Provider, chainId])

    const getRewardedAmount = useCallback(async () => {
        const web3 = web3Provider

        const rewardContract = new web3.eth.Contract(Dividend_abi.abi, ADDRESS[chainId].dividend)
        let ret = await rewardContract.methods.shares(wallet.address).call()

        return web3.utils.fromWei(ret.totalRealised)
    }, [web3Provider, chainId, wallet.address])

    const getAmountToBeRewarded = useCallback(async () => {
        const web3 = web3Provider

        const rewardContract = new web3.eth.Contract(Dividend_abi.abi, ADDRESS[chainId].dividend)
        let ret = await rewardContract.methods.getUnpaidEarnings(wallet.address).call()

        return web3.utils.fromWei(ret)
    }, [web3Provider, chainId, wallet.address])

    const claimReward = useCallback(async () => {
        const web3 = window.web3

        const rewardContract = new web3.eth.Contract(Dividend_abi.abi, ADDRESS[chainId].dividend)
        let tx = await makeTx(ADDRESS[chainId].dividend, rewardContract.methods.claimDividend())

        return tx;
    }, [makeTx, chainId])

    const verifyContract = useCallback(async (token, templateId, creator, param) => {
        let constructorParam = buildEncodedData(["address", "bytes"], [creator, param])

        const fileContent = await (await fetch(`/contracts/Template${templateId}.sol`)).text()

        const data = {
            'apikey': walletConfig[chainId].apiKey,
            'module': 'contract',
            'action': 'verifysourcecode',
            'contractaddress': token,
            'sourceCode': fileContent,
            'codeformat': 'solidity-single-file',
            'contractname': `SafuDeployerTemplate${templateId}`,
            'compilerversion': 'v0.8.16+commit.07a7930e',
            'optimizationused': 1,
            'runs': 200,
            'evmVersion': '',
            'licenseType': 3,
            'constructorArguements': constructorParam,
        }

        const options = {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify(data),
            url: walletConfig[chainId].apiUrl
        }

        let result = await axios(options)
        return result.data
    }, [buildEncodedData, chainId])

    useEffect(() => {
        dispatch(updateChainId(walletConfig[chainId].chainId))
        dispatch(updateExplorer(walletConfig[chainId].blockUrls[0]))
        dispatch(updateRPC(walletConfig[chainId].rpcUrls[0]))

        dispatch(updateAddress(ADDRESS[chainId].token))

        let ac = new AbortController()

        getTokenName(ADDRESS[chainId].token)
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateName(r))
                }
            })
            .catch(err => {
                console.log(err)
            })

        getTokenSymbol(ADDRESS[chainId].token)
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateSymbol(r))
                }
            })
            .catch(err => {
                console.log(err)
            })

        getTokenDecimals(ADDRESS[chainId].token)
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateDecimals(r))
                }
            })
            .catch(err => {
                console.log(err)
            })

        getOwner(ADDRESS[chainId].token)
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateOwner(r))
                }
            })
            .catch(err => {
                console.log(err)
            })

        tokenPriceToUSDC(1)
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updatePrice(r.toString()))
                }
            })
            .catch(err => {
                console.log(err)
            })

        getCirculatingSupply()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateCirculatingSupply(r.toString()))
                }
            })
            .catch(err => {
                console.log(err)
            })

        lastRebasedTime()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateLastRebasedTime(r))
                }
            })
            .catch(err => {
                console.log(err)
            })

        firePit()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateFirePitAddress(r))
                }
            })
            .catch(err => {
                console.log(err)
            })

        treasuryReceiver()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateTreasuryAddress(r))
                }
            })
            .catch(err => {
                console.log(err)
            })

        insuranceReceiver()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateInsuranceReceiverAddress(r))
                }
            })
            .catch(err => {
                console.log(err)
            })

        getPoolBalance()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updatePoolBalance(r.toString()))
                }
            })
            .catch(err => {
                console.log(err)
            })

        getRebaseRate()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateRebaseRate(r))
                }
            })
            .catch(err => {
                console.log(err)
            })

        getRebasePeriod()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateRebasePeriod(r))
                }
            })
            .catch(err => {
                console.log(err)
            })

        getTokenSupply(ADDRESS[chainId].token)
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateSupply(r.toString()))
                }
            })
            .catch(err => {
                console.log(err)
            })

        initRebaseTime()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateInitRebaseTime(r.toString()))
                }
            })
            .catch(err => {
                console.log(err)
            })

        getMaxTokenPerWallet()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateMaxWallet(r.toString()))
                }
            })
            .catch(err => {
                console.log(err)
            })

        getOverviewOf()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateRemainingToBuy(r[0].toString()))
                    dispatch(updateRemainingToSell(r[1].toString()))
                }
            })
            .catch(err => {
                console.log(err)
            })

        isFeeExempt()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateFeeExempted(r))
                }
            })
            .catch(err => {
                console.log(err)
            })

        ethAmountByUSDC(1)
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateETHPrice(r.toString()))
                }
            })
            .catch(err => {
                console.log(err)
            })

        getTotalBalanceInRewards()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateTotalShare(r.toString()))
                }
            })
            .catch(err => {
                console.log(err)
            })

        getTotalRewards()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateTotalReward(r.toString()))
                }
            })
            .catch(err => {
                console.log(err)
            })

        getTotalDistributed()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateTotalDistributed(r.toString()))
                }
            })
            .catch(err => {
                console.log(err)
            })

        getElapsedTimeFromLastReward()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateSecsToReward(r))
                }
            })
            .catch(err => {
                console.log(err)
            })

        getRewardPeriod()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateRewardPeriod(r))
                }
            })
            .catch(err => {
                console.log(err)
            })

        getRewardedAmount()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateRewardedAmount(r.toString()))
                }
            })
            .catch(err => {
                console.log(err)
            })

        getAmountToBeRewarded()
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateUnpaidAmount(r.toString()))
                }
            })
            .catch(err => {
                console.log(err)
            })

        balanceOf(ADDRESS[chainId].token, wallet.address)
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateBalance(r.toString()))
                }
            })
            .catch(err => {
                console.log(err)
            })

        return () => ac.abort()
    }, [dispatch, chainId, getTokenName, getTokenSymbol, getTokenDecimals, getOwner,
        tokenPriceToUSDC, getCirculatingSupply, lastRebasedTime, firePit, treasuryReceiver,
        insuranceReceiver, getPoolBalance, getRebaseRate, getRebasePeriod, getTokenSupply,
        initRebaseTime, getMaxTokenPerWallet, getOverviewOf, isFeeExempt, ethAmountByUSDC,
        getTotalBalanceInRewards, getTotalRewards, getTotalDistributed, getElapsedTimeFromLastReward,
        getRewardPeriod, getRewardedAmount, getAmountToBeRewarded, wallet.address, reloadCounter])

    useEffect(() => {
        let ac = new AbortController()
        wethBalanceByUSDC(treasuryAddress)
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateTreasuryUSDC(r.toString()))
                }
            })
            .catch(err => {
                console.log(`${err.message}`)
            })

        wethBalanceByUSDC(insuranceReceiverAddress)
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateInsuranceReceiverUSDC(r.toString()))
                }
            })
            .catch(err => {
                console.log(`${err.message}`)
            })

        balanceOf(ADDRESS[chainId].token, firePitAddress)
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateFirePitBalance(r))
                }
            })
            .catch(err => {
                console.log(`${err.message}`)
            })

        balanceOf(ADDRESS[chainId].token, treasuryAddress)
            .then(r => {
                if (ac.signal.aborted === false) {
                    dispatch(updateTreasuryBalance(r))
                }
            })
            .catch(err => {
                console.log(`${err.message}`)
            })
        return () => ac.abort()
    }, [reloadCounter, dispatch, chainId, treasuryAddress, insuranceReceiverAddress, firePitAddress, wethBalanceByUSDC, balanceOf])

    return (
        <ContractContext.Provider value={{
            reloadCounter, refreshPages, makeTx, makeTxWithNativeCurrency,
            A2D, D2A, balanceOf, getTokenApprovedAmount, approveToken, balanceETH,
            transferOwnership, renounceOwnership,
            getTokenName, getTokenSymbol, getTokenSupply, getOwner, isAddressFormat, buildEncodedData,
            verifyContract, tokenPriceToUSDC, getCirculatingSupply, lastRebasedTime, firePit, treasuryReceiver,
            insuranceReceiver, getPoolBalance, getRebaseRate, getRebasePeriod, wethBalanceByUSDC,
            claimReward
        }}>
            {props.children}
        </ContractContext.Provider>
    )
}

export const useContract = () => {
    const contractManager = useContext(ContractContext)
    return contractManager || [{}, async () => { }]
}
