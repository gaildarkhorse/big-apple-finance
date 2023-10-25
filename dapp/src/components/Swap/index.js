import React, { useState, useEffect, useCallback } from 'react'

import {
  SwapContainer
} from './styles'

import { useContract } from '../../contexts/ContractContext'
import { useCustomWallet } from '../../contexts/WalletContext'
import useToast from '../../hooks/useToast'
import { SmallButton } from '../SmallButton'

import TokenPNG from '../../assets/images/mark.png'
import ETHPng from '../../assets/images/eth.png'
import SwapPng from '../../assets/images/swap.png'

export const Swap = (props) => {

  const { wallet } = useCustomWallet()
  const { showLoading, hideLoading, toastSuccess, toastError } = useToast();

  const { reloadCounter, tokenPriceToUSDC, balanceOf, metisPriceToUSDC, wethBalanceOf,
    getTokenApprovedAmount, refreshPages, approveToken, sellToken, buyToken } = useContract()

  const [myBalance, setMyBalance] = useState(0)
  const [myETHBalance, setMyETHBalance] = useState(0)

  const [metisPrice, setMetisPrice] = useState(0)
  const [tokenPrice, setTokenPrice] = useState(0)

  const [tokenApprovedAmount, setTokenApprovedAmount] = useState(0)
  const [showApprove, setShowApprove] = useState(0)

  const [info, setInfo] = useState('Please input the amount')
  const [txRes, setTxRes] = useState('')

  const [isSelling, setIsSelling] = useState(true)
  const [tokenAmount, setTokenAmount] = useState('')
  const [metisAmount, setMetisAmount] = useState('')

  useEffect(() => {
    let ac = new AbortController();

    tokenPriceToUSDC(1)
      .then(r => {
        if (ac.signal.aborted === false) {
          setTokenPrice(r)
        }
      })
      .catch(err => {
        console.log(`${err.message}`)
      })

    balanceOf(wallet.address)
      .then(r => {
        if (ac.signal.aborted === false) {
          setMyBalance(r);
        }
      })
      .catch(err => {
        console.log(`${err.message}`)
      })

    wethBalanceOf(wallet.address)
      .then(r => {
        if (ac.signal.aborted === false) {
          setMyETHBalance(r);
        }
      })
      .catch(err => {
        console.log(`${err.message}`)
      })

    metisPriceToUSDC(1)
      .then(r => {
        if (ac.signal.aborted === false) {
          setMetisPrice(r)
        }
      })
      .catch(err => {
        console.log(`${err.message}`)
      })

    getTokenApprovedAmount()
      .then(r => {
        if (ac.signal.aborted === false) {
          setTokenApprovedAmount(r)
        }
      })
      .catch(err => {
        console.log(`${err.message}`)
      })

    return () => ac.abort();
  }, [reloadCounter, tokenPriceToUSDC, balanceOf, wethBalanceOf, metisPriceToUSDC, getTokenApprovedAmount, wallet.address])

  useEffect(() => {
    setShowApprove(isSelling === true && myBalance > tokenApprovedAmount);
  }, [isSelling, myBalance, tokenApprovedAmount])

  const handleTokenInput = useCallback((t) => {
    setTokenAmount(t);
    if (metisPrice === 0) return;

    let am = parseFloat(t);
    let um = am * tokenPrice / metisPrice;

    if (t === '') {
      setMetisAmount('');
    } else {
      setMetisAmount(um.toString());
    }

    if (isNaN(am)) {
      setInfo('Invalid ARES token amount');
    } else if ((isSelling === true && am > myBalance) || (isSelling !== true && um > myETHBalance)) {
      setInfo('Insufficient balance');
    } else {
      setInfo('');
    }
  }, [tokenPrice, metisPrice, isSelling, myBalance, myETHBalance])

  const handleMetisInput = useCallback((t) => {
    setMetisAmount(t);
    if (tokenPrice === 0) return;

    let am = parseFloat(t);
    let um = am * metisPrice / tokenPrice;

    if (t === '') {
      setTokenAmount('');
    } else {
      setTokenAmount(um.toString());
    }

    if (isNaN(am)) {
      setInfo('Invalid METIS amount');
    } else if ((isSelling !== true && am > myETHBalance) || (isSelling === true && um > myBalance)) {
      setInfo('Insufficient balance');
    } else {
      setInfo('');
    }
  }, [tokenPrice, metisPrice, isSelling, myBalance, myETHBalance])

  const handleMyBalance = useCallback(() => {
    if (isSelling) {
      handleTokenInput(myBalance.toString());
    } else {
      handleMetisInput(myETHBalance.toString());
    }
  }, [myBalance, myETHBalance, isSelling, handleTokenInput, handleMetisInput])

  const handleApproveToken = useCallback(() => {
    showLoading(`Approving ARES for Tethys: Router...`);

    approveToken()
      .then(r => {
        setTxRes(r.transactionHash);
        refreshPages();
        toastSuccess('ARES SWAP', 'Approved Successfully');
        hideLoading();
      })
      .catch(err => {
        toastError('ARES SWAP', `${err.message}`);
        hideLoading();
      })
  }, [showLoading, approveToken, refreshPages, toastSuccess, hideLoading, toastError])

  const handleSellToken = useCallback(() => {
    if (info !== '') {
      toastError('Please fix this error first', info);
      return;
    }

    showLoading(`Selling ${tokenAmount} ARES token...`);

    sellToken(tokenAmount)
      .then(r => {
        setTxRes(r.transactionHash);
        refreshPages();
        toastSuccess('ARES SWAP', 'Sold successfully');
        hideLoading();
      })
      .catch(err => {
        toastError('ARES SWAP', `${err.message}`);
        hideLoading();
      })
  }, [toastError, showLoading, tokenAmount, sellToken, refreshPages, toastSuccess, hideLoading, info])

  const handleBuyToken = useCallback(() => {
    if (info !== '') {
      toastError('Please fix this error first', info);
      return;
    }

    showLoading(`Buying ARES token by ${metisAmount} METIS...`);

    buyToken(metisAmount)
      .then(r => {
        setTxRes(r.transactionHash);
        refreshPages();
        toastSuccess('ARES SWAP', 'Bought successfully');
        hideLoading();
      })
      .catch(err => {
        toastError('ARES SWAP', `${err.message}`);
        hideLoading();
      })
  }, [info, showLoading, metisAmount, buyToken, refreshPages, toastSuccess, hideLoading, toastError])

  return (
    <SwapContainer>
      <div className='top-frame'>
        <div className='reflection-frame'>
          <div className='reflection-caption'>Buy / Sell ARES</div>
        </div>
        <div className='summary-frame-col info-frame'>
          <div style={{
            display: 'flex',
            flexDirection: isSelling === true ? 'column' : 'column-reverse',
            position: 'relative'
          }}>
            <div className='my-balance-amount' onClick={handleMyBalance}>{isSelling ? `My ARES balance ${myBalance}` : `My METIS balance ${myETHBalance}`}</div>
            <div className='item-input-frame'>
              <div className='item-label'>
                <img src={TokenPNG} alt='' width='24px' />
                <p>ARES</p>
              </div>
              <div className='item-input item-decor-1'>
                <input type='text' placeholder={tokenApprovedAmount > 10000000000000? 'approved: unlimited': `approved ${tokenApprovedAmount} ARES`} value={tokenAmount} onChange={e => handleTokenInput(e.target.value)} />
              </div>
            </div>

            <div className='item-input-frame'>
              <div className='button-frame' onClick={() => { setIsSelling(t => !t) }}>
                <img src={SwapPng} alt='' width='24px' />
              </div>
            </div>

            <div className='item-input-frame'>
              <div className='item-label'>
                <img src={ETHPng} alt='' width='32px' />
                <p>METIS</p>
              </div>
              <div className='item-input item-decor-2'>
                <input type='text' placeholder='approved unlimited' value={metisAmount} onChange={e => handleMetisInput(e.target.value)} />
              </div>
            </div>
          </div>

          <div className='button-input-frame'>
            <div className='swap-button-frame'>
              {showApprove === true && <SmallButton caption='Approve' handleClick={handleApproveToken} />}
              <SmallButton caption='Swap' handleClick={() => isSelling === true? handleSellToken() : handleBuyToken()} />
            </div>
          </div>
        </div>
        <div className='summary-frame-col info-frame'>
          <div className='error-frame'>{info}</div>
        </div>
        {txRes && <div className='summary-frame-col info-frame'>
          <div className='error-frame'>
            Your transaction hash: <a href={`https://andromeda-explorer.metis.io/tx/${txRes}`} rel='noreferrer' target='_blank'>{txRes.slice(0, 8)}...{txRes.slice(-6)}</a>
          </div>
        </div>}
      </div>
    </SwapContainer>
  )
}
