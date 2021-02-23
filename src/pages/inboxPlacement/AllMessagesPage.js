import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { Grid, Page, Panel } from 'src/components/matchbox';
import { Loading } from 'src/components';
import {
  getInboxPlacementByProvider,
  getInboxPlacementByRegion,
  getInboxPlacementBySendingIp,
  getAllInboxPlacementMessages,
  resetState,
} from 'src/actions/inboxPlacement';
import { RedirectAndAlert } from 'src/components/globalAlert';
import { PageLink } from 'src/components/links';
import { Definition } from 'src/components/text';
import AllMessagesCollection from './components/AllMessagesCollection';
import { formatPercent } from 'src/helpers/units';
import { PLACEMENT_FILTER_TYPES } from './constants/types';
import { selectSinglePlacementResult } from 'src/selectors/inboxPlacement';

export const AllMessagesPage = ({
  id,
  filterType,
  filterName,
  messages,
  loading,
  sent,
  placement,
  authentication,
  error,
  getInboxPlacementByProvider,
  getInboxPlacementByRegion,
  getInboxPlacementBySendingIp,
  getAllInboxPlacementMessages,
  resetState,
  AllMessagesCollectionComponent = AllMessagesCollection,
}) => {
  const loadMessages = useCallback(() => {
    const filterTypeToQueryParamMap = {
      [PLACEMENT_FILTER_TYPES.MAILBOX_PROVIDER]: 'mailbox_providers',
      [PLACEMENT_FILTER_TYPES.REGION]: 'regions',
      [PLACEMENT_FILTER_TYPES.SENDING_IP]: 'sending_ips',
    };
    const filters = { [filterTypeToQueryParamMap[filterType]]: filterName };

    switch (filterType) {
      case PLACEMENT_FILTER_TYPES.MAILBOX_PROVIDER:
        getInboxPlacementByProvider(id);
        break;
      case PLACEMENT_FILTER_TYPES.REGION:
        getInboxPlacementByRegion(id);
        break;
      case PLACEMENT_FILTER_TYPES.SENDING_IP:
        getInboxPlacementBySendingIp(id);
        break;
      default:
    }
    getAllInboxPlacementMessages(id, filters);
  }, [
    filterName,
    filterType,
    getAllInboxPlacementMessages,
    getInboxPlacementByProvider,
    getInboxPlacementByRegion,
    getInboxPlacementBySendingIp,
    id,
  ]);

  useEffect(() => {
    loadMessages();
    return () => resetState();
  }, [id, loadMessages, resetState]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <RedirectAndAlert
        to={`/inbox-placement/details/${id}`}
        alert={{ type: 'error', message: error.message }}
      />
    );
  }

  return (
    <Page
      breadcrumbAction={{
        as: PageLink,
        content: 'Test Results',
        to: `/inbox-placement/details/${id}`,
      }}
      title="Diagnostic Details"
      subtitle={filterName}
    >
      <Grid>
        <Grid.Column xs={12} sm={12} md={7}>
          <Panel.LEGACY title="Deliverability" sectioned>
            <Grid>
              <Grid.Column>
                <Definition>
                  <Definition.Label>Sent</Definition.Label>
                  <Definition.Value>{sent}</Definition.Value>
                </Definition>
              </Grid.Column>
              <Grid.Column>
                <Definition>
                  <Definition.Label>Inbox</Definition.Label>
                  <Definition.Value>{(placement.inbox_pct || 0) * sent}</Definition.Value>
                </Definition>
              </Grid.Column>
              <Grid.Column>
                <Definition>
                  <Definition.Label>Spam</Definition.Label>
                  <Definition.Value>{(placement.spam_pct || 0) * sent}</Definition.Value>
                </Definition>
              </Grid.Column>
              <Grid.Column>
                <Definition>
                  <Definition.Label>Missing</Definition.Label>
                  <Definition.Value>{(placement.missing_pct || 0) * sent}</Definition.Value>
                </Definition>
              </Grid.Column>
            </Grid>
          </Panel.LEGACY>
        </Grid.Column>
        <Grid.Column xs={12} sm={12} md={5}>
          <Panel.LEGACY title="Authentication" sectioned>
            <Grid>
              <Grid.Column>
                <Definition>
                  <Definition.Label>SPF</Definition.Label>
                  <Definition.Value>
                    {formatPercent((authentication.spf_pct || 0) * 100)}
                  </Definition.Value>
                </Definition>
              </Grid.Column>
              <Grid.Column>
                <Definition>
                  <Definition.Label>DKIM</Definition.Label>
                  <Definition.Value>
                    {formatPercent((authentication.dkim_pct || 0) * 100)}
                  </Definition.Value>
                </Definition>
              </Grid.Column>
              <Grid.Column>
                <Definition>
                  <Definition.Label>DMARC</Definition.Label>
                  <Definition.Value>
                    {formatPercent((authentication.dmarc_pct || 0) * 100)}
                  </Definition.Value>
                </Definition>
              </Grid.Column>
            </Grid>
          </Panel.LEGACY>
        </Grid.Column>
      </Grid>
      <AllMessagesCollectionComponent data={messages} testId={id} />
    </Page>
  );
};

function mapStateToProps(state, props) {
  const { id, filterType, filterName } = props.match.params;
  const { status, seedlist_count = 0, placement = {}, authentication = {} } =
    selectSinglePlacementResult(state, props) || {};

  return {
    id,
    filterType,
    filterName,
    status,
    sent: seedlist_count,
    placement,
    authentication,
    messages: state.inboxPlacement.allMessages,
    loading: state.inboxPlacement.getAllMessagesPending,
    error: state.inboxPlacement.getAllMessagesError || state.inboxPlacement.getByProviderError,
  };
}

export default connect(mapStateToProps, {
  getInboxPlacementByProvider,
  getInboxPlacementByRegion,
  getInboxPlacementBySendingIp,
  getAllInboxPlacementMessages,
  resetState,
})(AllMessagesPage);
