import { Machine } from 'xstate';

export const addMetricsMachine = Machine({
  id: 'addMetrics',
  initial: 'editing',
  context: {},
  states: {
    editing: {
      on: {
        METRIC_CHANGE: {},
        APPLY_METRICS_CLICK: {
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
