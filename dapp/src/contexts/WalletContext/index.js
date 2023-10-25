import React from 'react'
// import { isMobile } from 'react-device-detect'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import Web3 from 'web3'

import walletConfig from './config';
import { useGlobal } from '../GlobalContext';

export const WalletContext = createContext();

const Web3Modal = window.Web3Modal?.default;
const WalletConnectProvider = window.WalletConnectProvider?.default;
// const EvmChains = window.EvmChains;
// const Fortmatic = window.Fortmatic;

export const WalletProvider = (props) => {
    const { chainId } = useGlobal()

    const [wallet, setWallet] = useState({
        address: '',
        chainId: 0
    });

    const configuredChainId = useMemo(() => parseInt(walletConfig[chainId].chainId, 16), [chainId])

    const initWeb3 = useCallback(() => {
        let web3Modal

        if (Web3Modal) {
            const providerOptions = {
                walletconnect: {
                    package: WalletConnectProvider,
                    options: {
                        // infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
                        rpc: {
                            [configuredChainId]: walletConfig[chainId].rpcUrls[0]
                        },
                        // network: walletConfig.network,
                        bridge: "https://bridge.walletconnect.org",
                        pollingInterval: 12000
                    },
                },
                // fortmatic: {
                //     package: Fortmatic,
                //     options: {
                //       // Mikko's TESTNET api key
                //       key: "pk_test_391E26A3B43A3350"
                //     }
                // }
            };
            
            web3Modal = new Web3Modal({
                theme: "light", //"light", "dark"
                // network: walletConfig.network,
                cacheProvider: true, // optional
                providerOptions, // required
                disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
            });

            window.web3Modal = web3Modal
        }
    }, [chainId, configuredChainId])

    const connectWalletChain = useCallback(async (chainId, chainName, nativeCurrency, rpcUrls, blockExplorerUrls) => {
        let ethereum = window.ethereum;
        if (ethereum === undefined)
            return;

        try {
            await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainId }] });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            console.log("error switch chain: ", switchError);
            if (switchError.code === 4902) {
                const data = [{
                    // chainId: '0x38',
                    chainId: chainId,
                    // chainName: 'Binance Smart Chain',
                    chainName: chainName,
                    // nativeCurrency:
                    // {
                    //     name: 'BNB',
                    //     symbol: 'BNB',
                    //     decimals: 18
                    // },
                    nativeCurrency: nativeCurrency,
                    // rpcUrls: ['https://bsc-dataseed.binance.org/'],
                    rpcUrls: rpcUrls,
                    // blockExplorerUrls: ['https://bscscan.com/'],
                    blockExplorerUrls: blockExplorerUrls
                }]

                await ethereum.request({ method: 'wallet_addEthereumChain', params: data })
                    .then(() => {
                    })
                    .catch((error) => {
                        console.log('Failed to add network ', error)
                        throw error
                    })
            }
        }
    }, [])

    const connectWalletByConfig = useCallback(async () => {
        return await connectWalletChain(
            walletConfig[chainId].chainId,
            walletConfig[chainId].networkName,
            walletConfig[chainId].nativeCurrency,
            walletConfig[chainId].rpcUrls,
            walletConfig[chainId].blockUrls
        )
    }, [connectWalletChain, chainId])

    const disconnectWallet = useCallback( async () => {
        if (window.web3Modal) {
            if (window.provider) // if connected state then disconnect
            {
                // show loading...
                if (window.provider.close) await window.provider.close();
                await window.web3Modal.clearCachedProvider();
                // hide loading
                // disconnected status
                console.log('disconnected from wallet');
            }
        }
        window.web3 = undefined;
        window.provider = undefined;
        setWallet(t => {
            return {
                address: '',
                chainId: 0,
            }
        })
    }, [])

    const connectWallet = useCallback(async (w) => {
        if (window.web3Modal === undefined) return

        let provider
        let account = ''

        try { // connect
            if (w === 'injected') {
                provider = await window.web3Modal.connectTo(w);
            } else if (w === 'walletconnect') {
                provider = await window.web3Modal.connectTo(w);
            } else {
                provider = await window.web3Modal.connect();
            }
            // show loading...
            const web3 = new Web3(provider);
            account = (await web3.eth.getAccounts())[0];
            const chainId = parseInt(await web3.eth.getChainId());
            // hide loading
            window.provider = provider
            window.web3 = web3
            setWallet(t => {
                return {
                    address: account,
                    chainId: chainId
                }
            })

            // Load chain information over an HTTP API
            // const chainData = await EvmChains.getChain(chainId);

            if (chainId !== configuredChainId) {
                await connectWalletByConfig()
            }

            // connected status
            console.log('connected to', account, web3);
        } catch (e) {
            // hide loading
            console.log("Could not get a wallet connection", e);
            return;
        }

        // Subscribe to accounts change
        provider.on("accountsChanged", async (accounts) => {
            // account changed
            if (accounts.length > 0) {
                setWallet(t => {
                    return {
                        ...t,
                        address: accounts[0]
                    }
                })
            } else {
                await disconnectWallet()
            }
            console.log("account ->", accounts)
        });

        // Subscribe to chainId change
        provider.on("chainChanged", (chainId) => {
            console.log("chainChanged -> ", chainId);
        });

        // Subscribe to networkId change
        provider.on("networkChanged", (networkId) => {
            setWallet(t => {
                return {
                    ...t,
                    chainId: parseInt(networkId)
                }
            })
            console.log("networkChanged -> ", networkId);
        });

        return account
    }, [disconnectWallet, connectWalletByConfig, configuredChainId])

    const reconnectWallet = async () => {
        if (window.web3Modal?.cachedProvider) {
            connectWallet()
        }
    }

    useEffect(() => {
        initWeb3()
        reconnectWallet()
    }, [initWeb3])

    const isLoggedIn = useCallback(() => {
        return window.web3 !== undefined && wallet.chainId === configuredChainId
    }, [wallet.chainId, configuredChainId])

    const isWrongChain = useCallback(() => {
        return wallet.address && wallet.chainId !== configuredChainId
    }, [wallet.chainId, wallet.address, configuredChainId])

    return (
        <WalletContext.Provider value={{ reconnectWallet, connectWallet, disconnectWallet, connectWalletByConfig, wallet, isLoggedIn, isWrongChain }}>
            {props.children}
        </WalletContext.Provider>
    )
}

export const useCustomWallet = () => {
    const dataManager = useContext(WalletContext)
    return dataManager || [{}, async () => { }]
}
