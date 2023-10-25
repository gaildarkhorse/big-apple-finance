import styled from 'styled-components'
import theme from '../../../theme.json'

export const DashboardItemInfoContainer = styled.div`
  flex: 1 1 ${props => props.base};
  display: flex;
  flex-direction: column;

  margin: 10px 0px;
  padding: 10px;

  letter-spacing: 1px;

  .di-label {
    text-align: center;
    color: #ccc;
    font-weight: 400;
    font-size: 1rem;
    margin-bottom: 8px;
  }

  .di-detail {
    ${props => props.emphasis? `font-family: ${theme.fonts.digits.name};`: ''}
    text-align: center;
    color: ${props => props.emphasis? '#f66': 'white'};
    font-size: 1rem;
  }
`;
