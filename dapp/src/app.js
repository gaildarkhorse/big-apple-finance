import React from 'react'

import ToastListener from './components/Toast'
import { Home } from './pages/Home'

export const App = () => {

  return (
    <>
      <Home />
      <ToastListener/>
    </>
  )
}
