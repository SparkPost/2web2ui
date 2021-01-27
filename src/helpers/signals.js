import _ from 'lodash';
import { roundToPlaces } from 'src/helpers/units';
import { getRelativeDates } from 'src/helpers/date';
import thresholds from 'src/pages/signals/constants/healthScoreThresholds';
import { MAILBOX_PROVIDERS } from 'src/constants';
import moment from 'moment';

const translateSubaccount = id => {
  // Note: Subaccount -1 (aggregate of all subaccounts) does not have a details Page

  if (String(id) === '0') {
    return 'Primary Account';
  }

  return `Subaccount ${id}`;
};

const translateFacet = (facet, id) => {
  switch (facet) {
    case 'mb_provider':
      return MAILBOX_PROVIDERS[id] || id;
    case 'ip_pool':
      return `IP Pool ${id}`;
    case 'sending_domain':
      return id;
    case 'campaign_id':
      return `Campaign ${id}`;
    case 'sid':
      return translateSubaccount(id);
  }
};

export const getFriendlyTitle = ({ facet, facetId, subaccountId }) => {
  if (!facet) {
    return null;
  }

  const facetText = translateFacet(facet, facetId);
  let subaccountSuffix = '';

  if (!_.isNil(subaccountId)) {
    subaccountSuffix = `for ${translateSubaccount(subaccountId)}`;
  }

  return `${facetText} ${subaccountSuffix}`.trim();
};

export const getDoD = (current, before) => {
  if (_.isNil(current) || _.isNil(before)) {
    return null;
  }

  return roundToPlaces(((current - before) / before) * 100, 1);
};

export const getCaretProps = (value, reverse) => {
  let direction;
  let color;

  if (value > 0) {
    direction = 'up';
    color = !reverse ? thresholds.good.color : thresholds.danger.color;
  }

  if (value < 0) {
    direction = 'down';
    color = !reverse ? thresholds.danger.color : thresholds.good.color;
  }

  return { direction, color };
};

export const getDates = ({ from, relativeRange, to, now = new Date() } = {}) => {
  let options = { from, to, relativeRange };

  if (relativeRange !== 'custom') {
    options = {
      ...getRelativeDates(relativeRange, {
        now: moment(now)
          .subtract(1, 'day')
          .toDate(),
      }),
      relativeRange: relativeRange,
    };
  }

  return options;
};

export function getValidSignalsDateRange({ from, to }) {
  const now = moment();

  const validDates = _.every(
    _.map([from, to, now], date => moment.isMoment(date) && date.isValid()),
  );
  const isGreaterThan7Days = Math.abs(to.diff(from, 'days')) >= 6; //Needs to be 6 due to 1/1 12:00 am - 1/6 11:59pm date ranges

  if (validDates && isGreaterThan7Days && from.isBefore(to) && to.isBefore(now)) {
    const utcOffset = moment().utcOffset();
    //Matches the day given in UTC to your local time.
    //So 1/2 0000 UTC = 1/1 2000 EST(-4). Then subtract -4 hours (-240 minutes) to get 1/2 0000 EST(-4)
    const adjustedFrom = from.subtract(utcOffset, 'minutes').startOf('day');
    const adjustedTo = to.subtract(utcOffset, 'minutes').endOf('day');
    return { from: adjustedFrom, to: adjustedTo };
  }

  if (!validDates) {
    throw new Error('Invalid date format given');
  }

  if (!isGreaterThan7Days) {
    throw new Error('Range must be at least 7 days');
  }

  throw new Error('Invalid date range given');
}
