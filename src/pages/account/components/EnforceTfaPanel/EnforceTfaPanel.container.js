import { connect } from 'react-redux';
import { showAlert } from 'src/actions/globalAlert';
import {
  getAccountSingleSignOnDetails,
  updateAccountSingleSignOn,
} from 'src/actions/accountSingleSignOn';
import { getTfaStatus } from 'src/actions/tfa';
import { logout } from 'src/actions/auth';
import { update as updateAccount } from 'src/actions/account';
import { hasAccountOptionEnabled } from 'src/helpers/conditions/account';
import EnforceTfaPanel from './EnforceTfaPanel';

const mapStateToProps = state => {
  const { accountSingleSignOn, account, tfa } = state;
  return {
    loading: accountSingleSignOn.loading || tfa.enabled === null,
    ssoEnabled: accountSingleSignOn.enabled,
    tfaRequired: account.tfa_required,
    tfaUpdatePending: account.updateLoading,
    tfaEnabled: tfa.enabled,
    tfaRequiredEnforced: hasAccountOptionEnabled('enforce_tfa_required')(state),
  };
};

const mapDispatchToProps = {
  getAccountSingleSignOnDetails,
  getTfaStatus,
  updateAccountSingleSignOn,
  updateAccount,
  logout,
  showAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(EnforceTfaPanel);
