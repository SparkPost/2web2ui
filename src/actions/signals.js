import { formatInputDate } from 'src/helpers/date';
import { setSubaccountHeader } from 'src/helpers/subaccounts';
import sparkpostApiRequest from './helpers/sparkpostApiRequest';

// order_by param values do not match field names, so we have to translate here
const ORDER_BY_MAPPING = {
  current_engaged_recipients: 'c_14d',
  current_health_score: 'health_score',
  current_relative_engaged_recipients: 'perc',
  current_relative_trap_hits: 'perc',
  current_trap_hits: 'trap_hits',
  current_total_injection_count: 'total_injection_count',
};

const signalsActionCreator = ({ dimension, type }) => ({
  facet = '',
  filter,
  from,
  limit,
  offset,
  order,
  orderBy,
  subaccount,
  to,
}) => {
  let order_by;

  if (orderBy) {
    // To order by subaccount, only pass order direction and do not set order_by
    // does not apply to health score, and health score should set order_by: 'sid'
    order_by =
      orderBy === 'sid' && dimension !== 'health-score'
        ? undefined
        : ORDER_BY_MAPPING[orderBy] || orderBy;
  }

  if (facet === 'sid') {
    facet = '';
    subaccount = filter;
    filter = '';
  }

  //Block spam trap request for mb provider
  if (facet === 'mb_provider' && dimension === 'spam-hits') {
    return () => undefined;
  }

  return sparkpostApiRequest({
    type,
    meta: {
      method: 'GET',
      headers: setSubaccountHeader(subaccount),
      url: `/v1/signals/${dimension}/${facet}`,
      showErrorAlert: false,
      params: {
        filter,
        from: formatInputDate(from),
        limit,
        offset,
        order,
        order_by,
        to: formatInputDate(to),
      },
    },
  });
};

export const getEngagementRecency = signalsActionCreator({
  dimension: 'cohort-engagement',
  type: 'GET_ENGAGEMENT_RECENCY',
});

export const getEngagementRateByCohort = signalsActionCreator({
  dimension: 'eng-cohort',
  type: 'GET_ENGAGEMENT_RATE_BY_COHORT',
});

export const getUnsubscribeRateByCohort = signalsActionCreator({
  dimension: 'unsub-cohort',
  type: 'GET_UNSUBSCRIBE_RATE_BY_COHORT',
});

export const getComplaintsByCohort = signalsActionCreator({
  dimension: 'fbl-cohort',
  type: 'GET_COMPLAINTS_BY_COHORT',
});

export const getHealthScore = signalsActionCreator({
  dimension: 'health-score',
  type: 'GET_HEALTH_SCORE',
});

export const getCurrentHealthScore = signalsActionCreator({
  dimension: 'health-score',
  type: 'GET_CURRENT_HEALTH_SCORE',
});

export const getSpamHits = signalsActionCreator({
  dimension: 'spam-hits',
  type: 'GET_SPAM_HITS',
});
