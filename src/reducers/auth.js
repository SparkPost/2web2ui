
const initialState = { loggedIn: false, ssoUser: null };

export default (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN_PENDING': {
      return { ...state, errorDescription: null, loginPending: true };
    }

    case 'LOGIN_SUCCESS': {
      const {
        access_token: token,
        username = state.username,
        refresh_token: refreshToken
      } = action.payload;

      return {
        ...state,
        loginPending: false,
        token,
        username,
        refreshToken,
        loggedIn: true
      };
    }

    case 'LOGIN_FAIL': {
      const { errorDescription = 'An unknown error occurred' } = action.payload;
      return { loggedIn: false, errorDescription };
    }

    case 'LOGOUT': {
      return { loggedIn: false };
    }

    case 'SSO_CHECK_PENDING': {
      const { errorDescription, ssoUser, ...newState } = state;
      return { ...newState, loginPending: true };
    }

    case 'SSO_CHECK_SUCCESS': {
      const { saml: ssoUser } = action.payload;
      const { username } = action.meta;

      return { ...state, ssoUser, username, loginPending: ssoUser };
    }

    case 'SSO_CHECK_FAIL': {
      return { loginPending: false };
    }

    default: {
      return state;
    }
  }
};
