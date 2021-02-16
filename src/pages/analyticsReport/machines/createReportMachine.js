import { Machine, assign } from 'xstate';

export const CREATE_REPORT_FORM_MACHINE_ID = 'createReport';

const handleFieldChange = assign((_context, event) => {
  return {
    [event.name]: event.value,
    error: null,
  };
});

const commonEditingEvents = {};

export const createReportMachine = Machine({
  id: CREATE_REPORT_FORM_MACHINE_ID,
  initial: 'editing',
  context: {
    name: {
      value: '',
      error: null,
    },
    description: {
      value: '',
      error: null,
    },
    editable: {
      value: '',
    },
  },
  states: {
    editing: {
      on: {
        CHANGE_FIELD_VALUE: {
          actions: handleFieldChange,
        },
        SUBMIT_FORM: [
          {
            target: 'saving',
            cond: requiredFieldsFilled,
          },
          {
            target: 'error',
          },
        ],
      },
    },
    error: {
      entry: {
        actions: '@focusError',
      },
      on: {
        CHANGE_FIELD_VALUE: {
          target: 'editing',
        },
        // If the form is still in the error state, then the error wasn't fixed - so refocus it!
        SUBMIT_FORM: {
          target: 'error',
          internal: true,
          actions: ['@focusError'],
        },
      },
    },
    saving: {
      // TODO: Invoke network request here
      target: 'submitted',
    },
    submitted: {
      type: 'final',
    },
  },
});

function requiredFieldsFilled(context) {
  return Boolean(context.name.length);
}
