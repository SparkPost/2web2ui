import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, Route } from 'react-router-dom';

// Actions
import { getWebhook, deleteWebhook } from 'src/actions/webhooks';
import { showAlert } from 'src/actions/globalAlert';
import { selectSubaccountIdFromQuery } from 'src/selectors/subaccounts';

// Components
import { Loading, DeleteModal } from 'src/components';
import { PageLink } from 'src/components/links';
import { Page, Panel, Tabs } from 'src/components/matchbox';
import { setSubaccountQuery } from 'src/helpers/subaccounts';
import TestTab from './components/TestTab';
import EditTab from './components/EditTab';
import BatchTab from './components/BatchTab';

export class WebhooksDetails extends Component {
  state = {
    showDelete: false,
  };

  componentDidMount() {
    const { getWebhook, match, history, subaccountId: subaccount } = this.props;

    getWebhook({ id: match.params.id, subaccount }).catch(() => {
      history.push('/webhooks/');
    });
  }

  /*
    Calls deleteWebhook action then redirects to list page.
  */
  deleteWebhook = () => {
    const { deleteWebhook, showAlert, history, match, webhook } = this.props;

    return deleteWebhook({ id: match.params.id, subaccount: webhook.subaccount }).then(() => {
      history.push('/webhooks/');
      showAlert({ type: 'success', message: 'Webhook deleted' });
    });
  };

  /*
    for delete modal
  */
  toggleDelete = () => {
    this.setState({ showDelete: !this.state.showDelete });
  };

  render() {
    const { webhook, location, match, subaccountId } = this.props;
    const webhookId = match.params.id;
    const query = setSubaccountQuery(subaccountId);
    const editPath = `/webhooks/details/${webhookId}`;
    const testPath = `/webhooks/details/${webhookId}/test`;
    const batchPath = `/webhooks/details/${webhookId}/batches`;
    const secondaryActions = [
      {
        content: 'Delete',
        onClick: this.toggleDelete,
      },
    ];
    const tabs = [
      {
        content: 'Settings',
        as: PageLink,
        to: `${editPath}${query}`,
      },
      {
        content: 'Test',
        as: PageLink,
        to: `${testPath}${query}`,
      },
      {
        content: 'Batch Status',
        as: PageLink,
        to: `${batchPath}${query}`,
      },
    ];

    const selectedTab = tabs.findIndex(({ to }) => location.pathname === to.split('?')[0]);

    /*
      Check .events to guard from the create page redirect,
      which sets id on the state but doesn't have the rest of the webhook
    */
    if (webhook.id !== webhookId || !webhook.events) {
      return <Loading />;
    }

    return (
      <Page
        title={webhook.name}
        secondaryActions={secondaryActions}
        breadcrumbAction={{ content: 'View All Webhooks', as: PageLink, to: '/webhooks/' }}
      >
        <Panel.LEGACY>
          <Tabs selected={selectedTab} tabs={tabs} />
          <Route exact path={editPath} render={() => <EditTab webhook={webhook} />} />
          <Route path={testPath} render={() => <TestTab webhook={webhook} />} />
          <Route path={batchPath} render={() => <BatchTab webhook={webhook} />} />
        </Panel.LEGACY>
        <DeleteModal
          open={this.state.showDelete}
          title="Are you sure you want to delete this webhook?"
          content={
            <p>
              The webhook will be permanently removed and send no further events. This cannot be
              undone.
            </p>
          }
          onCancel={this.toggleDelete}
          onDelete={this.deleteWebhook}
        />
      </Page>
    );
  }
}

const mapStateToProps = (state, props) => ({
  webhook: state.webhooks.webhook,
  getLoading: state.webhooks.getLoading,
  eventDocs: state.webhooks.docs,
  subaccountId: selectSubaccountIdFromQuery(state, props),
});

export default withRouter(
  connect(mapStateToProps, { getWebhook, deleteWebhook, showAlert })(WebhooksDetails),
);
