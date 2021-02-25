import React, { useRef } from 'react';
import { Tooltip, useResizeObserver } from 'src/components/matchbox';
import styled from 'styled-components';

import PropTypes from 'prop-types';

const TruncatedText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NoWrapText = styled.div`
  white-space: nowrap;
  width: fit-content;
`;

export function TextTooltip({ children, id = 'text-tooltip-popover', bg, color }) {
  const [ref, entry] = useResizeObserver();
  const textRef = useRef(null);
  const showTooltip = textRef?.current?.offsetWidth > entry.contentRect.width;

  return (
    <Tooltip
      id={id}
      portalId="tooltip-portal"
      bg={bg}
      color={color}
      width="auto"
      as="div"
      content={<NoWrapText>{children}</NoWrapText>}
      disabled={!showTooltip}
    >
      <TruncatedText ref={ref}>
        <span tabIndex="0" ref={textRef}>
          {children}
        </span>
      </TruncatedText>
    </Tooltip>
  );
}

TextTooltip.propTypes = {
  children: PropTypes.string.isRequired,
};

export default TextTooltip;
