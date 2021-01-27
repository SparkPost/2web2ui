import { getSubaccounts, selectSubaccountIdFromQuery } from 'src/selectors/subaccounts';
import { createSelector } from 'reselect';
import { formatDateTime } from 'src/helpers/date';
import _ from 'lodash';
import { getSubaccountsIndexedById, getSubaccountName } from './subaccounts';

const selectBatches = state => state.webhooks.batches;
const formatStatus = code => (_.inRange(code, 200, 300) ? 'Success' : 'Fail');
const getCurrentWebhook = state => state.webhooks.webhook || {};
const getWebhooks = state => state.webhooks.list || [];
export const selectWebhookBatches = state => {
  const batches = selectBatches(state);

  return batches.map(batch => ({
    ...batch,
    status: formatStatus(batch.response_code),
    formatted_time: formatDateTime(batch.ts),
  }));
};

export const selectWebhooks = createSelector(
  [getWebhooks, getSubaccountsIndexedById],
  (webhooks, subaccounts) =>
    webhooks.map(webhook => ({
      ...webhook,
      subaccount_name: getSubaccountName(subaccounts, webhook.subaccount_id),
    })),
);

/*
 * Selects subaccount object from qp
 * Used to fill in initial values for the subaccount typeahead
 * A variation of the selectSubaccountFromQuery subaccount selector
 */
export const selectInitialSubaccountValue = createSelector(
  [getSubaccounts, selectSubaccountIdFromQuery],
  (subaccounts, id) => {
    if (Number(id) === 0) {
      return 'Primary account only';
    }

    if (id === undefined) {
      return 'Primary and all subaccounts';
    }

    return _.find(subaccounts, { id: Number(id) });
  },
);

export const getSelectedEvents = createSelector([getCurrentWebhook], ({ events = [] }) =>
  events.reduce((hash, key) => ({ ...hash, [key]: true }), {}),
);
