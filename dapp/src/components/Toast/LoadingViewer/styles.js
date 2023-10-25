import styled from 'styled-components'

export const LoadingContainer = styled.div`
  background-color: rgba(0,0,0,0.4);
  backdrop-filter: blur(6px);
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  z-index: 20000;
`;

export const LoadingInfo = styled.div`
  position: absolute;
  top: calc(50% - size/2);
  left: calc(50% - size/2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const LoadingText = styled.div`
  color: rgb(255, 255, 255);
  font-size: 1.6rem;
  margin: 20px;
`;

export const Loader = styled.div`
  width: ${({ size }) => size};
	height: ${({ size }) => size};
	border-radius: 60px;
	animation: loader 1.2s linear infinite;
	-webkit-animation: loader 1.2s linear infinite;

  @keyframes loader {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
      border: 6px solid rgba(255, 160, 160, 0.5);
      border-left-color: transparent;
    }
    50% {
      -webkit-transform: rotate(180deg);
      transform: rotate(180deg);
      border: 6px solid rgba(255, 160, 160, 0.8);
      border-left-color: transparent;
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
      border: 6px solid #FFA0A0;
      border-left-color: transparent;
    }
  }

  @-webkit-keyframes loader {
    0% {
      -webkit-transform: rotate(0deg);
      border: 6px solid rgba(255, 160, 160, 0.5);
      border-left-color: transparent;
    }
    50% {
      -webkit-transform: rotate(180deg);
      border: 6px solid rgba(255, 160, 160, 0.8);
      border-left-color: transparent;
    }
    100% {
      -webkit-transform: rotate(360deg);
      border: 6px solid #FFA0A0;
      border-left-color: transparent;
    }
  }

`;