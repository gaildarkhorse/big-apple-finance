import styled from 'styled-components'
import theme from '../../../theme.json'

export const MenuItemContainer = styled.div`
  margin: 20px 0;

  display flex;
  flex-direction: row;
  grid-gap: 12px;
  gap: 12px;
  align-items: center;

  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(102%, 102%);
  }

  padding-left: ${props => props.small === undefined? '70px': '0px'};

  cursor: pointer;

  svg {
    color: ${props => props.colorDef};
  }

  p {
    margin: 0;
    font-family: ${theme.fonts.special.name};
    font-size: 1.1rem;
    text-decoration: none !important;
    letter-spacing: 2px;
    color: ${props => props.colorDef};

    transition: all 0.2s ease-in-out;

    &:hover {
      color: #346cff;
    }
  }

  .mark-frame {
    position: relative;
    transform: translateY(-30%);
  }
`;
