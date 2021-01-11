const initialDomainState = {
  domain: { dkim: {}, status: {} },
  getError: null,
  getLoading: false,
};

const initialState = {
  ...initialDomainState,
  list: [],
  listError: null,
  verifyError: null,
  verifyTokenStatus: null,
  verifyTokenError: null,
};

export default (state = initialState, { type, payload, meta }) => {
  switch (type) {
    case 'CREATE_SENDING_DOMAIN_PENDING':
      return { ...state, createLoading: true };

    case 'CREATE_SENDING_DOMAIN_SUCCESS':
    case 'CREATE_SENDING_DOMAIN_FAIL':
      return { ...state, createLoading: false };

    case 'LIST_SENDING_DOMAINS_PENDING':
      return { ...state, listLoading: true, listError: null };

    case 'LIST_SENDING_DOMAINS_SUCCESS':
      return { ...state, list: payload, listLoading: false };

    case 'LIST_SENDING_DOMAINS_FAIL':
      return { ...state, listError: payload, listLoading: false };

    case 'DELETE_SENDING_DOMAIN_PENDING':
      return { ...state, deleting: true, deleteError: null };

    case 'DELETE_SENDING_DOMAIN_FAIL':
      return { ...state, deleting: false, deleteError: payload };

    case 'DELETE_SENDING_DOMAIN_SUCCESS':
      return { ...state, deleting: false, list: state.list.filter(d => d.domain !== meta.domain) };

    case 'GET_SENDING_DOMAIN_PENDING':
      return { ...state, getLoading: true, getError: null };

    case 'GET_SENDING_DOMAIN_SUCCESS':
      return { ...state, domain: { id: meta.id, ...payload }, getLoading: false };

    case 'GET_SENDING_DOMAIN_FAIL':
      return { ...state, getError: payload, getLoading: false };

    case 'CLEAR_SENDING_DOMAIN':
      return { ...state, ...initialDomainState, verifyTokenStatus: null };

    case 'VERIFY_SENDING_DOMAIN_CNAME_PENDING':
    case 'VERIFY_SENDING_DOMAIN_MX_PENDING':
      return { ...state, verifyBounceLoading: true, verifyBounceError: null };

    case 'VERIFY_SENDING_DOMAIN_CNAME_SUCCESS':
    case 'VERIFY_SENDING_DOMAIN_MX_SUCCESS':
      // augment current domain's status property
      return { ...state, verifyBounceLoading: false, domain: { ...state.domain, status: payload } };

    case 'VERIFY_SENDING_DOMAIN_CNAME_FAIL':
    case 'VERIFY_SENDING_DOMAIN_MX_FAIL':
      return { ...state, verifyBounceLoading: false, verifyBounceError: payload };

    case 'VERIFY_SENDING_DOMAIN_DKIM_PENDING':
      return { ...state, verifyDkimLoading: true, verifyDkimError: null };

    case 'VERIFY_SENDING_DOMAIN_DKIM_SUCCESS':
      // augment current domain's status property
      return { ...state, verifyDkimLoading: false, domain: { ...state.domain, status: payload } };

    case 'VERIFY_SENDING_DOMAIN_DKIM_FAIL':
      return { ...state, verifyDkimLoading: false, verifyDkimError: payload };

    case 'VERIFY_SENDING_DOMAIN_ABUSE_AT_PENDING':
    case 'VERIFY_SENDING_DOMAIN_POSTMASTER_AT_PENDING':
    case 'VERIFY_SENDING_DOMAIN_VERIFICATION_MAILBOX_PENDING':
      return { ...state, verifyEmailLoading: true, verifyEmailError: null };

    case 'VERIFY_SENDING_DOMAIN_ABUSE_AT_SUCCESS':
    case 'VERIFY_SENDING_DOMAIN_POSTMASTER_AT_SUCCESS':
    case 'VERIFY_SENDING_DOMAIN_VERIFICATION_MAILBOX_SUCCESS':
      // augment current domain's status property
      return { ...state, verifyEmailLoading: false, domain: { ...state.domain, status: payload } };

    case 'VERIFY_SENDING_DOMAIN_ABUSE_AT_FAIL':
    case 'VERIFY_SENDING_DOMAIN_POSTMASTER_AT_FAIL':
    case 'VERIFY_SENDING_DOMAIN_VERIFICATION_MAILBOX_FAIL':
      return { ...state, verifyEmailLoading: false, verifyEmailError: payload };

    case 'UPDATE_SENDING_DOMAIN_PENDING':
      return { ...state, updateLoading: true, updateError: null };

    case 'UPDATE_SENDING_DOMAIN_SUCCESS':
      // augment current domain property with update values
      return { ...state, updateLoading: false, domain: { ...state.domain, ...meta.data } };

    case 'UPDATE_SENDING_DOMAIN_FAIL':
      return { ...state, updateLoading: false, updateError: payload };

    case 'VERIFY_TOKEN_PENDING':
      return {
        ...state,
        verifyTokenLoading: false,
        verifyTokenStatus: null,
        verifyTokenError: null,
      };

    case 'VERIFY_TOKEN_SUCCESS':
      return {
        ...state,
        verifyTokenLoading: false,
        verifyTokenStatus: { ...payload, type: meta.type, domain: meta.domain },
      };

    case 'VERIFY_TOKEN_FAIL':
      return { ...state, verifyTokenLoading: false, verifyTokenError: payload };

    default:
      return state;
  }
};
