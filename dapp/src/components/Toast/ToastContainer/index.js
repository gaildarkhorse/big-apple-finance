import React from 'react'
import { StyledToastContainer } from './styles'
import { TransitionGroup } from 'react-transition-group'
import Toast from '../Toast'

const ZINDEX = 21000
const TOP_POSITION = 80 // Initial position from the top

const ToastContainer = ({ toasts, onRemove, ttl = 6000, stackSpacing = 80 }) => {
    return (
        <StyledToastContainer>
            <TransitionGroup>
                {toasts.map((toast, index) => {
                    const zIndex = (ZINDEX - index).toString()
                    const top = TOP_POSITION + index * stackSpacing

                    return (
                        <Toast key={toast.id} toast={toast} onRemove={onRemove} ttl={ttl} style={{ top: `${top}px`, zIndex }} />
                    )
                })}
            </TransitionGroup>
        </StyledToastContainer>
    )
}

export default ToastContainer
