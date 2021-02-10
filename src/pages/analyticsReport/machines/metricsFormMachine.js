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
        },
        CLEAR_METRICS_CLICK: {},
      },
    },
    applied: {
      // TODO: Send data to parent
      type: 'final',
    },
  },
});
