import qs from 'query-string';
import _ from 'lodash';
import { getRelativeDates, relativeDateOptions } from 'src/helpers/date';
import { ALL_EVENTS_FILTERS } from 'src/constants';

/*
 * Translate the array of event definitions from /message-events/events/documentation
 * into an map of event type to event field descriptions.
 * [ {[fieldName]: { sampleValue, description }}, ... ] -> { type: { [fieldName]: description }, ... displayName, description }
 *
 * Note: we treat display_name and event_description fields specially. They are not true event fields.
 * They're metadata and their sampleValue fields contain their 'value'.
 */
export function formatDocumentation(data) {
  const events = {};

  /* eslint-disable lodash/preferred-alias */
  _.each(data, event => {
    const {
      type,
      display_name: { sampleValue: displayName },
      event_description: { sampleValue: description },
      ...rest
    } = event;
    const fieldDescriptions = _.mapValues(rest, ({ description }) => description);
    events[type.sampleValue] = {
      displayName,
      description,
      ...fieldDescriptions,
    };
  });
  /* eslint-enable lodash/preferred-alias */

  return events;
}
export function parseSearch(search) {
  const { from, to, range, ...rest } = qs.parse(search);
  // If the passed in range is present in configuration, then a valid range has been set
  const hasValidRange =
    range && Boolean(relativeDateOptions.filter(option => option.value === range).length);
  let dateOptions = {};

  if (from) {
    dateOptions.from = new Date(from);
  }

  if (to) {
    dateOptions.to = new Date(to);
  }

  if (hasValidRange) {
    dateOptions = { ...dateOptions, ...getRelativeDates(range, { roundToPrecision: false }) };
  }

  const transformedParams = transformParams(rest);

  const options = _.mapValues(transformedParams, filter =>
    typeof filter === 'string' ? [filter] : filter,
  );

  return { dateOptions, ...options };
}

export function getDetailsPath(messageId, eventId) {
  return `/reports/message-events/details/${
    messageId ? `${messageId}/${eventId}` : `_noid_/${eventId}`
  }`;
}

/**
 * Creates an object with all search filters set to an empty array
 * @param {Object} filters - Object in the form of {key: value, ...}.
 * @returns {Object} - Object in the form {key: [],...}.
 */
export function getEmptyFilters(filters) {
  // Build an array of objects of form { value: [] }
  const emptyFilters = _.map(filters, (value, key) => ({ [key]: [] }));

  return Object.assign({}, ...emptyFilters);
}

/**
 * Transforms the query parameters object to change old ME params -> new Events params
 * and remove unsupported params.
 * @param {Object} params - Query parameters.
 * @returns {Object} - Transformed and filtered query parameters.
 */
function transformParams(params) {
  const oldFiltersToNewFilters = {
    transmission_ids: 'transmissions',
    campaign_ids: 'campaigns',
    template_ids: 'templates',
    ab_test_ids: 'ab_tests',
    message_ids: 'messages',
    friendly_froms: 'from_addresses',
  };

  const transformedParams = _.reduce(
    params,
    (accumulator, value, key) => {
      if (ALL_EVENTS_FILTERS.hasOwnProperty(key)) {
        accumulator[key] = value;
        return accumulator;
      }
      if (oldFiltersToNewFilters.hasOwnProperty(key)) {
        const newKey = oldFiltersToNewFilters[key];
        accumulator[newKey] = value;
        return accumulator;
      }
      return accumulator;
    },
    {},
  );
  return transformedParams;
}
