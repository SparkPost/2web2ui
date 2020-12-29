import React from 'react';
import { Box, Modal, Button, Table, LabelValue, Inline } from 'src/components/matchbox';
import { RECIPIENT_VALIDATION_TIERS } from 'src/constants';
import { formatCurrency, formatFullNumber } from 'src/helpers/units';
import totalRVCost from 'src/helpers/recipientValidation';
import { formatDate } from 'src/helpers/date';
import config from 'src/config';

function TierRow(props) {
  const { min, max, cost, displayedCost } = props;
  const tierEmpty = cost <= 0;

  return (
    <Table.Row>
      <Table.Cell>
        {max < Infinity
          ? `${formatFullNumber(min)} - ${formatFullNumber(max)}`
          : `${formatFullNumber(min)}+`}{' '}
      </Table.Cell>
      <Table.Cell>{displayedCost}</Table.Cell>
      <Table.Cell>{!tierEmpty && <Box textAlign="right">{formatCurrency(cost)}</Box>}</Table.Cell>
    </Table.Row>
  );
}

function RecipientValidationCostModal(props) {
  const { open, onClose, volumeUsed = 0, start, end } = props;

  const TierRows = RECIPIENT_VALIDATION_TIERS.map(
    ({ volumeMax, volumeMin, cost, displayedCost }) => {
      const tierCost = Math.max(Math.min(volumeMax, volumeUsed) - volumeMin, 0) * cost;

      return (
        <TierRow
          key={`rv_tier_${volumeMin}_${volumeMax || 'plus'}`}
          min={volumeMin}
          max={volumeMax}
          cost={tierCost}
          displayedCost={displayedCost}
        />
      );
    },
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>Recipient Validation Expense Calculation</Modal.Header>
      <Modal.Content p="0" restrictHeight={false}>
        <Box p={['400', null, '500']}>
          <Inline space="500">
            <LabelValue>
              <LabelValue.Label>Billing Cycle</LabelValue.Label>
              <LabelValue.Value>
                {formatDate(start, config.dateFormat)} - {formatDate(end, config.dateFormat)}
              </LabelValue.Value>
            </LabelValue>
            <LabelValue>
              <LabelValue.Label>Total Validations</LabelValue.Label>
              <LabelValue.Value>{formatFullNumber(volumeUsed)}</LabelValue.Value>
            </LabelValue>
          </Inline>
        </Box>
        <Box borderTop="300">
          <Table>
            <thead>
              <Table.Row>
                <Table.HeaderCell>Validation Volume</Table.HeaderCell>
                <Table.HeaderCell>Cost Per Validation</Table.HeaderCell>
                <Table.HeaderCell>
                  <Box textAlign="right">Amount</Box>
                </Table.HeaderCell>
              </Table.Row>
            </thead>
            <tbody>
              {TierRows}
              <Table.TotalsRow>
                <Table.Cell>Total</Table.Cell>
                <Table.Cell />
                <Table.Cell>
                  <Box textAlign="right">{totalRVCost(volumeUsed)}</Box>
                </Table.Cell>
              </Table.TotalsRow>
            </tbody>
          </Table>
        </Box>
      </Modal.Content>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RecipientValidationCostModal;
