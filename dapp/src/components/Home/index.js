import React, { useState } from 'react'

import {
  HomeContainer
} from './styles'

import { SideBar } from '../SideBar'
import { RightPane } from '../RightPane'
import { useWindowSize } from '../../hooks/useWindowSize'
import StarryGalaxy from './StarryGalaxy'

export const Home = (props) => {
  const w = useWindowSize()

  const [sideBarVisible, setSideBarVisible] = useState(false);

  const handleSideBarShow = () => {
    if (w.width < 864) {
      setSideBarVisible(t => !t);
    }
  }

  return (
    <HomeContainer>
      <StarryGalaxy />
      <SideBar visible={sideBarVisible} close={() => setSideBarVisible(false)}/>
      <RightPane handleSideBarShow={handleSideBarShow}/>
    </HomeContainer>
  )
}
