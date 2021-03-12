import sparkpostApiRequest from './helpers/sparkpostApiRequest';
import { setSubaccountHeader } from 'src/helpers/subaccounts';
import { showAlert } from './globalAlert';
import ErrorTracker from 'src/helpers/errorTracker';

export function inviteUser(email, access_level, subaccount) {
  const action = {
    type: 'INVITE_USER',
    meta: {
      data: { email, access_level },
      method: 'POST',
      url: '/v1/users/invite',
      headers: setSubaccountHeader(subaccount),
    },
  };

  return sparkpostApiRequest(action);
}

export function deleteUser(username) {
  const action = {
    type: 'DELETE_USER',
    meta: {
      data: { username }, // need in reducer, no user reference in response
      method: 'DELETE',
      url: `/v1/users/${username}`,
    },
  };

  return dispatch =>
    dispatch(sparkpostApiRequest(action)).then(() =>
      dispatch(
        showAlert({
          type: 'success',
          message: `Deleted ${username}`,
        }),
      ),
    );
}

export function listUsers() {
  return sparkpostApiRequest({
    type: 'LIST_USERS',
    meta: {
      method: 'GET',
      url: '/v1/users',
      showErrorAlert: false,
    },
  });
}

export function updateUser(username, data) {
  const action = {
    type: 'UPDATE_USER',
    meta: {
      method: 'PUT',
      url: `/v1/users/${username}`,
      data: {
        ...data,
        username, // need in reducer, no user reference in response
      },
    },
  };

  return dispatch =>
    dispatch(sparkpostApiRequest(action)).then(({ message }) =>
      dispatch(showAlert({ type: 'success', message })),
    );
}

export function checkInviteToken(token) {
  const action = {
    type: 'CHECK_INVITE_TOKEN',
    meta: {
      method: 'GET',
      url: `/v1/users/invite/${token}`,
    },
  };

  // returns 404 when not found
  return dispatch =>
    dispatch(sparkpostApiRequest(action)).catch(error => {
      ErrorTracker.report('check-invite', error);
    });
}

export function registerUser(token, data) {
  const action = {
    type: 'REGISTER_USER',
    meta: {
      method: 'POST',
      url: `/v1/users/register/${token}`,
      data: { ...data, tou_accepted: true },
    },
  };

  return dispatch =>
    dispatch(sparkpostApiRequest(action)).then(() =>
      dispatch(
        showAlert({
          type: 'success',
          message: 'Welcome to SparkPost',
        }),
      ),
    );
}
