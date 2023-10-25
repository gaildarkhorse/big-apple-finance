import styled from 'styled-components'

export const SwapContainer = styled.div`
  width: 100%;
  height: 100%;

  overflow: hidden;
  overflow-y: auto;

  display: flex;
  flex-direction: row;
  justify-content: center;

  .info-frame {
    border-radius: 10px;
    border: 1px solid rgb(98, 116, 94);
    background: rgba(0,0,0,0.2);

    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
  }

  .top-frame {
    margin: 0px 20px;

    display: flex;
    flex-direction: column;
    flex-gap: 20px;
    gap: 20px;

    width: 100%;
    max-width: 833px;

    .reflection-frame {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;

      .reflection-caption {
        flex: 1 1 auto;
        font-size: 1.3rem;
        letter-spacing: 1px;
        text-align: center;
      }
    }

    .summary-frame-col {
      display: flex;
      flex-direction: column;
      padding: 20px 20px;

      .my-balance-amount {
        position: absolute;
        top: -10px;
        right: -10px;

        font-size: 12px;

        cursor: pointer;
        filter: drop-shadow(0px 0px 0px white);

        transition: all 0.2s ease-in-out;

        &:hover {
          font-size: 13px;
          filter: drop-shadow(0px 0px 4px white);
        }

        &:active {
          font-size: 13px;
          filter: drop-shadow(0px 0px 4px black);
        }
      }

      .item-input-frame {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;

        .button-frame {
          width: 100%;
          display: flex;
          justify-content: center;
          cursor: pointer;

          filter: drop-shadow(0px 0px 0px white);
          opacity: 1;

          transition: all 0.2s ease-in-out;

          &:hover {
            filter: drop-shadow(0px 0px 8px white);
          }

          &:active {
            opacity: 0.6;
          }
        }

        .item-label {
          flex: 1 1 0;

          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;

          padding: 0px 20px;

          p {
            font-size: 1.1rem;
            padding: 0px 10px;
          }
        }

        .item-decor-1 {
          position: relative;

          ::before {
            position: absolute;
            top: 0;
            left: -1px;
            right: -1px;
            bottom: -2px;
            content: "";

            border-radius: 10px;

            background: linear-gradient(to right, #00ff00, #ffff00 50%, #ff0000);
            z-index: -1;
          }
        }

        .item-decor-2 {
          position: relative;
          
          ::before {
            position: absolute;
            top: 0;
            left: -1px;
            right: -1px;
            bottom: -2px;
            content: "";

            border-radius: 10px;

            background: linear-gradient(to right, #ff0000, #00ff00 50%, #ffff00);
            z-index: -1;
          }
        }

        .item-input {
          flex: 1 1 0;

          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: left;

          input {
            width: 100%;
            outline: none;
            border: none;

            border-radius: 10px;
            padding: 6px 10px;

            font-size: 16px;
            font-weight: 800;

            filter: drop-shadow(2px 2px 6px green);

            ::placeholder {
              color: #eee;
            }
          }
        }
      }
      
      .button-input-frame {
        display: flex;
        flex-direction: row;
        justify-content: center;

        .swap-button-frame {
          padding: 0px 10px;

          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;

          .swap-button {
            cursor: pointer;
            border-radius: 10px;
            padding: 4px 10px;
            background: #aaa;
            margin: 0px 10px;
          }
        }
      }

      .error-frame {
        font-size: 16px;
        text-align: center;

        a {
          color: #ddd;
          font-weight: 800;

          &:hover {
            color: #eee;
          }

          &:active {
            color: #ccc;
          }
        }
      }
    }
  }
`;
