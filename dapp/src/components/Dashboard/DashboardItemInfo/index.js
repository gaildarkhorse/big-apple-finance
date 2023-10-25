import React from 'react'

import {
  DashboardItemInfoContainer
} from './styles'

export const DashboardItemInfo = (props) => {

  const {label, detail, ww} = props;

  return (
    <DashboardItemInfoContainer base={ww} {...props}>
      <div className='di-label'>{label}</div>
      <div className='di-detail'>{detail}</div>
    </DashboardItemInfoContainer>
  )
}
