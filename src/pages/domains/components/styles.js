import styled from 'styled-components';

export const StyledFilterFields = styled.div`
  display: grid;
  grid-gap: ${props => props.theme.space['500']};
  grid-template-columns: 2fr auto 250px;

  @media (max-width: ${props => props.theme.breakpoints[1]}) {
    grid-template-columns: 1fr;
  }
`;

export const StyledGridCell = styled.div`
  width: 250px;
  justify-self: end;

  @media (max-width: ${props => props.theme.breakpoints[1]}) {
    justify-self: start;
  }
`;

export const StatusPopoverContent = styled.span`
  display: inline-block; /* Necessary to supply width */
  width: 100px;
  overflow: hidden;
  white-space: nowrap;

  > * {
    /* Hacky fix, but addresses vertical centering without introducing a flex parent that wreaks havoc on text truncation */
    display: inline-block;
    transform: translateY(2px);
  }
`;
