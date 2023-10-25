import styled from 'styled-components'

export const HomeContainer = styled.div`
  width: 100vw;
  height: fit-content;

  position: relative;

  #tsparticles {
    position: absolute;
  }
`;

export const BackgroundImageContainer = styled.div`
  position: absolute;
  width: 100%;
  min-height: 100vh;
  height: 100%;
  z-index: -100;
  overflow: hidden;

  .custom {
    position: absolute;
    bottom: 0px;
    left: 0;
    width: 100%;
    height 200px;

    background: linear-gradient(#E2450000, #E2450040);
    z-index: 1;
  }
`;

