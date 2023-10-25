import React, { createContext, useCallback, useState } from 'react'
import { kebabCase } from 'lodash'

export const ToastsContext = createContext()

export const ToastsProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const [loadingInfo, setLoadingInfo] = useState({
    show: false,
    text: '',
  });

  const toast = useCallback(
    ({ title, description, type }) => {
      setToasts((prevToasts) => {
        const id = kebabCase(title + description)

        // Remove any existing toasts with the same id
        const currentToasts = prevToasts.filter((prevToast) => prevToast.id !== id)

        return [
          {
            id,
            title,
            description,
            type,
          },
          ...currentToasts,
        ]
      })
    },
    [setToasts],
  )

  const toastError = (title, description) => {
    return toast({ title: title, description: description, type: 'danger' })
  }
  const toastInfo = (title, description) => {
    return toast({ title: title, description: description, type: 'info' })
  }
  const toastSuccess = (title, description) => {
    return toast({ title: title, description: description, type: 'success' })
  }
  const toastWarning = (title, description) => {
    return toast({ title: title, description: description, type: 'warning' })
  }
  const clear = () => setToasts([])
  const remove = (id) => {
    setToasts((prevToasts) => prevToasts.filter((prevToast) => prevToast.id !== id))
  }

  const showLoading = (text) => {
    setLoadingInfo(t => {return {...t, show: true, text: text}});
  }

  const hideLoading = () => {
    setLoadingInfo(t => {return {...t, show: false}});
  }

  return (
    <ToastsContext.Provider value={{ toasts, clear, remove, toastError, toastInfo, toastSuccess, toastWarning, showLoading, hideLoading, loadingInfo }}>
      {children}
    </ToastsContext.Provider>
  )
}
