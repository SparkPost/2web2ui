import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { hasAutoVerifyEnabledSelector } from 'src/selectors/account';
import { selectDomain } from 'src/selectors/sendingDomains';
import {
  get as getDomain,
  remove as deleteDomain,
  update as updateDomain,
  clearSendingDomain,
} from 'src/actions/sendingDomains';
import { showAlert } from 'src/actions/globalAlert';
import { Loading, DeleteModal } from 'src/components';
import { PageLink } from 'src/components/links';
import { Button, Page } from 'src/components/matchbox';
import AssignTrackingDomain from './components/AssignTrackingDomain';
import EditBounce from './components/EditBounce';
import SetupSending from './components/SetupSending';
import RedirectAndAlert from 'src/components/globalAlert/RedirectAndAlert';
import { GUIDE_IDS } from 'src/constants';
import { DomainStatus } from './components/DomainStatus';

const breadcrumbAction = {
  content: 'Sending Domains',
  Component: PageLink,
  to: '/account/sending-domains',
};

export class EditPage extends Component {
  state = {
    showDelete: false,
  };

  toggleDelete = () => this.setState({ showDelete: !this.state.showDelete });

  afterDelete = () => {
    this.toggleDelete();
    this.props.history.push('/account/sending-domains');
  };

  deleteDomain = () => {
    const {
      domain: { id, subaccount_id: subaccount },
      deleteDomain,
      showAlert,
    } = this.props;

    return deleteDomain({ id, subaccount }).then(() => {
      showAlert({
        type: 'success',
        message: `Domain ${id} deleted.`,
      });
      this.afterDelete();
    });
  };

  shareDomainChange = () => {
    const {
      domain: { id, shared_with_subaccounts, subaccount_id: subaccount },
      updateDomain,
    } = this.props;

    return updateDomain({ id, subaccount, shared_with_subaccounts: !shared_with_subaccounts });
  };

  componentDidMount() {
    this.props.getDomain(this.props.match.params.id);
  }

  componentWillUnmount() {
    this.props.clearSendingDomain();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location?.state?.triggerGuide) {
      if (window.Appcues) {
        window.Appcues.show(GUIDE_IDS.VERIFY_SENDING_DOMAIN);
      }
    }
  }

  render() {
    const {
      domain,
      error,
      hasAutoVerifyEnabled,
      loading,
      match: {
        params: { id },
      },
    } = this.props;

    if (error) {
      return (
        <RedirectAndAlert
          to="/account/sending-domains"
          alert={{ type: 'error', message: error.message }}
        />
      );
    }

    if (loading) {
      return <Loading />;
    }

    return (
      <Page
        title={`Edit ${id}`}
        primaryArea={
          <Button variant="destructive" onClick={this.toggleDelete}>
            Delete
          </Button>
        }
        breadcrumbAction={breadcrumbAction}
      >
        <div>
          <DomainStatus
            domain={domain}
            hasAutoVerifyEnabled={hasAutoVerifyEnabled}
            onShareDomainChange={this.shareDomainChange}
          />
          <SetupSending domain={domain} />
          <EditBounce id={id} domain={domain} />
          <AssignTrackingDomain domain={domain} />
        </div>
        <DeleteModal
          open={this.state.showDelete}
          title="Are you sure you want to delete this sending domain?"
          content={<p>Any future transmission that uses this domain will be rejected.</p>}
          onCancel={this.toggleDelete}
          onDelete={this.deleteDomain}
        />
      </Page>
    );
  }
}

const mapStateToProps = state => ({
  hasAutoVerifyEnabled: hasAutoVerifyEnabledSelector(state),
  domain: selectDomain(state),
  error: state.sendingDomains.getError,
  loading: state.sendingDomains.getLoading,
});

const mapDispatchToProps = {
  clearSendingDomain,
  getDomain,
  deleteDomain,
  updateDomain,
  showAlert,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EditPage));
