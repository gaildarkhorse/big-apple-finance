import React from 'react'

import {
  AccountItemInfoContainer
} from './styles'

export const AccountItemInfo = (props) => {

  const {label, text, detail} = props;

  return (
    <AccountItemInfoContainer>
      <div className='di-label'>{label}</div>
      <div className='di-text'>{text}</div>
      <div className='di-detail'>{detail}</div>
    </AccountItemInfoContainer>
  )
}
