import { WalletContainer } from './styles'

import { MetamaskSVG, WalletConnectSVG } from '../SvgIcons'
import { useCustomWallet } from '../../contexts/WalletContext'

const Wallet = () => {
    const { connectWallet } = useCustomWallet()
    return (
        <WalletContainer>
            <h2>connect your wallet</h2>
            <span className='description'>You may connect to the wallet of several types such as MetaMask, WalletConnect ...</span>
            <div className='wallet-frame'>
                <div className='wallet-item' onClick={() => connectWallet('injected')}>
                    <img src={MetamaskSVG} alt='metamask' width='64px'/>
                    <h3>MetaMask</h3>
                    <span>A browser extension with great flexibility.<br/>The web's most popular wallet.</span>
                </div>
                <div className='wallet-item' onClick={() => connectWallet('walletconnect')}>
                    <img src={WalletConnectSVG} alt='metamask' width='64px'/>
                    <h3>WalletConnect</h3>
                    <span>Pair with Trust, Argent, MetaMask & more.<br/>Works from any browser, without an extension.</span>
                </div>
            </div>
        </WalletContainer>
    )
}

export default Wallet