import React from 'react';
import _ from 'lodash';
import { Box, Grid, Inline, Layout, Panel, Button } from 'src/components/matchbox';
import { RequestPage } from '@sparkpost/matchbox-icons';
import { SubduedText, TranslatableText } from 'src/components/text';
import { PageLink } from 'src/components/links';
import RecipientValidationCostModal from 'src/components/billing/RecipientValidationCostModal';
import { formatDate } from 'src/helpers/date';
import totalRecipientValidationCost from 'src/helpers/recipientValidation';
import { useModal } from 'src/hooks';
import { LabelAndKeyPair } from '.';
import RVUsageChart from './RVUsageChart';

export default function RVUsageSection({ rvUsage, rvUsageHistory, usageHistoryStatus }) {
  const { closeModal, openModal, isModalOpen } = useModal();
  const volumeUsed = _.get(rvUsage, 'month.used', 0);

  const usageChart = React.useMemo(() => {
    if (usageHistoryStatus === 'loading' || usageHistoryStatus === 'error') {
      return null;
    }

    return (
      <Panel mb="-1px" data-id="rv-usage-chart">
        <Panel.Section>
          <Box textAlign="right" mb="200">
            <Panel.Action onClick={openModal}>
              View Expense Calculation <Button.Icon as={RequestPage} />
            </Panel.Action>
          </Box>
          <RVUsageChart data={rvUsageHistory} start={rvUsage.month.start} end={rvUsage.month.end} />
        </Panel.Section>
      </Panel>
    );
  }, [usageHistoryStatus, rvUsageHistory, rvUsage.month.start, rvUsage.month.end, openModal]);

  return (
    <>
      <Layout.Section annotated>
        <Layout.SectionTitle as="h2">Recipient Validation Usage</Layout.SectionTitle>
        <SubduedText>
          <TranslatableText>Validate email addresses by going to </TranslatableText>
          <PageLink to="/recipient-validation/list">Recipient Validation</PageLink>
        </SubduedText>
      </Layout.Section>
      <Layout.Section>
        {usageChart}
        <Box padding="400" backgroundColor="gray.1000">
          <Grid>
            <Grid.Column sm={3}>
              {rvUsage && (
                <Box id="date">
                  <LabelAndKeyPair
                    label="Date Range"
                    value={`${formatDate(rvUsage.month.start)} - ${formatDate(rvUsage.month.end)}`}
                  ></LabelAndKeyPair>
                </Box>
              )}
            </Grid.Column>
            <Grid.Column sm={9}>
              <Inline space="400">
                {rvUsage && (
                  <Box>
                    <LabelAndKeyPair
                      label="Current Cycle Validations"
                      value={volumeUsed.toLocaleString()}
                    ></LabelAndKeyPair>
                  </Box>
                )}
                {rvUsage && (
                  <Box>
                    <LabelAndKeyPair
                      label="Current Cycle Expenses"
                      value={totalRecipientValidationCost(volumeUsed)}
                    ></LabelAndKeyPair>
                  </Box>
                )}
              </Inline>
            </Grid.Column>
          </Grid>
        </Box>
      </Layout.Section>
      <RecipientValidationCostModal
        open={isModalOpen}
        onClose={closeModal}
        volumeUsed={volumeUsed}
        start={rvUsage.month.start}
        end={rvUsage.month.end}
      />
    </>
  );
}
