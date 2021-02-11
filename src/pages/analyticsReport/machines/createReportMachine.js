import { Machine } from 'xstate';

export const CREATE_REPORT_FORM_MACHINE_ID = 'createReport';

export const createReportMachine = Machine({
  id: CREATE_REPORT_FORM_MACHINE_ID,
  initial: 'editing',
  states: {
    editing: {},
    error: {},
    created: {
      type: 'final',
    },
  },
});
