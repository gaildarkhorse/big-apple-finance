import styled from 'styled-components'

export const StyledToastContainer = styled.div`
.enter,
.appear {
  opacity: 0.01;
}

.enter.enter-active,
.appear.appear-active {
  opacity: 1;
  transition: opacity 250ms ease-in;
}

.exit {
  opacity: 1;
}

.exit.exit-active {
  opacity: 0.01;
  transition: opacity 250ms ease-out;
}
`
