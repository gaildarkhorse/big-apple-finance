import styled from 'styled-components'
import theme from '../../../theme.json'

export const AccountItemInfoContainer = styled.div`
  flex: 1 1 ${props => props.base};
  display: flex;
  flex-direction: column;

  margin: 10px 0px;
  padding: 10px;

  letter-spacing: 1px;

  .di-label {
    text-align: center;
    color: #eee;
    font-weight: 400;
    font-size: 1rem;
    margin-bottom: 8px;
  }

  .di-text {
    text-align: center;
    color: #f66;
    font-family: ${theme.fonts.digits.name};
    font-size: 2rem;
    margin-bottom: 8px;
  }

  .di-detail {
    text-align: center;
    color: #aaa;
    font-weight: 400;
    font-size: 1rem;
  }
`;
