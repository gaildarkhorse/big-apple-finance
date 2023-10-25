import styled from 'styled-components'

export const RightPaneContainer = styled.div`
  position: relative;
  left: 300px;
  width: calc(100vw - 300px);
  min-height: 100vh;
  padding: 0px 20px;

  transition: all .4ms ease-in;

  @media (max-width: 864px) {
    left: 0px;
    width: calc(100vw);
  }

  .section-frame {
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: 20px 0 30px;

    position: relative;
    z-index: 10;

    .button-frame {
      margin: 0px 20px;
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 100%;
      max-width: 833px;
  
      justify-content: left;
  
      font-weight: 600;
      letter-spacing: 2px;

      .left-pane-button-frame {
        flex: 1 1 auto;

        .left-pane-button {
          @media (min-width: 864px) {
            display: none;
          }

          transition: all 0.2s ease-in-out;

          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: rgba(255,255,255,0.2);
          cursor: pointer;
  
          &:hover {
            background: rgba(255,255,255,0.25);
          }
  
          &:active {
            background: rgba(255,255,255,0.1);
          }
  
          position: relative;
  
          .mid-bar {
            position: absolute;
            top: 50%;
            left: 25%;
            width: 50%;
            border: 1px solid #888;
          }
  
          .mid-bar:before,
          .mid-bar:after {
            display: block;
            content: "";
            width: 100%;
            height: 2px;
            background: #888;
            position: absolute;
          }
          
          .mid-bar:before { top: -5px; }
          .mid-bar:after { top: 3px; }
        }
      }
    }
  }

  .another-small-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-gap: 6px;
    gap: 6px;
    font-size: 1rem;

    margin-right: 10px;

    padding: 6px 12px;
    background: #181818;
    border-radius: 24px;
    cursor: pointer;

    .add-token {
      font-weight: 800;
    }

    img {
      max-width: 20px;
    }

    transition: all .6s ease-in-out;
    &:hover {
      filter: drop-shadow(0px 0px 12px #346cff);
    }
  }

  .route-frame {
    position: relative;
    height: fit-content;
  }

  .route-transition-element {
    width: 100%;
    padding-bottom: 20px;

    .wallet-connect-frame {
    }
  }

  .fade-enter {
    opacity: 0;
  }

  .fade-enter.fade-enter-active {
    opacity: 1;
    transition: opacity 500ms ease-in;
  }
`;
