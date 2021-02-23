import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getSeedList } from 'src/actions/inboxPlacement';
import { selectReferenceSeed } from 'src/selectors/inboxPlacement';
import { showAlert } from 'src/actions/globalAlert';
import { ApiErrorBanner, ButtonWrapper, CopyToClipboard, Loading } from 'src/components';
import SaveCSVButton from 'src/components/collection/SaveCSVButton';
import { PageLink } from 'src/components/links';
import { Text, CodeBlock, Grid, Page, Panel, Stack, Layout } from 'src/components/matchbox';
import { Bold } from 'src/components/text';
import { useHibana } from 'src/context/HibanaContext';

const ActionText = () => {
  const [{ isHibanaEnabled }] = useHibana();
  return isHibanaEnabled ? (
    <Bold>Send the email and jump into the Inbox Placement report to see the results.</Bold>
  ) : (
    <p>
      Send the email and jump back to <PageLink to="/inbox-placement">Inbox Placement</PageLink> to
      see the results.
    </p>
  );
};

export const InstructionsContent = ({ seeds, referenceSeed }) => {
  const csvData = seeds.map(address => ({ 'Seed Address': address }));
  return (
    <>
      <Panel.LEGACY.Section>
        <Grid>
          <Grid.Column sm={12} md={10} lg={8}>
            <p>
              To use Seedlist data for deliverability, first add the following email addresses to
              your list. Make sure that the reference email address <Bold>{referenceSeed}</Bold> is
              the first one in your list.
            </p>
          </Grid.Column>
        </Grid>
      </Panel.LEGACY.Section>
      <Panel.LEGACY.Section>
        <Stack>
          <Grid>
            <Grid.Column sm={12} md={10} lg={8}>
              <Stack>
                <p>
                  Next, set up your campaign. Make sure you are sending to the full list of seed
                  email addresses. For best results, set the{' '}
                  <Bold>
                    <Text as="span" fontWeight="400">
                      `X-SP-Inbox-Placement`
                    </Text>
                  </Bold>{' '}
                  header with a unique value such as{' '}
                  <Bold>
                    {' '}
                    <Text as="span" fontWeight="400">
                      "my-first-test"
                    </Text>
                  </Bold>
                  . If you don't, you may run into issues if your have more than one test running
                  with the same subject line.
                </p>
                <ActionText />
              </Stack>
            </Grid.Column>
          </Grid>
          <CodeBlock code={seeds.join('\n')} />
        </Stack>
      </Panel.LEGACY.Section>
      <Panel.LEGACY.Section>
        <ButtonWrapper>
          <CopyToClipboard variant="primary" value={seeds.join(',')}>
            Copy List
          </CopyToClipboard>
          <SaveCSVButton
            data={csvData}
            saveCsv={true}
            caption="Download CSV"
            filename="sparkpost-seedlist.csv"
            variant="secondary"
          />
        </ButtonWrapper>
      </Panel.LEGACY.Section>
    </>
  );
};

export const SeedListPage = props => {
  const { pending, error, getSeedList, seeds, referenceSeed } = props;
  const [{ isHibanaEnabled }] = useHibana();

  useEffect(() => {
    getSeedList();
  }, [getSeedList]);

  const renderHibana = () => (
    <Layout>
      <Layout.Section annotated>
        <Layout.SectionTitle>Seed Data</Layout.SectionTitle>
        <p>Configure inbox placement testing</p>
      </Layout.Section>
      <Layout.Section>
        <Panel.LEGACY title="Seed Addresses">
          <InstructionsContent seeds={seeds} referenceSeed={referenceSeed} />
        </Panel.LEGACY>
      </Layout.Section>
    </Layout>
  );

  const renderOG = () => (
    <Panel.LEGACY title="Seed Addresses">
      <InstructionsContent seeds={seeds} referenceSeed={referenceSeed} />
    </Panel.LEGACY>
  );

  if (pending) {
    return <Loading />;
  }

  if (error) {
    return (
      <ApiErrorBanner
        message="Sorry, we seem to have had some trouble loading seedlist."
        errorDetails={error.message}
        reload={getSeedList}
      />
    );
  }

  return (
    <Page
      breadcrumbAction={{
        as: PageLink,
        content: 'All Tests',
        to: '/inbox-placement',
      }}
      title={isHibanaEnabled ? 'Inbox Placement Data' : 'Create an Inbox Placement Test'}
    >
      {isHibanaEnabled ? renderHibana() : renderOG()}
    </Page>
  );
};

const mapStateToProps = state => ({
  seeds: state.inboxPlacement.seeds,
  pending: state.inboxPlacement.seedsPending,
  error: state.inboxPlacement.seedsError,
  referenceSeed: selectReferenceSeed(state),
});
export default connect(mapStateToProps, { getSeedList, showAlert })(SeedListPage);
