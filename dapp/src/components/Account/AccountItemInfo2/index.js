import React from 'react'

import {
  AccountItemInfo2Container
} from './styles'

export const AccountItemInfo2 = (props) => {

  const {label, detail} = props;

  return (
    <AccountItemInfo2Container>
      <div className='di-label'>{label}</div>
      <div className='di-detail'>{detail}</div>
    </AccountItemInfo2Container>
  )
}
