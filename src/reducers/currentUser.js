const initialState = {
  grants: [],
  loading: false,
  verifyingEmail: null,
  emailError: null,
  verifyingToken: null,
  tokenError: null,
  storingCookieConsent: null,
  consentFailed: null,
  options: {},
  userOptionsPending: false,
};

export default (state = initialState, { type, payload, meta }) => {
  switch (type) {
    case 'GET_CURRENT_USER_PENDING':
      return { ...state, loading: true };

    case 'GET_CURRENT_USER_SUCCESS':
      return {
        ...state,
        ...payload,
        loading: false,
        cookie_consent: !!payload.cookie_consent,
        // TODO: Remove when OG theme is removed
        // Just defaults the app state to having Hibana enabled when using the env variable
        // Run the app locally with `npm run start-hibana`
        options: {
          ...state.options,
          ...payload.options,
          ui: {
            ...state.options?.ui,
            ...payload.options?.ui,
            isHibanaEnabled: true,
          },
        },
      };

    case 'GET_GRANTS_SUCCESS':
      return { ...state, grants: payload };

    case 'CREATE_SUBACCOUNT_SUCCESS':
      return { ...state, has_subaccounts: true };

    case 'VERIFY_EMAIL_PENDING':
      return { ...state, verifyingEmail: true, emailError: null };

    case 'VERIFY_EMAIL_SUCCESS':
      return { ...state, verifyingEmail: false };

    case 'VERIFY_EMAIL_FAIL':
      return { ...state, emailError: payload, verifyingEmail: false };

    case 'VERIFY_EMAIL_TOKEN_PENDING':
      return { ...state, verifyingToken: true, tokenError: null };

    case 'VERIFY_EMAIL_TOKEN_SUCCESS':
      return { ...state, email_verified: true, verifyingToken: false };

    case 'VERIFY_EMAIL_TOKEN_FAIL':
      return { ...state, tokenError: payload, verifyingToken: false };

    case 'USER_GIVES_COOKIE_CONSENT_PENDING':
      return { ...state, storingCookieConsent: true };

    case 'USER_GIVES_COOKIE_CONSENT_FAIL':
      return { ...state, storingCookieConsent: false, consentFailed: true };

    case 'USER_GIVES_COOKIE_CONSENT_SUCCESS':
      return { ...state, storingCookieConsent: false, cookie_consent: true };

    case 'UPDATE_USER_UI_OPTIONS_PENDING':
      return { ...state, userOptionsPending: true };

    case 'UPDATE_USER_UI_OPTIONS_FAIL':
      return { ...state, userOptionsPending: false };

    case 'UPDATE_USER_UI_OPTIONS_SUCCESS':
      return {
        ...state,
        options: {
          ...state.options,
          ui: {
            ...state.options.ui,
            ...meta.data.options.ui,
          },
        },
        userOptionsPending: false,
      };

    case 'MARK_ALL_NOTIFICATIONS_AS_READ': {
      return {
        ...state,
        options: {
          ...state.options,
          ui: {
            ...state.options.ui,
            notificationsLastSeenDate: payload,
          },
        },
      };
    }

    default:
      return state;
  }
};
