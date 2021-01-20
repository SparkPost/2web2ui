import React, { Component } from 'react';

import { Page } from 'src/components/matchbox';
import { Loading, ApiErrorBanner, TableCollection } from 'src/components';
import { Users } from 'src/components/images';
import { PageLink } from 'src/components/links';
import RecipientListEmptyState from './components/RecipientListEmptyState';
import InfoBanner from './components/InfoBanner';
import { LINKS } from 'src/constants';

const columns = [
  { label: 'Name', sortKey: 'name' },
  { label: 'ID', sortKey: 'id' },
  { label: 'Recipients', sortKey: 'total_accepted_recipients', width: '20%' },
];

const primaryAction = {
  content: 'Create Recipient List',
  Component: PageLink,
  to: '/lists/recipient-lists/create',
};

const getRowData = ({ name, id, total_accepted_recipients }) => [
  <PageLink to={`/lists/recipient-lists/edit/${id}`}>{name}</PageLink>,
  id,
  total_accepted_recipients,
];

export class ListPage extends Component {
  state = { isFirstRender: true };

  componentDidMount() {
    this.setState({ isFirstRender: false });
    this.props.listRecipientLists();
  }

  onReloadApiBanner = () => {
    this.props.listRecipientLists({ force: true }); // force a refresh
  };

  renderError() {
    return (
      <ApiErrorBanner
        errorDetails={this.props.error.message}
        message="Sorry, we ran into an error loading Recipient Lists"
        reload={this.onReloadApiBanner}
      />
    );
  }

  renderCollection() {
    return (
      <TableCollection
        columns={columns}
        getRowData={getRowData}
        pagination={true}
        rows={this.props.recipientLists}
        filterBox={{
          show: true,
          keyMap: { count: 'total_accepted_recipients' },
          exampleModifiers: ['name', 'id', 'count'],
          itemToStringKeys: ['name', 'id'],
        }}
        defaultSortColumn="name"
      />
    );
  }

  render() {
    const { error, loading, recipientLists, isHibanaEnabled } = this.props;

    if (loading) {
      return <Loading />;
    }

    return (
      <Page
        title="Recipient Lists"
        primaryAction={primaryAction}
        empty={{
          show: !error && recipientLists.length === 0,
          image: Users,
          content: <p>Manage your recipient lists</p>,
          secondaryAction: {
            content: 'Learn More',
            to: LINKS.RECIP_API,
            external: true,
          },
        }}
        hibanaEmptyStateComponent={RecipientListEmptyState}
        loading={loading || this.state.isFirstRender}
      >
        {!error && isHibanaEnabled && <InfoBanner />}
        {error ? this.renderError() : this.renderCollection()}
      </Page>
    );
  }
}

export default ListPage;
