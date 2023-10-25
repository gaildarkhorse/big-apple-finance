import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid, regular, brands, icon } from '@fortawesome/fontawesome-svg-core/import.macro'

import {
  SideBarContainer
} from './styles'

import LogoPNG from '../../assets/images/mark.png'

import {
  DashboardSVG,
  AccountSVG,
  SwapSVG,
  DocsSVG,
  TwitterSVG,
  TelegramSVG,
} from '../SvgIcons'

import { MenuItem } from './MenuItem'
import { useCustomWallet } from '../../contexts/WalletContext'
import { useWindowSize } from '../../hooks/useWindowSize'
import { useSelector } from 'react-redux'

export const SideBar = (props) => {
  const selectedChainId = useSelector(state => state.chain.chainId)
  const currentTokenAddress = useSelector(state => state.token.address)
  const explorerURL = useSelector(state => state.chain.explorer)
  
  const w = useWindowSize();
  const { visible, close } = props;

  const thisInst = useRef();

  const { isLoggedIn } = useCustomWallet();
  const [selectMenu, setSelectMenu] = useState(0);

  const handleClick = (t) => {
    setSelectMenu(t);

    if (w.width < 864) {
      close && close();
    }
  }

  const handleClickOutside = useCallback((e) => {
    const outSideMenu = !thisInst.current?.contains(e.target)

    if (outSideMenu && w.width < 864 && thisInst.current?.offsetLeft === 0) {
      close && close();
    }
  }, [close, w.width])

  useEffect(() => {
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [handleClickOutside])

  return (
    <SideBarContainer show={visible === true? '1': '0'} ref={thisInst}>
      <div className='logo-frame'>
        <img src={LogoPNG} alt='' width='80px' />
      </div>
      {
        <a href={`${explorerURL}address/${currentTokenAddress}`} rel='noreferrer' className='account-frame' target='_blank'>{currentTokenAddress.slice(0, 6) + '...' + currentTokenAddress.slice(-5)}</a>
      }

      <MenuItem icon={<FontAwesomeIcon icon={icon({name: 'person-chalkboard', style: 'solid'})}/>} text='Dashboard' link='/dashboard' handleClick={() => handleClick(1)} selected={selectMenu === 1}/>
      <MenuItem icon={<FontAwesomeIcon icon={icon({name: 'users', style: 'solid'})}/>} text='Account' link='/account' handleClick={() => handleClick(2)} selected={selectMenu === 2}/>
      {/* <MenuItem icon={<SwapSVG width='17px' height='19px' />} text='NovaSwap' link='/novaswap' handleClick={() => handleClick(3)} selected={selectMenu === 3}/> */}
      <MenuItem icon={<FontAwesomeIcon icon={icon({name: 'rotate', style: 'solid'})}/>} text='SushiSwap' link={`https://app.sushi.com/swap?inputCurrency=${currentTokenAddress}&outputCurrency=ETH&chainId=${selectedChainId}`} external handleClick={() => handleClick(4)} selected={selectMenu === 4}/>
      <MenuItem icon={<FontAwesomeIcon icon={icon({name: 'book-open', style: 'solid'})}/>} text='Docs' link='https://nova-finance-arbitrum.gitbook.io/nova-finance/' external handleClick={() => handleClick(5)} selected={selectMenu === 5}/>

      <div className='footer-frame'>
        <MenuItem icon={<TwitterSVG width='28px' height='28px' />} link='https://twitter.com/Nova_Finance_' external small handleClick={() => handleClick(0)}/>
        <MenuItem icon={<TelegramSVG width='24px' height='24px' />} link='https://t.me/Nova_Fi' external small handleClick={() => handleClick(0)}/>
      </div>
    </SideBarContainer>
  )
}
