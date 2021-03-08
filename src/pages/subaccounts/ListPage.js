import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TableCollection, ApiErrorBanner } from 'src/components';
import { Users } from 'src/components/images';
import { PageLink } from 'src/components/links';
import { Page } from 'src/components/matchbox';
import { list as listSubaccounts } from 'src/actions/subaccounts';
import { selectSubaccounts } from 'src/selectors/subaccounts';
import getRowData from './helpers/getRowData';
import { LINKS } from 'src/constants';
import InfoBanner from './components/InfoBanner';
import SubaccountEmptyState from './components/SubaccountEmptyState';
import { useHibana } from 'src/context/HibanaContext';
import { CREATE_SUBACCOUNT } from 'src/constants';

const columns = [
  { label: 'Name', width: '40%', sortKey: 'name' },
  { label: 'ID', width: '20%', sortKey: 'id' },
  { label: 'Status', width: '20%', sortKey: 'status' },
];

const primaryAction = {
  content: 'Create Subaccount',
  Component: PageLink,
  to: CREATE_SUBACCOUNT,
};

export class ListPage extends Component {
  state = {
    isFirstRender: true, //this is set to display loading on the first render
  };

  componentDidMount() {
    this.setState({ isFirstRender: false });
    this.props.listSubaccounts();
  }

  onReloadApiBanner = () => {
    this.props.listSubaccounts();
  };

  renderCollection() {
    return (
      <TableCollection
        columns={columns}
        getRowData={getRowData}
        pagination={true}
        rows={this.props.subaccounts}
        filterBox={{
          show: true,
          exampleModifiers: ['name', 'id', 'status'],
          itemToStringKeys: ['name', 'id'],
        }}
        defaultSortColumn="id"
        defaultSortDirection="desc"
      />
    );
  }

  renderError() {
    return (
      <ApiErrorBanner
        errorDetails={this.props.error.message}
        message="Sorry, we ran into an error loading your Subaccounts"
        reload={this.onReloadApiBanner}
      />
    );
  }

  render() {
    const { error, loading, subaccounts } = this.props;

    return (
      <Page
        title="Subaccounts"
        primaryAction={primaryAction}
        empty={{
          show: subaccounts.length === 0,
          title: 'Manage your subaccounts',
          image: Users,
          content: <p>Subaccounts are a good way of managing external client accounts.</p>,
          secondaryAction: {
            content: 'Learn more',
            to: LINKS.SUBACCOUNTS_API,
            external: true,
          },
        }}
        hibanaEmptyStateComponent={SubaccountEmptyState}
        loading={loading || this.state.isFirstRender}
      >
        {this.props.isHibanaEnabled && <InfoBanner />}
        {error ? this.renderError() : this.renderCollection()}
      </Page>
    );
  }
}

const mapStateToProps = state => ({
  subaccounts: selectSubaccounts(state),
  loading: state.subaccounts.listLoading,
  error: state.subaccounts.listError,
});

function ListPageContainer(props) {
  const [{ isHibanaEnabled }] = useHibana();
  return <ListPage isHibanaEnabled={isHibanaEnabled} {...props} />;
}

export default connect(mapStateToProps, { listSubaccounts })(ListPageContainer);
