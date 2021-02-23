import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import isIP from 'validator/lib/isIP';
import isFQDN from 'validator/lib/isFQDN';
import { ApiErrorBanner, Loading, PanelLoading } from 'src/components';
import { ExternalLink, PageLink, SupportTicketLink } from 'src/components/links';
import {
  Box,
  Button,
  Columns,
  Column,
  Inline,
  Layout,
  Page,
  Panel,
  Stack,
  Text,
} from 'src/components/matchbox';
import { segmentTrack, SEGMENT_EVENTS } from 'src/helpers/segment';
import {
  getIncident,
  listIncidentsForResource,
  listIncidentsForBlocklist,
  listHistoricalResolvedIncidents,
} from 'src/actions/blocklist';
import {
  selectIncident,
  selectRelatedIncidentsForResource,
  selectRelatedIncidentsForBlocklist,
  selectHistoricalIncidents,
  selectDetailsPageError,
} from 'src/selectors/blocklist';
import IncidentDetails from './components/IncidentDetails';
import RelatedIncidents from './components/RelatedIncidents';

export const IncidentDetailsPage = ({
  id,
  error,
  loading,
  historicalIncidents,
  incident,
  incidentsForBlocklist,
  incidentsForResource,
  getIncident,
  listIncidentsForResource,
  listIncidentsForBlocklist,
  listHistoricalResolvedIncidents,
  incidentsForResourcePending,
  incidentsForBlocklistPending,
  historicalIncidentsPending,
}) => {
  useEffect(() => {
    getIncident(id).then(incident => {
      listIncidentsForResource(incident.resource);
      listIncidentsForBlocklist(incident.blocklist_name);
      listHistoricalResolvedIncidents(incident.blocklist_name, incident.resource);
    });
  }, [
    getIncident,
    id,
    listIncidentsForBlocklist,
    listIncidentsForResource,
    listHistoricalResolvedIncidents,
  ]);

  if (loading) {
    return <Loading />;
  }

  const {
    blocklist_name = '',
    display_name,
    resource = '',
    days_listed,
    resolved_at_timestamp,
    occurred_at_formatted,
    occurred_at_timestamp,
    recommendation = {},
  } = incident || {};
  //Should always be IP or Domain, but added Resource as a failsafe.
  const resourceType = isIP(resource) ? 'IP' : isFQDN(resource) ? 'Domain' : 'Resource';

  const renderError = () => (
    <div data-id="error-banner">
      <ApiErrorBanner
        message="Sorry, we seem to have had some trouble loading your blocklist incidents."
        errorDetails={error.message}
        reload={() => {
          getIncident(id).then(incident => {
            listIncidentsForResource(incident.resource);
            listIncidentsForBlocklist(incident.blocklist_name);
            listHistoricalResolvedIncidents(incident.blocklist_name, incident.resource);
          });
        }}
      />
    </div>
  );

  const renderHibanaContent = () => {
    if (error) {
      return renderError();
    }

    return (
      <>
        <Layout>
          <Layout.Section annotated>
            <Layout.SectionTitle>Incident Details</Layout.SectionTitle>
          </Layout.Section>
          <Layout.Section>
            {historicalIncidentsPending ? (
              <PanelLoading minHeight="150px" />
            ) : (
              <IncidentDetails
                resourceName={resource}
                blocklistName={blocklist_name}
                listedTimestamp={occurred_at_timestamp}
                resolvedTimestamp={resolved_at_timestamp}
                daysListed={days_listed}
              />
            )}
          </Layout.Section>
        </Layout>
        <Layout>
          <Layout.Section annotated>
            <Layout.SectionTitle>Historic Incidents</Layout.SectionTitle>
            Previous incidents involving {resource} and {blocklist_name}
          </Layout.Section>
          <Layout.Section>
            <RelatedIncidents
              incident={{ ...incident, id }}
              incidents={historicalIncidents}
              loading={historicalIncidentsPending}
              name={`${resource} on ${blocklist_name}`}
              type="history"
            />
          </Layout.Section>
        </Layout>
        {/*Resolved incidents will not have a recommendation value, but we set the default to {}*/}
        {Object.keys(recommendation).length > 0 && (
          <Layout>
            <Layout.Section annotated>
              <Layout.SectionTitle>Remediation Checklist</Layout.SectionTitle>
              <Stack space="400">
                <Text>
                  There could be a few different reasons why you got listed, take a look at our
                  recommendations to get you back up and running.
                </Text>
              </Stack>
            </Layout.Section>
            <Layout.Section>
              <Panel data-id="remediation-steps">
                <Panel.Section>
                  <Stack>
                    {(recommendation.check_list || []).map((item, count) => (
                      <Columns key={count}>
                        <Column width={1 / 100}>
                          <Box fontWeight="semibold">{count + 1}.</Box>
                        </Column>
                        <Column>{item} </Column>
                      </Columns>
                    ))}
                    <Inline>
                      {recommendation.action_text === 'Contact Support' ? (
                        <SupportTicketLink
                          as={Button}
                          variant="primary"
                          issueId="blocklisting"
                          onClick={() =>
                            segmentTrack(SEGMENT_EVENTS.BLOCKLIST_INCIDENT_ACTION_CLICKED)
                          }
                          message={`Listed Resource: ${resource}\n\nList: ${display_name} (${blocklist_name})\n\nListing Date: ${occurred_at_formatted}\n\nIn order to help us address this blocklisting as soon as possible, please specify the steps you have already taken to clean your list.`}
                        >
                          {recommendation.action_text}
                        </SupportTicketLink>
                      ) : (
                        <ExternalLink
                          as={Button}
                          onClick={() =>
                            segmentTrack(SEGMENT_EVENTS.BLOCKLIST_INCIDENT_ACTION_CLICKED)
                          }
                          to={recommendation.action_link}
                          variant="primary"
                        >
                          {recommendation?.action_text}
                        </ExternalLink>
                      )}
                      {recommendation?.info_text && (
                        <ExternalLink
                          as={Button}
                          onClick={() =>
                            segmentTrack(SEGMENT_EVENTS.BLOCKLIST_INCIDENT_INFO_CLICKED)
                          }
                          to={recommendation.info_url}
                          variant="secondary"
                        >
                          {recommendation?.info_text}
                        </ExternalLink>
                      )}
                    </Inline>
                  </Stack>
                </Panel.Section>
              </Panel>
            </Layout.Section>
          </Layout>
        )}
        <Layout>
          <Layout.Section annotated>
            <Layout.SectionTitle>Other Incidents for this {resourceType}</Layout.SectionTitle>
            <Stack space="400">
              <Text>Most recent incidents involving {resource}</Text>
              <PageLink to={`/signals/blocklist/incidents?search=resource:${resource}`}>
                View all incidents for this {resourceType}
              </PageLink>
            </Stack>
          </Layout.Section>
          <Layout.Section>
            <RelatedIncidents
              incident={{ ...incident, id }}
              incidents={incidentsForResource}
              loading={incidentsForResourcePending}
              type="resource"
            />
          </Layout.Section>
        </Layout>
        <Layout>
          <Layout.Section annotated>
            <Layout.SectionTitle>Other Incidents for this Blocklist</Layout.SectionTitle>
            <Stack space="400">
              <Text> Most recent incidents involving {blocklist_name}</Text>
              <PageLink
                to={`/signals/blocklist/incidents?search=bloacklist_name:${blocklist_name}`}
              >
                View all incidents for this blocklist
              </PageLink>
            </Stack>
          </Layout.Section>
          <Layout.Section>
            <RelatedIncidents
              incidents={incidentsForBlocklist}
              loading={incidentsForBlocklistPending}
              type="blocklist"
            />
          </Layout.Section>
        </Layout>
      </>
    );
  };

  return (
    <Page
      title="Blocklist Incident"
      breadcrumbAction={{
        content: 'Blocklist Incidents',
        to: '/signals/blocklist/incidents',
        as: PageLink,
      }}
    >
      {renderHibanaContent()}
    </Page>
  );
};

const mapStateToProps = (state, props) => {
  const { id } = props.match.params;

  return {
    historicalIncidents: selectHistoricalIncidents(state),
    historicalIncidentsPending: state.blocklist.historicalIncidentsPending,
    id,
    incident: selectIncident(state),
    incidentsForResource: selectRelatedIncidentsForResource(state),
    incidentsForResourcePending: state.blocklist.incidentsForResourcePending,
    incidentsForBlocklist: selectRelatedIncidentsForBlocklist(state),
    incidentsForBlocklistPending: state.blocklist.incidentsForBlocklistPending,
    error: selectDetailsPageError(state),
    loading: state.blocklist.incidentPending,
  };
};
export default connect(mapStateToProps, {
  getIncident,
  listIncidentsForResource,
  listIncidentsForBlocklist,
  listHistoricalResolvedIncidents,
})(IncidentDetailsPage);
