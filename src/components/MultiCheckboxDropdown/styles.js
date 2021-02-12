import { Button } from 'src/components/matchbox';
import { ChevronRight } from '@sparkpost/matchbox-icons';
import styled from 'styled-components';

export const StatusPopoverContent = styled.span`
  display: inline-block; /* Necessary to supply width & cut ellipse joined string */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  margin-right: ${props =>
    props.theme.space['400']}; /* because we AlignedButtonIcon absolute right */

  > * {
    /* Hacky fix, but addresses vertical centering without introducing a flex parent that wreaks havoc on text truncation */
    display: inline-block;
    transform: translateY(2px);
  }
`;

export const AlignedTextButton = styled(Button)`
  text-align: left;
  line-height: ${props =>
    props.theme.space[
      '450'
    ]}; /* Note: Fixes text and button alignment so they're all the same vertical alignment (see styles/note on span children) */

  > span,
  > span > span {
    vertical-align: middle; /* Note: Fixes text and button alignment so they're all the same vertical alignment (v align the children of the button) */
  }

  width: 100%;
`;

export const AlignedButtonIcon = styled(Button.Icon)`
  position: absolute;
  right: ${props => props.theme.space['300']}; /* Note: same as Matchbox listbox svg icon */
`;

export const Chevron = styled(ChevronRight)`
  color: ${props => props.theme.colors.blue['700']};
  transform: rotate(90deg);
`;
