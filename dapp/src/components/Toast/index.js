import React from 'react'
import ToastContainer from './ToastContainer'
import LoadingViewer, { LoaderSize } from './LoadingViewer'
import useToast from '../../hooks/useToast'

const ToastListener = () => {
  const { toasts, remove, loadingInfo } = useToast()

  const handleRemove = (id) => remove(id)

  return (
    <>
      {loadingInfo.show ? <LoadingViewer size={LoaderSize.sz} label={loadingInfo.text} /> : <></>}
      <ToastContainer toasts={toasts} onRemove={handleRemove} />
    </>
  )
}

export default ToastListener
