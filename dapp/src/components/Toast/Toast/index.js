import React, { useCallback, useEffect, useRef } from 'react'
import { StyledToast, FrameToastRect, IconRegion, TitleDescription, TitleTextArea, DescriptionTextArea } from './styles'
import { CSSTransition } from 'react-transition-group'

const Toast = ({ toast, onRemove, style, ttl, ...props }) => {
  const timer = useRef()
  const ref = useRef(null)
  const removeHandler = useRef(onRemove)
  const { id, title, description, type } = toast

  const handleRemove = useCallback(() => {
    removeHandler.current(id);
  }, [id, removeHandler])

  const handleMouseEnter = () => {
    clearTimeout(timer.current)
  }

  const handleMouseDown = () => {
    handleRemove();
  }

  const handleMouseLeave = () => {
    if (timer.current) {
      clearTimeout(timer.current)
    }

    timer.current = window.setTimeout(() => {
      handleRemove()
    }, ttl)
  }

  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current)
    }

    timer.current = window.setTimeout(() => {
      handleRemove()
    }, ttl)

    return () => {
      clearTimeout(timer.current)
    }
  }, [timer, ttl, handleRemove])

  return (
    <CSSTransition nodeRef={ref} timeout={250} style={style} {...props}>
      <StyledToast ref={ref} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onMouseDown={handleMouseDown}>
        {/* <Alert title={title} variant={alertTypeMap[type]} onClick={handleRemove}> */}
        <FrameToastRect>
          <IconRegion>
            {type === 'success' &&
              <svg fill="none" viewBox="0 0 24 24" style={{ width: '2rem', height: '2rem' }} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            }
            {type === 'info' &&
              <svg fill="none" viewBox="0 0 24 24" style={{ width: '2rem', height: '2rem' }} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            {
              type === 'danger' && <svg viewBox="0 0 612.002 612.002" style={{ width: '2rem', height: '2rem', enableBackground: "new 0 0 612.002 612.002", fill: "white" }} stroke="currentColor">
                <path d="M512.376,584.192H99.624c-35.959,0-68.162-18.593-86.14-49.732s-17.981-68.325,0-99.467L219.862,77.542
               c17.978-31.139,50.181-49.732,86.14-49.732s68.162,18.593,86.14,49.732l206.375,357.451c17.981,31.142,17.981,68.325,0,99.467
               S548.333,584.192,512.376,584.192z M306.002,56.396c-25.625,0-48.571,13.25-61.384,35.439L38.241,449.286
               c-12.812,22.192-12.81,48.689,0,70.88s35.759,35.439,61.384,35.439h412.749c25.625,0,48.571-13.25,61.384-35.439
               c12.812-22.189,12.812-48.689,0-70.88L367.383,91.835C354.573,69.643,331.627,56.396,306.002,56.396z M555.493,450.902
               L356.5,106.234c-10.54-18.258-29.418-29.155-50.498-29.155c-21.083,0-39.961,10.9-50.501,29.155L56.507,450.902
               c-10.543,18.258-10.54,40.055,0,58.311c10.54,18.255,29.418,29.155,50.501,29.155h397.987c21.083,0,39.961-10.9,50.501-29.155
               C566.036,490.957,566.033,469.157,555.493,450.902z M269.963,213.788c0-19.87,16.166-36.036,36.036-36.036
               s36.036,16.166,36.036,36.036v116.947c0,19.871-16.166,36.036-36.036,36.036s-36.036-16.166-36.036-36.036V213.788z
                M305.999,473.068c-20.362,0-36.928-16.566-36.928-36.928s16.566-36.928,36.928-36.928s36.928,16.566,36.928,36.928
               S326.361,473.068,305.999,473.068z"/>
              </svg>
            }
          </IconRegion>
          <TitleDescription>
            <TitleTextArea>
              {title}
            </TitleTextArea>
            <DescriptionTextArea>
              {description}
            </DescriptionTextArea>
          </TitleDescription>
        </FrameToastRect>
        {/* </Alert> */}
      </StyledToast>
    </CSSTransition>
  )
}

export default Toast
