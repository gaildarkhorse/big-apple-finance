import styled from 'styled-components'

export const AccountItemInfo2Container = styled.div`
  flex: 1 1 90%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  @media (max-width: 512px) {
    flex-direction: column;
    margin: 10px 0px;
  }

  padding: 10px;

  letter-spacing: 1px;

  .di-label {
    text-align: center;
    font-weight: 400;
    font-size: 1.1rem;
    color: #ccc;
    margin-bottom: 8px;
  }

  .di-detail {
    text-align: center;
    color: white;
    font-size: 1rem;
  }
`;
