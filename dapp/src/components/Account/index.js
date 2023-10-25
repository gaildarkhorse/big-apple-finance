import React, { useState, useEffect, useCallback } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid, regular, brands, icon } from '@fortawesome/fontawesome-svg-core/import.macro'

import {
  AccountContainer
} from './styles'

import { AccountItemInfo } from './AccountItemInfo'
import { AccountItemInfo2 } from './AccountItemInfo2'
import { useContract } from '../../contexts/ContractContext'
import { useGlobal } from '../../contexts/GlobalContext'
import useToast from '../../hooks/useToast'
import { SmallButton } from '../SmallButton'
import { useSelector } from 'react-redux'
import BN from 'bignumber.js'
import { useCustomWallet } from '../../contexts/WalletContext'

export const Account = (props) => {
  const { stringFormat, cutDecimal } = useGlobal()
  const { wallet } = useCustomWallet()
  const { showLoading, hideLoading, toastSuccess, toastError } = useToast()
  const { symbol, price: tokenPrice, lastRebasedTime: lastRebased, initRebaseTime: initRebasedOrg,
    balance: myBalance, maxWallet: maxTokenPerWallet, remToBuy: remainingToReceive,
    remToSell: remainingToSend, isFeeExempt: exempt, ethPrice, rebasePeriod, rebaseRate, owner } = useSelector(state => state.token)

  const { totalShare: allInRewards, totalReward: totalRewards, totalDistributed: rewardDistributed,
    secsToReward: elapsedFromLastReward, secsNow: elapsedFromLastRewardTick,
    rewardPeriod, rewardedETH: rewardedAmount, unpaidETH: rewardAmount } = useSelector(state => state.reflection)

  const { claimReward } = useContract()

  const [remainingTime, setRemainingTime] = useState('')
  const [myBalanceUSD, setMyBalanceUSD] = useState(0)

  const [apyNow, setAPYNow] = useState(0)
  const [dailyROI, setDailyROI] = useState(0)
  const [nextRewardAmount, setNextRewardAmount] = useState(0)
  const [nextRewardAmountUSD, setNextRewardAmountUSD] = useState(0)
  const [nextRewardPercentage, setNextRewardPercentage] = useState(0)

  const [reward1Day, setReward1Day] = useState(0)
  const [reward1DayUSD, setReward1DayUSD] = useState(0)
  const [reward5Day, setReward5Day] = useState(0)
  const [reward5DayUSD, setReward5DayUSD] = useState(0)

  const [rewardRate5Days, setRewardRate5Days] = useState(0)

  const [totalRewardsUSD, setTotalRewardsUSD] = useState(0)
  const [rewardDistributedUSD, setRewardDistributedUSD] = useState(0)

  const [curFromLastReward, setCurFromLastReward] = useState(0)
  const [rewardedAmountUSD, setRewardedAmountUSD] = useState(0)
  const [rewardAmountUSD, setRewardAmountUSD] = useState(0)

  useEffect(() => {
    setMyBalanceUSD(BN(tokenPrice).times(BN(myBalance)).toString())
  }, [myBalance, tokenPrice])

  useEffect(() => {
    setNextRewardAmountUSD(BN(tokenPrice).times(BN(nextRewardAmount)).toString())
  }, [nextRewardAmount, tokenPrice])

  useEffect(() => {
    setReward1DayUSD(BN(tokenPrice).times(BN(reward1Day)).toString())
  }, [reward1Day, tokenPrice])

  useEffect(() => {
    setReward5DayUSD(BN(tokenPrice).times(BN(reward5Day)).toString())
  }, [reward5Day, tokenPrice])

  useEffect(() => {
    setTotalRewardsUSD(BN(ethPrice).times(BN(totalRewards)).toString())
  }, [totalRewards, ethPrice])

  useEffect(() => {
    setRewardDistributedUSD(BN(ethPrice).times(BN(rewardDistributed)).toString())
  }, [rewardDistributed, ethPrice])

  useEffect(() => {
    setRewardedAmountUSD(BN(ethPrice).times(BN(rewardedAmount)).toString())
  }, [rewardedAmount, ethPrice])

  useEffect(() => {
    setRewardAmountUSD(BN(ethPrice).times(BN(rewardAmount)).toString())
  }, [rewardAmount, ethPrice])

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

        // console.log('-----------', tickNow, tt);

        t1 = tt / 60;
        let minutes = ~~t1;
        let seconds = tt - minutes * 60;

        setRemainingTime(`00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)

        let tgap = elapsedFromLastReward;
        if (elapsedFromLastReward < 0 || elapsedFromLastReward > 1000000) {
          setCurFromLastReward('Never Rewarded');
        } else {
          let ht = (now - elapsedFromLastRewardTick) + tgap;

          let hour = ht / 3600;
          hour = ~~hour;
          tt = ht - hour * 3600;

          t1 = tt / 60;
          minutes = ~~t1;
          seconds = tt - minutes * 60;

          setCurFromLastReward(`${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
        }

        let _rebaseRate = 0;
        if (now > initRebasedOrg + 7 * 365 * 24 * 86400) {
          _rebaseRate = 2;
        } else if (now >= initRebasedOrg + (15 * 365 * 24 * 86400 / 10)) {
          _rebaseRate = 14;
        } else if (now >= initRebasedOrg + 365 * 24 * 86400) {
          _rebaseRate = 211;
        } else {
          _rebaseRate = rebaseRate * 10000000;
        }

        let rebaseTimesPerDay = 96;
        if (rebasePeriod > 0) {
          rebaseTimesPerDay = 86400 / rebasePeriod;
        }

        let exp = 1 + _rebaseRate / 10000000;
        setAPYNow((Math.pow(exp, rebaseTimesPerDay * 365) - 1) * 100);
        setDailyROI((Math.pow(exp, rebaseTimesPerDay) - 1) * 100);

        setNextRewardAmount(myBalance * (exp - 1));
        setNextRewardPercentage((exp - 1) * 100);

        setReward1Day((Math.pow(exp, rebaseTimesPerDay) - 1) * myBalance);
        setReward5Day((Math.pow(exp, rebaseTimesPerDay * 5) - 1) * myBalance);

        setRewardRate5Days((Math.pow(exp, rebaseTimesPerDay * 5) - 1) * 100)

        setTimeout(() => recursive_run(ac), 1000);
      }
    }

    recursive_run(ac);

    return () => ac.abort();
  }, [lastRebased, rebasePeriod, rebaseRate, initRebasedOrg, elapsedFromLastReward, elapsedFromLastRewardTick, myBalance])

  const handleClaim = useCallback(() => {
    if (BN(rewardAmount).eq(0)) {
      toastError('Claim', 'Nothing to claim')
      return
    }

    showLoading(`Claiming "${rewardAmount.toFixed(5)} ETH"...`)
    claimReward()
      .then(() => {
        hideLoading();
        toastSuccess('Claim', 'Rewarded successfully')
      })
      .catch(e => {
        hideLoading();
        toastError('Claim', `${e.message}`)
      })
  }, [rewardAmount, toastError, showLoading, claimReward, hideLoading, toastSuccess,])

  return (
    <AccountContainer>
      <div className='top-frame'>
        <div className='summary-frame'>
          <div className='p3-frame info-frame'>
            <AccountItemInfo label='Your Balance' text={`$${stringFormat(cutDecimal(myBalanceUSD, 2))}`} detail={`${stringFormat(cutDecimal(myBalance, 4))} ${symbol}`} ww='30%' />
          </div>
          <div className='p3-frame info-frame'>
            < AccountItemInfo label='APY' text={`${stringFormat(apyNow.toFixed(2))}%`} detail={`Daily ROI ${stringFormat(cutDecimal(dailyROI, 3))}%`} ww='30%' />
          </div>
          <div className='p3-frame info-frame'>
            <AccountItemInfo label='Next Rebase' text={`${remainingTime}`} detail='You will earn money soon' ww='30%' />
          </div>
        </div>

        <div className='summary-frame-col info-frame'>
          <AccountItemInfo2 label='Max wallet limit' detail={exempt === true ? 'INFINITE' : `${stringFormat(cutDecimal(maxTokenPerWallet, 2))} ${symbol}`} />
          <AccountItemInfo2 label='Remaining to receive' detail={exempt === true ? 'INFINITE' : `${stringFormat(cutDecimal(remainingToReceive, 2))} ${symbol}`} />
          <AccountItemInfo2 label='Remaining to send' detail={exempt === true ? 'INFINITE' : `${stringFormat(cutDecimal(remainingToSend, 2))} ${symbol}`} />
        </div>

        <div className='summary-frame-col info-frame'>
          <AccountItemInfo2 label={`Current ${symbol} Price`} detail={`$${stringFormat(cutDecimal(tokenPrice, 6))}`} />
          <AccountItemInfo2 label='Next Reward Amount' detail={`${stringFormat(cutDecimal(nextRewardAmount, 4))} ${symbol}`} />
          <AccountItemInfo2 label='Next Reward Amount USD' detail={`$${stringFormat(cutDecimal(nextRewardAmountUSD, 6))}`} />
          <AccountItemInfo2 label='Next Reward Yield' detail={`${stringFormat(cutDecimal(nextRewardPercentage, 6))}%`} />
          <AccountItemInfo2 label='ROI(1-Day Rate) USD' detail={`$${stringFormat(cutDecimal(reward1DayUSD, 6))}`} />
          <AccountItemInfo2 label='ROI(5-Day Rate)' detail={`${stringFormat(cutDecimal(rewardRate5Days, 4))}%`} />
          <AccountItemInfo2 label='ROI(5-Day Rate) USD' detail={`$${stringFormat(cutDecimal(reward5DayUSD, 3))}`} />
        </div>

        <div className='reflection-frame'>
          <div className='reflection-caption'>Reflection In ETH</div>
          <SmallButton buttonImage={<FontAwesomeIcon icon={icon({name: 'coins', style: 'solid'})}/>} caption={'Claim'} handleClick={handleClaim} />
        </div>
        <div className='summary-frame-col info-frame'>
          {
            (owner?.toLowerCase() === wallet.address.toLowerCase()) &&
              <AccountItemInfo2 label='All In Rewards' detail={`${stringFormat(cutDecimal(allInRewards, 4))} ${symbol}`} />
          }
          <AccountItemInfo2 label='Total Rewards' detail={`$${stringFormat(cutDecimal(totalRewardsUSD, 3))}`} />
          <AccountItemInfo2 label='Distributed Rewards' detail={`$${stringFormat(cutDecimal(rewardDistributedUSD, 3))}`} />
          <AccountItemInfo2 label='From Last Reward' detail={`${curFromLastReward}`} />
          <AccountItemInfo2 label='Reward Period' detail={`${rewardPeriod} seconds`} />
          <AccountItemInfo2 label='Rewarded so far' detail={`$${stringFormat(cutDecimal(rewardedAmountUSD, 3))}`} />
          <AccountItemInfo2 label='To be rewarded' detail={`$${stringFormat(cutDecimal(rewardAmountUSD, 3))}`} />
        </div>
      </div>
    </AccountContainer>
  )
}
