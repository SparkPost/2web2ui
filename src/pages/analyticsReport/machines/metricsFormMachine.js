import { Machine } from 'xstate';

export const METRICS_FORM_MACHINE_ID = 'addMetrics';

export const metricsFormMachine = Machine({
  id: METRICS_FORM_MACHINE_ID,
  initial: 'editing',
  context: {},
  states: {
    editing: {
      on: {
        METRIC_CHANGE: {},
        SUBMIT_FORM: {
          target: 'applied',
          // TODO: Add `cond` to check if a value is selected - throw error if not
        },
        CLEAR_METRICS_CLICK: {},
      },
    },
    error: {},
    applied: {
      // TODO: Send data to parent
      type: 'final',
    },
  },
});
