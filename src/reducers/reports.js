const initialState = {
  createPending: false,
  list: [],
  status: 'idle',
  saveStatus: 'idle',
  saveScheduledReportStatus: 'idle',
  report: {},
  deletePending: false,
  getReportPending: false,
  scheduledReports: [],
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case 'CREATE_REPORT_PENDING':
      return { ...state, saveStatus: 'loading' };
    case 'CREATE_REPORT_SUCCESS':
      return { ...state, saveStatus: 'success' };
    case 'CREATE_REPORT_FAIL':
      return { ...state, saveStatus: 'error' };

    case 'UPDATE_REPORT_PENDING':
      return { ...state, saveStatus: 'loading' };
    case 'UPDATE_REPORT_SUCCESS':
      return { ...state, saveStatus: 'success' };
    case 'UPDATE_REPORT_FAIL':
      return { ...state, saveStatus: 'error' };

    case 'GET_REPORTS_PENDING':
      return { ...state, list: [], status: 'loading' };
    case 'GET_REPORTS_SUCCESS':
      return { ...state, list: payload, status: 'success' };
    case 'GET_REPORTS_FAIL':
      return { ...state, status: 'error' };

    case 'DELETE_REPORT_PENDING':
      return { ...state, deletePending: true };
    case 'DELETE_REPORT_SUCCESS':
    case 'DELETE_REPORT_FAIL':
      return { ...state, deletePending: false };

    case 'GET_REPORT_PENDING':
      return { ...state, report: {}, getReportPending: true };
    case 'GET_REPORT_SUCCESS':
      return { ...state, report: payload, getReportPending: false };
    case 'GET_REPORT_FAIL':
      return { ...state, getReportPending: false };

    case 'CREATE_SCHEDULED_REPORT_PENDING':
      return { ...state, saveScheduledReportStatus: 'loading' };
    case 'CREATE_SCHEDULED_REPORT_SUCCESS':
      return { ...state, saveScheduledReportStatus: 'success' };
    case 'CREATE_SCHEDULED_REPORT_FAIL':
      return { ...state, saveScheduledReportStatus: 'error' };

    case 'GET_SCHEDULED_REPORTS_PENDING':
      return { ...state, scheduledReports: [], getScheduledReportsStatus: 'loading' };
    case 'GET_SCHEDULED_REPORTS_SUCCESS':
      return { ...state, scheduledReports: payload, getScheduledReportsStatus: 'success' };
    case 'GET_SCHEDULED_REPORTS_FAIL':
      return { ...state, getScheduledReportsStatus: 'error' };

    case 'GET_SCHEDULED_REPORT_PENDING':
      return { ...state, scheduledReport: {}, getScheduledReportStatus: 'loading' };
    case 'GET_SCHEDULED_REPORT_SUCCESS':
      return { ...state, scheduledReport: payload, getScheduledReportStatus: 'success' };
    case 'GET_SCHEDULED_REPORT_FAIL':
      return { ...state, getScheduledReportStatus: 'error' };

    case 'UPDATE_SCHEDULED_REPORT_PENDING':
      return { ...state, updateScheduledReportStatus: 'loading' };
    case 'UPDATE_SCHEDULED_REPORT_SUCCESS':
      return { ...state, updateScheduledReportStatus: 'success' };
    case 'UPDATE_SCHEDULED_REPORT_FAIL':
      return { ...state, updateScheduledReportStatus: 'error' };

    case 'DELETE_SCHEDULED_REPORT_PENDING':
      return { ...state, deleteSchedulePending: true };
    case 'DELETE_SCHEDULED_REPORT_SUCCESS':
    case 'DELETE_SCHEDULED_REPORT_FAIL':
      return { ...state, deleteSchedulePending: false };

    case 'TEST_SCHEDULED_REPORT_PENDING':
      return { ...state, testScheduledReportStatus: 'loading' };
    case 'TEST_SCHEDULED_REPORT_SUCCESS':
      return { ...state, testScheduledReportStatus: 'success' };
    case 'TEST_SCHEDULED_REPORT_FAIL':
      return { ...state, testScheduledReportStatus: 'error' };
    default:
      return state;
  }
};
