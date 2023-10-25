import React, { useEffect, useState } from 'react'
import BN from 'bignumber.js'

import {
  DashboardContainer
} from './styles'

import { DashboardItemInfo } from './DashboardItemInfo'
import { useGlobal } from '../../contexts/GlobalContext'
import { useSelector } from 'react-redux'

export const Dashboard = (props) => {

  const { symbol, price: tokenPrice, circulatingSupply, supply: total, lastRebasedTime: lastRebased, 
    poolBalance, firePitBalance, rebasePeriod, 
    treasuryUSDC: treasuryUSD, treasuryBalance, insuranceReceiverUSDC: insuranceBalanceUSD} = useSelector(state => state.token)

  const { stringFormat, cutDecimal } = useGlobal()

  const [marketCap, setMarketCap] = useState(0)
  const [remainingTime, setRemainingTime] = useState('')
  const [poolBalanceUSD, setPoolBalanceUSD] = useState(0)

  const [firePitBalanceUSD, setFirePitBalanceUSD] = useState(0)
  const [firePitPercentage, setFirePitPercentage] = useState(0)

  useEffect(() => {
    let ac = new AbortController();

    const recursive_run = (ac) => {
      if (ac.signal.aborted === false) {
        let now1 = (new Date()).getTime() / 1000;
        let now = ~~now1;

        let torg = now - lastRebased
        let period = rebasePeriod;
        let tt = (torg + period - 1) / period;
        let t1 = ~~tt;
        tt = t1 * period - torg;

        t1 = tt / 60;
        let minutes = ~~t1;
        let seconds = tt - minutes * 60;

        setRemainingTime(`00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)

        setTimeout(() => recursive_run(ac), 1000);
      }
    }

    recursive_run(ac);

    return () => ac.abort();
  }, [lastRebased, rebasePeriod])

  useEffect(() => {
    setMarketCap(BN(tokenPrice).times(BN(circulatingSupply)).toString())
  }, [tokenPrice, circulatingSupply])

  // useEffect(() => {
  //   setTreasuryUSD(tokenPrice * treasuryBalance);
  // }, [tokenPrice, treasuryBalance])

  useEffect(() => {
    setFirePitBalanceUSD(BN(tokenPrice).times(BN(firePitBalance)).toString())
  }, [tokenPrice, firePitBalance])

  useEffect(() => {
    setPoolBalanceUSD(tokenPrice * poolBalance);
  }, [tokenPrice, poolBalance])

  useEffect(() => {
    if (BN(total).gt(0)) {
      setFirePitPercentage(BN(firePitBalance).times(100).div(BN(total)).toString())
    } else {
      setFirePitPercentage("0");
    }
  }, [firePitBalance, total])

  return (
    <DashboardContainer>
      <div className='top-frame'>
        <div className='summary-frame info-frame'>
          <DashboardItemInfo label='Price' detail={`$${stringFormat(cutDecimal(tokenPrice, 6))}`} ww='30%' />
          <DashboardItemInfo label='Market Cap' detail={`$${stringFormat(cutDecimal(marketCap, 6))}`} ww='30%' />
          <DashboardItemInfo label='Circulating Supply' detail={`${stringFormat(cutDecimal(circulatingSupply, 3))}`} ww='30%' />
          <DashboardItemInfo label='Backed Liquidity' detail='100%' ww='30%' />
          <DashboardItemInfo label='Next Rebase' detail={remainingTime} ww='30%' emphasis/>
          <DashboardItemInfo label='Total Supply' detail={`${stringFormat(cutDecimal(total, 3))}`} ww='30%' />
        </div>

        <div className='summary-frame'>
          <div className='p2-frame info-frame'>
            <DashboardItemInfo label='Treasury Value' detail={`${stringFormat(cutDecimal(treasuryBalance, 3))} ${symbol}`} ww='auto' />
          </div>
          <div className='p2-frame info-frame'>
            <DashboardItemInfo label='Market Value of Treasury Asset' detail={`$${stringFormat(cutDecimal(treasuryUSD, 6))}`} ww='auto' />
          </div>
          <div className='p2-frame info-frame'>
            <DashboardItemInfo label='Pool Value' detail={`$${stringFormat(cutDecimal(poolBalanceUSD, 6))}`} ww='auto' />
          </div>
          <div className='p2-frame info-frame'>
            <DashboardItemInfo label='Insurance Fund Value' detail={`$${stringFormat(cutDecimal(insuranceBalanceUSD, 6))}`} ww='auto' />
          </div>

          <div className='p3-frame info-frame'>
            <DashboardItemInfo label='# Value of FirePit' detail={`${stringFormat(cutDecimal(firePitBalance, 3))} ${symbol}`} ww='auto' />
          </div>
          <div className='p3-frame info-frame'>
            <DashboardItemInfo label='$ Value of FirePit' detail={`$${stringFormat(cutDecimal(firePitBalanceUSD, 6))}`} ww='auto' />
          </div>
          <div className='p3-frame info-frame'>
            <DashboardItemInfo label='% FirePit : Supply' detail={`${stringFormat(cutDecimal(firePitPercentage, 6))}%`} ww='auto' />
          </div>
        </div>

      </div>
    </DashboardContainer>
  )
}
