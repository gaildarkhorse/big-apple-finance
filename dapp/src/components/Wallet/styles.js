import styled from 'styled-components'
import theme from '../../theme.json'

export const WalletContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex-gap: 10px;
    gap: 10px;

    color: white;

    h2 {
        font-family: ${theme.fonts.special.name};
        font-weight: 300;
        text-align: center;
        text-transform: capitalize;
    }

    .description {
        text-align: center;
        font-size: 1rem;
        color: #ccc;
    }

    .wallet-frame {
        margin-top: 40px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        flex-wrap: wrap;
        flex-gap: 20px;
        gap: 20px;

        .wallet-item {
            padding: 30px;
            border-radius: 20px;
            background: #4444;
            backdrop-filter: blur(4px);
            cursor: pointer;

            transition: all .6s ease-in-out;

            &:hover {
                transform: translate(0, -6px);
                h3 {
                    color: #0047ff;
                }
            }

            display: flex;
            flex-direction: column;
            align-items: center;
            flex-gap: 20px;
            gap: 20px;

            h3 {
                font-family: ${theme.fonts.special.name};
                font-weight: 300;
                letter-spacing: 2px;
                margin: 0;
                transition: all .6s ease-in-out;
            }

            span {
                text-align: center;
                font-size: 0.9rem;
                color: #ccc;
            }
        }
    }
`