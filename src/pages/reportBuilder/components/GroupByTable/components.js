import React from 'react';
import { Rocket } from '@sparkpost/matchbox-icons';
import { Box, Inline, Checkbox, UnstyledLink } from 'src/components/matchbox';
import styled from 'styled-components';

const CheckboxContainer = styled.div`
  display: flex;
`;

const Left = styled(Box)`
  flex: 1;
`;

const Right = styled(Inline)`
  flex: 0;
`;

export const CheckboxWithLink = ({
  hasSendingProduct,
  hasD12yProduct,
  hasSendingMetrics,
  hasInboxTrackingMetrics,
}) => checkboxProps => {
  const isInbox = checkboxProps.name === 'seed' || checkboxProps.name === 'panel';
  const isSending = checkboxProps.name === 'sending';
  const link = isSending
    ? '/account/billing/plan'
    : 'https://www.sparkpost.com/features/email-deliverability/';
  const showLink = (isSending && !hasSendingProduct) || (isInbox && !hasD12yProduct);
  const disabled =
    (isSending && (!hasSendingProduct || !hasSendingMetrics)) ||
    (isInbox && (!hasD12yProduct || !hasInboxTrackingMetrics));
  return (
    <CheckboxContainer>
      <Left>
        <Checkbox {...checkboxProps} disabled={disabled} />
      </Left>
      {showLink && (
        <Right space="100">
          <UnstyledLink title="Upgrade" to={link} external={isInbox}>
            Upgrade
          </UnstyledLink>
          <Box color="brand.orange">
            <Rocket />
          </Box>
        </Right>
      )}
    </CheckboxContainer>
  );
};
