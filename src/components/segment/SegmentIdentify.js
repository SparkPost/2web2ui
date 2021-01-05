import { useEffect } from 'react';
import { connect } from 'react-redux';
import { segmentIdentify, SEGMENT_TRAITS } from 'src/helpers/segment';
import getConfig from 'src/helpers/getConfig';
import { usernameSelector } from 'src/selectors/currentUser';

export const SegmentIdentify = ({ accessControlReady, ...traits }) => {
  // Any time a trait changes, inform segment via "IDENTIFY" event
  useEffect(() => {
    if (accessControlReady) {
      segmentIdentify({
        ...traits,
        tenant: getConfig('tenantId'),
      });
    }
  }, [accessControlReady, traits]);

  return null;
};

const mapStateToProps = state => ({
  accessControlReady: state.accessControlReady,
  [SEGMENT_TRAITS.CUSTOMER_ID]: state.account.customer_id,
  [SEGMENT_TRAITS.USER_ID]: usernameSelector(state),
  [SEGMENT_TRAITS.EMAIL]: state.currentUser.email,
  [SEGMENT_TRAITS.CREATED_AT]: state.currentUser.created,
  [SEGMENT_TRAITS.SERVICE_LEVEL]: state.account.service_level,
  [SEGMENT_TRAITS.PLAN]: state.account?.subscription?.code,
  [SEGMENT_TRAITS.USER_ROLE]: state.currentUser.access_level,
  [SEGMENT_TRAITS.COMPANY]: state.account.company_name,
  [SEGMENT_TRAITS.FIRST_NAME]: state.currentUser.first_name,
  [SEGMENT_TRAITS.LAST_NAME]: state.currentUser.last_name,
  [SEGMENT_TRAITS.SSO_ENABLED]: Boolean(state.currentUser.is_sso),
  [SEGMENT_TRAITS.TFA_ENABLED]: Boolean(state.currentUser.tfa_enabled),
});

export default connect(mapStateToProps, {})(SegmentIdentify);
