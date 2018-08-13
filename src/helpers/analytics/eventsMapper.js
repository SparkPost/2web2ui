import _ from 'lodash';
import { ANALYTICS_WHITELISTED_FORMS } from 'src/constants';
import { all } from 'src/helpers/conditions/compose';

// access helpers
const getErrorMessage = (action) => _.get(action, 'payload.error.message');
const getErrorName = (action) => _.get(action, 'payload.error.name');
const getFormName = (action) => _.get(action, 'meta.form');
const getType = (action) => action.type;

// condition helpers
const isError = (name) => (action) => name === getErrorName(action);
const isType = (type) => (action) => type === getType(action);
const isTypeLike = (regex) => (action) => regex.test(getType(action));
const isWhitelistedForm = (action) => ANALYTICS_WHITELISTED_FORMS.includes(getFormName(action));

/**
 * @example
 *   {
 *     // logic to map action to event
 *     condition: isType('TEST'),
 *
 *     // event tracking parameters for Google Tag Manager (GTM) and Analytics (GA)
 *     // SEE: https://www.optimizesmart.com/event-tracking-guide-google-analytics-simplified-version/
 *     definition: {
 *
 *       // used in GTM triggers
 *       event: 'ui-something',
 *
 *       // used to group similar events in GA
 *       category: 'YouTube Videos'
 *
 *       // used as a tag in GA to describe the interaction
 *       action: 'play'
 *
 *       // used in GA as more detail for the action
 *       label: 'Mission Impossible - Fallout'
 *     }
 *   }
 */
const events = [
  {
    condition: all(isTypeLike(/_FAIL$/), isError('SparkpostApiError')),
    definition: {
      event: 'ui-api-request',
      category: 'API',
      action: getType,
      label: getErrorMessage
    }
  },
  {
    condition: all(isTypeLike(/_FAIL$/), isError('ZuoraApiError')),
    definition: {
      event: 'ui-api-request',
      category: 'API',
      action: getType,
      label: getErrorMessage
    }
  },
  {
    condition: all(isType('@@redux-form/INITIALIZE'), isWhitelistedForm),
    definition: {
      event: 'Interactions',
      category: 'Form',
      action: 'Initialize',
      label: getFormName
    }
  },
  {
    condition: all(isType('@@redux-form/START_SUBMIT'), isWhitelistedForm),
    definition: {
      event: 'Interactions',
      category: 'Form',
      action: 'Submit',
      label: getFormName
    }
  },
  {
    condition: all(isType('@@redux-form/SET_SUBMIT_FAILED'), isWhitelistedForm),
    definition: {
      event: 'Interactions',
      category: 'Form',
      action: 'Submit Failure',
      label: getFormName
    }
  },
  {
    condition: all(isType('@@redux-form/SET_SUBMIT_SUCCEEDED'), isWhitelistedForm),
    definition: {
      event: 'Interactions',
      category: 'Form',
      action: 'Submit Success',
      label: getFormName
    }
  }
];

export default function eventsMapper(action) {
  const event = events.find(({ condition }) => condition(action));

  if (!event) {
    return; // skip
  }

  return _.mapValues(event.definition, (value) => _.isFunction(value) ? value(action) : value);
}
