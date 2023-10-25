import React from 'react'
import {
  MenuItemContainer
} from './styles'

import { Link } from 'react-router-dom';

export const MenuItem = (props) => {
  const { icon, text, link, external, small, selected, handleClick, mark } = props;

  return (
    <>
      {
        external ?
          <a href={link} target='_blank' rel='noreferrer' style={{ textDecoration: 'none' }} onClick={handleClick}>
            < MenuItemContainer small={small} colorDef={selected === true ? '#346cff' : '#eee'}>
              {icon}
              {text && <p> {text}</p>}
              {
                mark ?
                  <div className='mark-frame'>{mark}</div>
                  :
                  <></>}
            </MenuItemContainer >
          </a >
          :
          <Link to={link} style={{ textDecoration: 'none' }} onClick={handleClick}>
            <MenuItemContainer small={small} colorDef={selected === true ? '#346cff' : '#eee'}>
              {icon}
              {text && <p> {text}</p>}
              {
                mark ?
                  <div className='mark-frame'>{mark}</div>
                  :
                  <></>}
            </MenuItemContainer>
          </Link>
      }
    </>
  )
}
