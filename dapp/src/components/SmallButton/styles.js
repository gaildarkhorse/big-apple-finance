import styled from 'styled-components'

export const SmallButtonContainer = styled.div`
    cursor: pointer;
    background-image: linear-gradient(150deg, #57048a 0%, #0047ff 78%);
    border-radius: 10px;
    padding: 16px 24px;
    color: white;
    font-size: 0.8rem;
    word-break: keep-all;
    white-space: nowrap;

    display: flex;
    align-items: center;

    transition: all 0.8s ease-in-out;
    filter: drop-shadow(2px 2px 6px #000);

    &:hover {
        filter: drop-shadow(0px 0px 12px #346cff);
    }

    &:active {
        transition: all 0.2s ease-in-out;
        color: #fff4;
        background: #8882;
    }

    span {
        margin-left: 10px;
    }
`;
