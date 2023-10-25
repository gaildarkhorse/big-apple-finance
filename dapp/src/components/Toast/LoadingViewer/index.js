import React from 'react';
import { LoadingContainer, LoadingInfo, Loader, LoadingText } from './styles';

export const LoaderSize = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg'
}

const LoadingViewer = (props) => {

  let size;
  switch (props.size) {
    case LoaderSize.xs:
      size = "40px";
      break;
    case LoaderSize.sm:
      size = "68px";
      break;
    case LoaderSize.md:
      size = "92px";
      break;
    case LoaderSize.lg:
      size = "120px";
      break;
    default:
      size = "68px";
      break;
  }

  return (
    <>
      <LoadingContainer>
        <LoadingInfo>
          <Loader size={size} className='circle-loader'></Loader>
          <LoadingText>{props.label}</LoadingText>
        </LoadingInfo>
      </LoadingContainer>
    </>
  )
}

export default LoadingViewer;
