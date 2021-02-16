/* eslint-disable */
import { Machine, assign } from 'xstate';
import { getLocalTimezone } from 'src/helpers/date';
import config from 'src/config';
import { metricsFormMachine, METRICS_FORM_MACHINE_ID } from './metricsFormMachine';
import { createReportMachine, CREATE_REPORT_FORM_MACHINE_ID } from './createReportMachine';

const DEFAULT_REPORT_STATE = {
  METRICS: config.reportBuilder.defaultMetrics, // TODO: Why is this stored globally? Could it just be stored here as an of values?
  TIMEZONE: getLocalTimezone(),
  RANGE: '7days',
  PRECISION: 'hour',
};

const ANALYTICS_REPORT_MACHINE_ID = 'analyticsReport';

export const analyticsReportMachine = Machine({
  id: ANALYTICS_REPORT_MACHINE_ID,
  initial: 'parsingURL',
  context: {
    report: undefined, // The currently selected saved report
    metrics: [], // Currently selected metrics
    filters: undefined, // The deprecated `filters` query string param that still needs to be handled
    query_filters: undefined, // Metrics filters applied via [advanced filters](https://developers.sparkpost.com/api/metrics/#header-advanced-filters)
    comparisons: undefined,
    from: undefined,
    to: undefined,
    range: undefined,
    precision: undefined,
    timezone: undefined,
  },
  states: {
    updatingURL: {
      // TODO: Add URL updating logic here
      after: {
        250: 'parsingURL',
      },
    },
    invalidURLError: {},
    parsingURL: {
      // TODO: Add URL parsing logic here
      after: {
        250: 'fetching',
      },
    },
    fetching: {
      // TODO: Add fetching logic here
      after: {
        250: 'editing',
      },
    },
    editing: {
      on: {
        SAVED_REPORT_CHANGE: {},
        SAVE_NEW_REPORT_CLICK: {
          target: 'creatingReport',
        },
        EDIT_DETAILS_CLICK: {
          target: 'editingSavedReportDetails',
        },
        SAVE_CHANGES_CLICK: {},
        SCHEDULE_REPORT_CLICK: {},
        VIEW_ALL_REPORTS_CLICK: {},
        DATE_RANGE_CHANGE: {},
        TIME_ZONE_CHANGE: {},
        PRECISION_CHANGE: {},
        REMOVE_METRIC: {},
        ADD_METRICS_CLICK: {
          target: 'addingMetrics',
        },
        REMOVE_FILTER_CLICK: {},
        ADD_FILTERS_CLICK: {},
        ADD_COMPARISONS_CLICK: {},
        BREAK_DOWN_BY_CHANGE: {},
        TOP_DOMAINS_ONLY_CHANGE: {},
      },
    },
    editingSavedReportDetails: {},
    creatingReport: {
      invoke: {
        id: CREATE_REPORT_FORM_MACHINE_ID,
        src: createReportMachine,
        onDone: 'updatingURL',
        onError: {}, // TODO: handle this error
      },
      on: {
        CLOSE_MODAL: {
          target: 'editing',
        },
      },
    },
    addingMetrics: {
      invoke: {
        id: METRICS_FORM_MACHINE_ID,
        src: metricsFormMachine,
        onDone: 'updatingURL',
        onError: {}, // TODO: handle this error
      },
      on: {
        CLOSE_DRAWER: {
          target: 'editing',
        },
      },
    },
  },
});

// ⚔️ Actions ⚔️ - https://xstate.js.org/docs/guides/actions.html

function setDefaultMetrics() {
  return assign(() => {
    return {
      metrics: DEFAULT_REPORT_STATE.METRICS,
    };
  });
}

function setDefaultTimezone() {
  return assign(() => {
    return {
      timezone: DEFAULT_REPORT_STATE.TIMEZONE,
    };
  });
}

function setDefaultRange() {
  return assign(() => {
    return {
      range: DEFAULT_REPORT_STATE.RANGE,
    };
  });
}

function setDefaultPrecision() {
  return assign(() => {
    return {
      precision: DEFAULT_REPORT_STATE.PRECISION,
    };
  });
}

function setNewReportName() {
  return assign((context, event) => {
    const { newSavedReport } = context;

    return {
      newSavedReport: {
        ...newSavedReport,
        name: event.value,
      },
    };
  });
}

// 🛡️ Guards 🛡️ - https://xstate.js.org/docs/guides/guards.html
function hasReport(context) {
  return Boolean(context.report);
}

function hasMetrics(context) {
  return Boolean(context.metrics.length);
}

function hasFilters(context) {
  return Boolean(context.query_filters.length);
}

function hasComparisons(context) {
  return Boolean(context.comparisons.length);
}

function hasRange(context) {
  return Boolean(context.range);
}

function hasTimezone(context) {
  return Boolean(context.timezone);
}
