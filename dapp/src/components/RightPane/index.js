import React, { useCallback } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid, regular, brands, icon } from '@fortawesome/fontawesome-svg-core/import.macro'

import {
  Route,
  Routes,
  useLocation
} from 'react-router-dom'

import {
  RightPaneContainer
} from './styles'

import { TransitionGroup } from 'react-transition-group'
import { SmallButton } from '../SmallButton'
import { Dashboard } from '../Dashboard'
import { Account } from '../Account'
// import { Swap } from '../Swap'
import Wallet from '../Wallet'
import useToast from '../../hooks/useToast'
import { useCustomWallet } from '../../contexts/WalletContext'
import { CSSTransition } from 'react-transition-group'
import { useSelector } from 'react-redux'

import { MetamaskSVG } from '../SvgIcons'

export const RightPane = (props) => {
  const { address, symbol, decimals } = useSelector(state => state.token)

  const { handleSideBarShow } = props;

  const location = useLocation();

  const { connectWallet, disconnectWallet, wallet, isLoggedIn } = useCustomWallet();
  const { toastError } = useToast();

  const handleAddTokenToWallet = useCallback(async () => {
    if (window.ethereum === undefined) {
      toastError('Add token', 'Not Installed Metamask')
      return;
    }

    const tokenAddress = address;
    const tokenSymbol = symbol;
    const tokenDecimals = decimals;
    const tokenImage = '';

    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      // const wasAdded = 
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: tokenAddress, // The address that the token is at.
            symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: tokenDecimals, // The number of decimals in the token
            image: tokenImage, // A string url of the token logo
          },
        },
      });

      // if (wasAdded) {
      //   await toastSuccess('Metamask', 'Token added')
      // } else {
      //   await toastError('Metamask', 'Already exists')
      // }
    } catch (error) {
      await toastError('Metamask', `${error.message}`)
    }
  }, [toastError, address, symbol, decimals])

  return (
    <RightPaneContainer>
      <div className='section-frame'>
        <div className='button-frame'>
          <div className='left-pane-button-frame'>
            <div className='left-pane-button' onClick={() => {setTimeout(() => handleSideBarShow(), 300)}}>
              <div className='mid-bar'></div>
            </div>
          </div>
          <div className='another-small-group' onClick={handleAddTokenToWallet}>
            <FontAwesomeIcon icon={icon({name: 'circle-plus', style: 'solid'})}/>
            <img src={MetamaskSVG} alt='metamask' />
          </div>
          <SmallButton buttonImage={
            isLoggedIn() === true?
              <FontAwesomeIcon icon={icon({name: 'right-from-bracket', style: 'solid'})}/>
              :
              <FontAwesomeIcon icon={icon({name: 'wallet', style: 'solid'})}/>
            }
            caption={
              isLoggedIn() === true?
              `Logout ${wallet.address.slice(0, 6) + '...' + wallet.address.slice(-5)}`
              :
              'Connect Wallet'
            }
            handleClick={() => isLoggedIn() === true ? disconnectWallet() : connectWallet()} />
        </div>
      </div>
      <div className='route-frame'>
        <TransitionGroup>
          <CSSTransition
            timeout={500}
            classNames='fade'
            key={location.key}
          >
            <div className='route-transition-element'>
              {
                isLoggedIn() === true ?
                  <Routes location={location}>
                    <Route exact path='/' element={<Dashboard />}></Route>
                    <Route exact path='/dashboard' element={<Dashboard />}></Route>
                    <Route exact path='/account' element={<Account />}></Route>
                    {/* <Route exact path='/novaswap' element={<Swap />}></Route> */}
                  </Routes>
                  :
                  <div className='wallet-connect-frame'>
                    <Wallet />
                  </div>
              }
            </div>
          </CSSTransition>
        </TransitionGroup>
      </div>
    </RightPaneContainer>
  )
}
