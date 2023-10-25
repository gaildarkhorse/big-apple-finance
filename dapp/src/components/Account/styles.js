import styled from 'styled-components'
import theme from '../../theme.json'

export const AccountContainer = styled.div`
  width: 100%;
  height: 100%;

  overflow: hidden;
  overflow-y: auto;

  display: flex;
  flex-direction: row;
  justify-content: center;

  .info-frame {
    border-radius: 10px;
    border: 1px solid rgb(98, 116, 94, 0.4);
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

    .summary-frame {
      display: flex;
      flex-wrap: wrap;

      flex-gap: 20px;
      gap: 20px;

      .p2-frame {
        flex: 1 1 45%;
      }

      .p3-frame {
        flex: 1 1 30%;
      }
    }

    .summary-frame-col {
      display: flex;
      flex-direction: column;
      padding: 20px 20px;
    }

    .reflection-frame {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;

      .reflection-caption {
        flex: 1 1 auto;
        font-family: ${theme.fonts.special.name};
        font-size: 1.6rem;
        letter-spacing: 1px;
        text-align: center;
      }
    }
  }
`;
