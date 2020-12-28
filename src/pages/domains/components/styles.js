import { Panel } from 'src/components/matchbox';
import { Button } from 'src/components/matchbox';
import { ChevronRight } from '@sparkpost/matchbox-icons';
import styled from 'styled-components';

export const StyledFilterFields = styled.div`
  @media (min-width: ${props => props.theme.breakpoints[1]}) {
    display: grid;
    grid-gap: ${props => props.theme.space['500']};
    grid-template-columns: 2fr auto 250px; /* NOTE: AlignedTextButton gets max width at the same time for this grid layout to work */
  }
`;

export const StyledGridCell = styled.div``;

export const StatusPopoverContent = styled.span`
  display: inline-block; /* Necessary to supply width & cut ellipse joined string */
  width: calc(100% - 1rem); /* NOTE: Works in conjunction with AlignedButtonIcon */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  margin-right: 1rem; /* because we AlignedButtonIcon absolute right */

  > * {
    /* Hacky fix, but addresses vertical centering without introducing a flex parent that wreaks havoc on text truncation */
    display: inline-block;
    transform: translateY(2px);
  }
`;

export const AlignedTextButton = styled(Button)`
  text-align: left;
  line-height: 20px; /* Note: Fixes text and button alignment so they're all the same vertical alignment (see styles/note on span children) */

  > span,
  > span > span {
    vertical-align: top; /* Note: Fixes text and button alignment so they're all the same vertical alignment (v align the children of the button) */
  }

  @media (min-width: ${props => props.theme.breakpoints[1]}) {
    max-width: 150px;
  }

  @media (min-width: ${props => props.theme.breakpoints[2]}) {
    max-width: 250px;
  }
`;

export const AlignedButtonIcon = styled(Button.Icon)`
  position: absolute;
  right: 0.75rem; /* note: same as Matchbox listbox svg icon */
`;

export const Chevron = styled(ChevronRight)`
  color: ${props => props.theme.colors.blue['700']};
  transform: rotate(90deg);
`;

export const DomainTabPanel = styled(Panel)``;

export const DomainTabPanelSection = styled(Panel.Section)`
  padding: 1rem 0.75rem;

  > div > div,
  > div > div > div {
    margin-left: 0;
  }

  @media (min-width: ${props => props.theme.breakpoints[1]}) {
    padding: 1rem;
  }
`;
