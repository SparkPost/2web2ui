import React, { Component } from 'react'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import qs from 'query-string';
import {
  verifyMailboxToken,
  verifyAbuseToken,
  verifyPostmasterToken,
} from 'src/actions/sendingDomains';
import { showAlert } from 'src/actions/globalAlert';
import _ from 'lodash';

export class VerifyToken extends Component {
  // This component mounts within the ListPage's Page component
  // Which means domains have already been loaded by the time this mounts
  componentDidMount() {
    this.verifyDomain(qs.parse(this.props.location.search));
  }

  verifyDomain({ mailbox, domain, token }) {
    const { domains, verifyMailboxToken, verifyAbuseToken, verifyPostmasterToken } = this.props;

    // Find the domain to inject subaccount
    const sendingDomain = _.find(domains, { domain });

    if (sendingDomain && mailbox && domain && token) {
      const subaccount = !isNaN(parseInt(sendingDomain.subaccount_id))
        ? sendingDomain.subaccount_id
        : undefined;
      let verifyAction = verifyMailboxToken;

      if (mailbox === 'abuse') {
        verifyAction = verifyAbuseToken;
      }

      if (mailbox === 'postmaster') {
        verifyAction = verifyPostmasterToken;
      }

      return verifyAction({ id: domain, token, subaccount });
    }
  }

  componentDidUpdate(prevProps) {
    const { tokenStatus, showAlert, history } = this.props;

    // Api returns a 200 even if domain has not been verified
    // Manually check if this domain has been verified
    if (!prevProps.tokenStatus && tokenStatus) {
      if (tokenStatus[`${tokenStatus.type}_status`] !== 'valid') {
        showAlert({ type: 'error', message: `Unable to verify ${tokenStatus.domain}` });
      } else {
        showAlert({ type: 'success', message: `${tokenStatus.domain} has been verified` });
        history.push(`/account/sending-domains/edit/${tokenStatus.domain}`);
      }
    }
  }

  render() {
    return null;
  }
}

const mapStateToProps = state => ({
  domains: state.sendingDomains.list,
  tokenStatus: state.sendingDomains.verifyTokenStatus,
});

const mapDispatchToProps = {
  showAlert,
  verifyMailboxToken,
  verifyAbuseToken,
  verifyPostmasterToken,
};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(VerifyToken));
