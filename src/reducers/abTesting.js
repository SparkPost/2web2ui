const initialState = {
  list: [],
  listLoading: true,
  listError: null,
  createError: null,
  updateError: null,
  updateDraftPending: false,
  deletePending: false,
  cancelPending: false,
  detailsById: {},
  detailsLoading: false,
  detailsError: null,
  rescheduleLoading: false
};

export default (state = initialState, { type, payload, meta }) => {
  switch (type) {
    /* LIST */

    case 'LIST_AB_TESTS_PENDING':
      return { ...state, listLoading: true, listError: null };

    case 'LIST_AB_TESTS_FAIL':
      return { ...state, listError: payload, listLoading: false };

    case 'LIST_AB_TESTS_SUCCESS':
      return { ...state, list: payload, listLoading: false };

    /* CREATE DRAFT */

    case 'CREATE_AB_TEST_DRAFT_PENDING':
      return { ...state, createError: null };

    case 'CREATE_AB_TEST_DRAFT_SUCCESS':
      return { ...state };

    case 'CREATE_AB_TEST_DRAFT_FAIL':
      return { ...state, createError: payload };

    /* UPDATE DRAFT */

    case 'UPDATE_AB_TEST_DRAFT_PENDING':
      return { ...state, updateDraftPending: true };

    case 'UPDATE_AB_TEST_DRAFT_SUCCESS':
      return { ...state, updateDraftPending: false };

    case 'UPDATE_AB_TEST_DRAFT_FAIL':
      return { ...state, updateDraftPending: false };

    /* UPDATE TEST */

    case 'UPDATE_AB_TEST_PENDING':
      return { ...state, updateError: null };

    case 'UPDATE_AB_TEST_SUCCESS':
      return { ...state };

    case 'UPDATE_AB_TEST_FAIL':
      return { ...state, updateError: payload };

    /* SCHEDULE */

    case 'SCHEDULE_AB_TEST_PENDING':
      return { ...state, scheduleError: null };

    case 'SCHEDULE_AB_TEST_SUCCESS':
      return { ...state };

    case 'SCHEDULE_AB_TEST_FAIL':
      return { ...state, scheduleError: payload };

    /* DELETE */

    case 'DELETE_AB_TEST_PENDING':
      return { ...state, deletePending: true };

    case 'DELETE_AB_TEST_SUCCESS':
      return {
        ...state,
        deletePending: false,
        list: state.list.filter((t) => {
          if (meta.data.subaccountId) {
            meta.data.subaccountId = parseInt(meta.data.subaccountId, 10);
          }
          return t.id !== meta.data.id || t.subaccount_id !== meta.data.subaccountId;
        })
      };

    case 'DELETE_AB_TEST_FAIL':
      return { ...state, deletePending: false };

    /* CANCEL */

    case 'CANCEL_AB_TEST_PENDING':
      return { ...state, cancelPending: true };

    case 'CANCEL_AB_TEST_SUCCESS':
      return {
        ...state,
        cancelPending: false,
        list: state.list.map((t) => t.id === meta.id && (!meta.subaccountId || t.subaccount_id === parseInt(meta.subaccountId, 10))
          ? { ...t, status: payload.status }
          : t)
      };

    case 'CANCEL_AB_TEST_FAIL':
      return { ...state, cancelPending: false };

    /* Details */
    case 'GET_AB_TEST_PENDING':
      return { ...state, detailsLoading: true, detailsError: null };

    case 'GET_AB_TEST_FAIL':
      return { ...state, detailsError: payload, detailsLoading: false };

    case 'GET_AB_TEST_SUCCESS':
      return {
        ...state,
        detailsLoading: false,
        detailsById: {
          ...state.detailsById,
          [payload.id]: {
            ...state.detailsById[payload.id],
            [`version_${payload.version}`]: payload
          }
        }
      };

    /* Get Latest */
    case 'GET_LATEST_AB_TEST_SUCCESS':
      return {
        ...state,
        detailsById: {
          ...state.detailsById,
          [payload.id]: {
            ...state.detailsById[payload.id],
            latest: payload.version
          }
        }
      };

    /* Rescheduling */
    case 'RESCHEDULE_AB_TEST_PENDING':
      return { ...state, rescheduleLoading: true };

    case 'RESCHEDULE_AB_TEST_SUCCESS':
    case 'RESCHEDULE_AB_TEST_FAIL':
      return { ...state, rescheduleLoading: false };

    default:
      return state;
  }
};
