import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';
import { ApiErrorBanner, Loading, DisplayDate } from 'src/components';
import { PageLink } from 'src/components/links';
import { Heading, PageDescription } from 'src/components/text';
import { Box, Page, Panel, Tag, Stack } from 'src/components/matchbox';
import { Templates } from 'src/components/images';
import { OGOnlyWrapper } from 'src/components/hibana';
import { listAlerts } from 'src/actions/alerts';
import { selectAlertsList, selectRecentlyTriggeredAlerts } from 'src/selectors/alerts';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import { METRICS } from './constants/formConstants';
import AlertCollection from './components/AlertCollection';
import OGStyles from './ListPage.module.scss';
import hibanaStyles from './ListPageHibana.module.scss';

export default function ListPage() {
  const styles = useHibanaOverride(OGStyles, hibanaStyles);
  const dispatch = useDispatch();
  const error = useSelector(state => state.alerts.listError);
  const loading = useSelector(state => state.alerts.listPending);
  const recentlyTriggeredAlerts = useSelector(selectRecentlyTriggeredAlerts);
  const alerts = useSelector(selectAlertsList);

  useEffect(() => {
    return dispatch(listAlerts());
  }, [dispatch]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <Page title="Alerts">
        <ApiErrorBanner
          message="Sorry, we seem to have had some trouble loading your alerts."
          errorDetails={error.message}
          reload={() => dispatch(listAlerts())}
        />
      </Page>
    );
  }

  return (
    <Page
      title="Alerts"
      primaryAction={{ content: 'Create an Alert', to: '/alerts/create', as: PageLink }}
      empty={{
        show: !error && alerts.length === 0,
        image: Templates,
        title: 'Create an Alert',
        content: <p>Manage notifications that alert you of performance problems.</p>,
      }}
    >
      <PageDescription>
        Use alerts to be notified when important changes occur in your Health Score, bounce rates,
        and email usage.
      </PageDescription>

      <Box mb="500">
        {recentlyTriggeredAlerts.length > 0 ? (
          <div data-id="recent-incidents">
            <Stack space="400">
              <Heading as="h2" looksLike="h3">
                Recent Incidents
              </Heading>

              <div className={styles.RecentIncidents}>
                {recentlyTriggeredAlerts.map(alert => {
                  return (
                    <Panel.LEGACY accent mb="0" key={alert.id}>
                      <Panel.LEGACY.Section>
                        <OGOnlyWrapper as="div" className={styles.PanelStack}>
                          <Stack>
                            {/* Extra <div> here prevents flex parent from stretching tag to full width */}
                            <div>
                              <Tag>{METRICS[alert.metric]}</Tag>
                            </div>

                            <PageLink
                              className={styles.AlertName}
                              to={`/alerts/details/${alert.id}`}
                              data-id="link-alert-name"
                            >
                              {alert.name}
                            </PageLink>
                          </Stack>
                        </OGOnlyWrapper>
                      </Panel.LEGACY.Section>

                      <Panel.LEGACY.Section className={styles.Footer}>
                        <Box color="gray.700" fontSize="200">
                          <DisplayDate
                            timestamp={alert.last_triggered_timestamp}
                            formattedDate={alert.last_triggered_formatted}
                          />
                        </Box>
                      </Panel.LEGACY.Section>
                    </Panel.LEGACY>
                  );
                })}
              </div>
            </Stack>
          </div>
        ) : null}
      </Box>

      <AlertCollection alerts={alerts} />
    </Page>
  );
}
