import React from 'react';
import styled from 'styled-components';
import { Box, Grid, Panel, Stack, Text, Modal } from 'src/components/matchbox';
import RecipientValidationCostModal from 'src/components/billing/RecipientValidationCostModal';
import { Close } from '@sparkpost/matchbox-icons';
import { formatCurrency, formatFullNumber } from 'src/helpers/units';
import useHibanaToggle from 'src/hooks/useHibanaToggle';
import styles from './RecipientValidationModal.module.scss';
import cx from 'classnames';
import { RECIPIENT_VALIDATION_TIERS } from 'src/constants';
import totalRecipientValidationCost from 'src/helpers/recipientValidation';

// TODO: Replace with <Box /> when OG theme is removed
const CenteredText = styled.div`
  text-align: 'center';
`;

// TODO: Replace with <Box /> when OG theme is removed
const RightAlignedText = styled.div`
  text-align: 'right';
`;

// This is the old, reskinned Modal
export function RecipientValidationModal({ onClose, volumeUsed, open }) {
  const TierRows = RECIPIENT_VALIDATION_TIERS.map(({ volumeMax, volumeMin, cost }) => {
    const tierCost = Math.max(Math.min(volumeMax, volumeUsed) - volumeMin, 0) * cost;
    const tierEmpty = tierCost <= 0;

    const rowClass = cx(styles.PriceRow, tierEmpty && styles.EmptyTier);

    return (
      <Grid className={rowClass} key={`rv_tier_${volumeMin}_${volumeMax || 'plus'}`}>
        <Grid.Column xs={5}>
          <span className={styles.Bold}>
            {volumeMax < Infinity
              ? `${formatFullNumber(volumeMin)} - ${formatFullNumber(volumeMax)}`
              : `${formatFullNumber(volumeMin)}+`}{' '}
            emails
          </span>
        </Grid.Column>
        <Grid.Column xs={1}>
          <span>at</span>
        </Grid.Column>
        <Grid.Column xs={3}>
          <span className={styles.Bold}>${cost} per email</span>
        </Grid.Column>
        {!tierEmpty && (
          <Grid.Column xs={1}>
            <CenteredText>
              <span>=</span>
            </CenteredText>
          </Grid.Column>
        )}
        {!tierEmpty && (
          <Grid.Column xs={2}>
            <RightAlignedText>
              <span className={styles.Bold}>{formatCurrency(tierCost)}</span>
            </RightAlignedText>
          </Grid.Column>
        )}
      </Grid>
    );
  });

  return (
    <Modal.LEGACY open={open} onClose={onClose} title="Recipient Validation Cost Calculation">
      <Panel.LEGACY
        actions={[{ content: <Close />, onClick: onClose }]}
        className={styles.modalContainer}
        title="How was this calculated?"
      >
        <Panel.LEGACY.Section>
          <Stack space="200">
            <Stack space="200">{TierRows}</Stack>
            <Box borderTop="1px solid" paddingTop="400" borderColor="gray.400">
              <Grid className={styles.TotalCost}>
                <Grid.Column xs={3} xsOffset={6}>
                  Total:
                </Grid.Column>
                <Grid.Column xs={3}>
                  <RightAlignedText>
                    <Text color="gray.900" fontWeight="600">
                      {totalRecipientValidationCost(volumeUsed)}
                    </Text>
                  </RightAlignedText>
                </Grid.Column>
              </Grid>
            </Box>
          </Stack>
        </Panel.LEGACY.Section>
      </Panel.LEGACY>
    </Modal.LEGACY>
  );
}

function RecipientValidationModalWrapper(props) {
  return useHibanaToggle(RecipientValidationModal, RecipientValidationCostModal)(props);
}

export default RecipientValidationModalWrapper;
