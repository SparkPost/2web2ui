import { isCustomBilling } from 'src/helpers/conditions/account';
import { formatCreateData, formatDataForCors } from 'src/helpers/billing';
import { fetch as fetchAccount, getBillingInfo } from './account';
import chainActions from 'src/actions/helpers/chainActions';
import {
  cors,
  createZuoraAccount,
  syncBillingSubscription,
  syncSubscription,
  consumePromoCode,
} from './billing';

export default function billingCreate(values) {
  return (dispatch, getState) => {
    const { corsData, billingData } = formatDataForCors(values);
    // action creator wrappers for chaining as callbacks
    const corsCreateBilling = ({ meta }) =>
      cors({ meta, context: 'create-account', data: corsData });
    const fetchUsage = ({ meta }) => fetchAccount({ include: 'usage', meta });
    const fetchBillingInfo = ({ meta }) => getBillingInfo({ meta });
    const constructZuoraAccount = ({ results: { signature, token, ...results }, meta }) => {
      const state = getState();
      const invoiceCollect = !isCustomBilling(state); // don't send initial invoice for custom plans
      const data = formatCreateData({ ...results, ...billingData, invoiceCollect });

      // add user's email when creating account
      data.billToContact.workEmail = state.currentUser.email;
      return createZuoraAccount({ data, token, signature, meta });
    };

    const actions = [
      corsCreateBilling,
      constructZuoraAccount,
      syncSubscription,
      syncBillingSubscription,
      fetchUsage,
      fetchBillingInfo,
    ];
    if (values.promoCode) {
      const consumePromo = ({ meta }) =>
        consumePromoCode({ meta, promoCode: values.promoCode, billingId: billingData.billingId });
      actions.push(consumePromo);
    }
    dispatch({ type: 'BILLING_CREATE_PENDING' });

    return dispatch(chainActions(...actions)())
      .then(() => dispatch({ type: 'BILLING_CREATE_SUCCESS' }))
      .catch(() => dispatch({ type: 'BILLING_CREATE__ERROR' }));
  };
}
