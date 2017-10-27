import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { listPools } from 'src/actions/ipPools';
import { Loading, TableCollection, ApiErrorBanner } from 'src/components';
import { Page } from '@sparkpost/matchbox';

const columns = ['Name', 'ID', 'Number of IPs Assigned'];
const getRowData = ({ id, name, ips }) => {
  const nameLink = <Link to={'/account/ip-pools'}>{name}</Link>;
  return [nameLink, id, ips.length.toString()];
};

export class IpPoolsList extends Component {

  componentDidMount() {
    this.props.listPools();
  }

  renderError() {
    const { error, listPools } = this.props;
    return (
      <ApiErrorBanner
        message={'Sorry, we seem to have had some trouble loading your ip pools.'}
        errorDetails={error.message}
        reload={listPools}
      />
    );
  }

  renderCollection() {
    const { ipPools } = this.props;
    return (
      <TableCollection
        columns={columns}
        rows={ipPools}
        getRowData={getRowData}
        pagination={true}
        filterBox={{
          show: true,
          exampleModifiers: ['name', 'id'],
          itemToStringKeys: ['name', 'id']
        }}
      />
    );
  }

  render() {
    const { loading, error } = this.props;

    if (loading) {
      return <Loading />;
    }

    const createAction = { content: 'Create IP Pool', Component: Link, to: '/account/ip-pools' }; // TODO redirect to create
    const purchaseAction = { content: 'Purchase IPs', Component: Link, to: '/account/billing' };

    return (
      <Page
        primaryAction={createAction}
        title={'IP Pools'}
        empty={{
          test: false, // TODO check purchased IPs
          title: 'Boost your deliverability',
          image: 'Setup',
          content: <p>Purchase dedicated IPs to manage your IP Pools</p>,
          secondaryAction: createAction,
          primaryAction: purchaseAction
        }}>
        { error ? this.renderError() : this.renderCollection() }
      </Page>
    );
  }
}

function mapStateToProps({ ipPools }) {
  return {
    ipPools: ipPools.list,
    loading: ipPools.listLoading,
    error: ipPools.listError
  };
}

export default connect(mapStateToProps, { listPools })(IpPoolsList);
