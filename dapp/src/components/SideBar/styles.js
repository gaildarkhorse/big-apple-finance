import styled from 'styled-components'

export const SideBarContainer = styled.div`
  width: 300px;
  min-height: 100vh;
  position: fixed;

  z-index: 20;

  transition: all 0.4s ease-in-out;
  left: 0px;

  @media (max-width: 864px) {
    left: ${props => props.show === '1'? '0px': '-300px'};
  }

  background: rgba(0,0,0,0.02);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);

  display: flex;
  flex-direction: column;

  .account-frame {
    width: 100%;
    padding: 0px 20px;
    text-align: center;
    font-size: 0.8rem;
    color: #ddd;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 20px;

    &:hover {
      color: #eee;
    }

    &:active {
      color: #ccc;
    }
  }

  .logo-frame {
    margin: 40px 0px;
    display: flex;
    flex-direction: row;
    justify-content: center;

    img {
      border-radius: 50%;
      filter: drop-shadow(0px 0px 12px #346cff);
    }
  }

  .footer-frame {
    display: flex;
    flex-direction: row;
    justify-content: center;
    grid-gap: 10px;
    gap: 10px;

    padding-top: 40px;

    .footer-item {
      width: fit-content;
    }
  }
`;
