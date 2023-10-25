const assert = require("assert");
const BN = require('bignumber.js')
const fs = require('fs')

const { checkGetFail, checkTransactionFailed, checkTransactionPassed, advanceTime, advanceBlock, takeSnapshot, revertToSnapShot, advanceTimeAndBlock } = require("./lib/utils.js");
const { maxUint256, PancakeRouter, PancakeFactory, PancakePair, DividendDistributor, Nova } = require('../migrations/lib/const')

const { setWeb3 } = require('../migrations/lib/deploy')
const deployParams = require('../migrations/deploy-localhost.json');

let errorMessages = {
    alreadySet: 'Already Set',
    insufficientAllowance: 'ERC20: insufficient allowance',
    notLocked: 'Not Locked',
    notExpired: 'Not Expired'
}

const BN2Decimal = (t, decimal) => {
    if (decimal === undefined) decimal = 18
    return BN(t).div(BN(`1e${decimal}`)).toString()
}

contract("Nova", accounts => {
    let tokenContract
    let routerContract
    let wethAddress
    let treasuryAddress
    let tokenDecimals
    let maxWallet
    let maxBuyPerDay
    let maxSellPerDay

    let user1 = accounts[1]
    let user2 = accounts[2]
    let user3 = accounts[3]

    let oneTimeBuy = new BN('12000000')

    before (async () => {
        let routerInfo = deployParams.find(t => t.name === "PancakeRouter")
        let wbnbInfo = deployParams.find(t => t.name === 'WBNB')
        let tokenInfo = deployParams.find(t => t.name === 'Nova')

        wethAddress = wbnbInfo.imple
        tokenContract = await Nova.at(tokenInfo.imple)
        routerContract = await PancakeRouter.at(routerInfo.imple)
        treasuryAddress = await tokenContract.treasuryReceiver()
        tokenDecimals = parseInt((await tokenContract.decimals()).toString())

        maxWallet = await tokenContract.getMaxTokenPerWallet()
        maxBuyPerDay = await tokenContract.getTimeframeQuotaIn()
        maxSellPerDay = await tokenContract.getTimeframeQuotaOut()

        setWeb3(web3)
    })

    it ("Adding to the liquidity", async () => {
        await tokenContract.approve(routerContract.address, maxUint256, {from: treasuryAddress})
        await routerContract.addLiquidityETH(tokenContract.address, '1000000000', 0, 0, treasuryAddress, '0xffffffff', {from: treasuryAddress, value: web3.utils.toWei('1000')})

        let pair = await tokenContract.pair()
        const pairContract = await PancakePair.at(pair)
        let res = await pairContract.getReserves()
        let token0 = await pairContract.token0()

        let tokenIndex = 1
        let ethIndex = 0
        if (token0.toLowerCase() === tokenContract.address.toLowerCase()) {
            tokenIndex = 0
            ethIndex = 1
        }

        console.log('Pair', BN2Decimal(res[tokenIndex].toString(), tokenDecimals.toString()), web3.utils.fromWei(res[ethIndex].toString()))
    })

    const tokenBalance = async (w) => {
        let bal = await tokenContract.balanceOf(w)
        return BN2Decimal(bal.toString(), tokenDecimals)
    }

    const ethBalance = async (w) => {
        let bal = await web3.eth.getBalance(w)
        return web3.utils.fromWei(bal)
    }

    it ("Buying tokens", async () => {
        console.log('max wallet', BN2Decimal(maxWallet.toString(), tokenDecimals))
        console.log('max buy per day', BN2Decimal(maxBuyPerDay.toString(), tokenDecimals))
        console.log('max sell per day', BN2Decimal(maxSellPerDay.toString(), tokenDecimals))

        let info = await tokenContract.getOverviewOf(user1)
        console.log(">>> user1's overview now")
        console.log('now', parseInt(info[5].toString()))
        console.log('reset at', parseInt(info[0].toString()))
        console.log('buy amount remainning', BN2Decimal(info[3].toString(), tokenDecimals))
        console.log('sell amount remainning', BN2Decimal(info[4].toString(), tokenDecimals))
        console.log('user1 balance', await tokenBalance(user1))
        console.log('firePit balance', await tokenBalance(await tokenContract.firePit()))
        console.log('self balance', await tokenBalance(tokenContract.address))
        console.log('autoLiquidityReceiver balance', await tokenBalance(await tokenContract.autoLiquidityReceiver()))

        let ta = await routerContract.getAmountsOut(oneTimeBuy.toString(), [tokenContract.address, wethAddress])
        await routerContract.swapExactETHForTokensSupportingFeeOnTransferTokens(0, [wethAddress, tokenContract.address], user1, '0xffffffff', {from: user1, value: ta[ta.length - 1].toString()})

        info = await tokenContract.getOverviewOf(user1)
        console.log(">>> user1's overview after buying", BN2Decimal(oneTimeBuy.toString(), tokenDecimals))
        console.log('now', parseInt(info[5].toString()))
        console.log('reset at', parseInt(info[0].toString()))
        console.log('buy amount remainning', BN2Decimal(info[3].toString(), tokenDecimals))
        console.log('sell amount remainning', BN2Decimal(info[4].toString(), tokenDecimals))
        console.log('user1 balance', await tokenBalance(user1))
        console.log('firePit balance', await tokenBalance(await tokenContract.firePit()))
        console.log('self balance', await tokenBalance(tokenContract.address))
        console.log('autoLiquidityReceiver balance', await tokenBalance(await tokenContract.autoLiquidityReceiver()))
    })

    it ("user2 and user3 buy", async () => {
        console.log('firePit balance', await tokenBalance(await tokenContract.firePit()))
        console.log('self balance', await tokenBalance(tokenContract.address))
        console.log('autoLiquidityReceiver balance', await tokenBalance(await tokenContract.autoLiquidityReceiver()))

        let ta = await routerContract.getAmountsOut(oneTimeBuy.toString(), [tokenContract.address, wethAddress])
        await routerContract.swapExactETHForTokensSupportingFeeOnTransferTokens(0, [wethAddress, tokenContract.address], user2, '0xffffffff', {from: user2, value: ta[ta.length - 1].toString()})

        ta = await routerContract.getAmountsOut(oneTimeBuy.toString(), [tokenContract.address, wethAddress])
        await routerContract.swapExactETHForTokensSupportingFeeOnTransferTokens(0, [wethAddress, tokenContract.address], user3, '0xffffffff', {from: user3, value: ta[ta.length - 1].toString()})

        console.log('firePit balance', await tokenBalance(await tokenContract.firePit()))
        console.log('self balance', await tokenBalance(tokenContract.address))
        console.log('autoLiquidityReceiver balance', await tokenBalance(await tokenContract.autoLiquidityReceiver()))
    })

    it ("distribution of ETH", async () => {
        console.log('treasury ETH', await ethBalance(await tokenContract.treasuryReceiver()))
        console.log('dev ETH', await ethBalance(await tokenContract.devAddress()))
        console.log('insurance ETH', await ethBalance(await tokenContract.insuranceFundReceiver()))
        console.log('reflection ETH', await ethBalance(await tokenContract.distributorAddress()))
        console.log('user1 ETH', await ethBalance(user1))
        console.log('user2 ETH', await ethBalance(user2))
        console.log('user3 ETH', await ethBalance(user3))

        await tokenContract.transfer(accounts[9], '1000000', {from: treasuryAddress})

        console.log('treasury ETH', await ethBalance(await tokenContract.treasuryReceiver()))
        console.log('dev ETH', await ethBalance(await tokenContract.devAddress()))
        console.log('insurance ETH', await ethBalance(await tokenContract.insuranceFundReceiver()))
        console.log('reflection ETH', await ethBalance(await tokenContract.distributorAddress()))

        await advanceTimeAndBlock(3601);

        await tokenContract.transfer(accounts[9], '1000000', {from: treasuryAddress})

        console.log('user1 ETH', await ethBalance(user1))
        console.log('user2 ETH', await ethBalance(user2))
        console.log('user3 ETH', await ethBalance(user3))
    })

    it("rebase", async () => {
        await tokenContract.setAutoRebase(true)
        console.log('user1 balance', await tokenBalance(user1))
        await advanceTimeAndBlock(86400)
        await tokenContract.transfer(user3, '100000', {from: user2})
        console.log('user1 balance', await tokenBalance(user1))
    })
})
