import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

// Actions
import { listWebhooks } from 'src/actions/webhooks';
import { list as listSubaccounts } from 'src/actions/subaccounts';

// Helpers and selectors
import { setSubaccountQuery } from 'src/helpers/subaccounts';
import { hasSubaccounts } from 'src/selectors/subaccounts';
import { selectWebhooks } from 'src/selectors/webhooks';

// Components
import { Loading, TableCollection, Subaccount, ApiErrorBanner } from 'src/components';
import { Page } from 'src/components/matchbox';
import { Setup } from 'src/components/images';
import { PageLink } from 'src/components/links';
import { formatDateTime } from 'src/helpers/date';

const filterBoxConfig = {
  show: true,
  itemToStringKeys: ['name', 'target'],
  exampleModifiers: ['name', 'target', 'auth_type', 'last_successful'],
};

export class WebhooksList extends Component {
  componentDidMount() {
    this.props.listWebhooks();
    if (hasSubaccounts && this.props.subaccounts.length === 0) {
      this.props.listSubaccounts();
    }
  }

  getColumns = () => {
    const { hasSubaccounts } = this.props;
    const columns = [
      { label: 'Name', sortKey: 'name' },
      { label: 'Target', width: '20%' },
      { label: 'Last Success', sortKey: 'last_successful' },
      { label: 'Last Failure', sortKey: 'last_failure' },
    ];

    if (hasSubaccounts) {
      columns.push({ label: 'Events For', sortKey: 'subaccount_id' });
    }

    return columns;
  };

  getRowData = ({
    id,
    name,
    target,
    subaccount_id,
    last_successful,
    last_failure,
    subaccount_name,
  }) => {
    const { hasSubaccounts } = this.props;
    const nameLink = (
      <PageLink to={`/webhooks/details/${id}${setSubaccountQuery(subaccount_id)}`}>{name}</PageLink>
    );
    const row = [
      nameLink,
      target,
      last_successful ? formatDateTime(last_successful) : null,
      last_failure ? formatDateTime(last_failure) : null,
    ];

    if (hasSubaccounts) {
      row.push(
        <Subaccount
          id={subaccount_id}
          master={subaccount_id === 0}
          receiveAll={!subaccount_id && subaccount_id !== 0}
          name={subaccount_name}
        />,
      );
    }

    return row;
  };

  renderError() {
    const { error, listWebhooks } = this.props;
    return (
      <ApiErrorBanner
        message="Sorry, we seem to have had some trouble loading your webhooks."
        errorDetails={error.message}
        reload={listWebhooks}
      />
    );
  }

  renderCollection() {
    const { webhooks } = this.props;
    return (
      <TableCollection
        columns={this.getColumns()}
        rows={webhooks}
        getRowData={this.getRowData}
        pagination={true}
        filterBox={filterBoxConfig}
        defaultSortColumn="name"
      />
    );
  }

  render() {
    const { loading, error, webhooks } = this.props;

    if (loading) {
      return <Loading />;
    }

    return (
      <Page
        primaryAction={{ content: 'Create Webhook', as: PageLink, to: '/webhooks/create' }}
        title="Webhooks"
        empty={{
          show: !error && webhooks.length === 0,
          image: Setup,
          title: 'Create a Webhook',
          content: <p>Push message events directly to your own endpoints</p>,
        }}
      >
        {error ? this.renderError() : this.renderCollection()}
      </Page>
    );
  }
}

function mapStateToProps(state) {
  return {
    hasSubaccounts: hasSubaccounts(state),
    webhooks: selectWebhooks(state),
    loading: state.webhooks.listLoading,
    error: state.webhooks.listError,
    subaccounts: state.subaccounts.list,
  };
}

export default withRouter(
  connect(mapStateToProps, { listWebhooks, listSubaccounts })(WebhooksList),
);
