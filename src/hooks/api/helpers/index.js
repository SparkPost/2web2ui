import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from 'react-query';
import { refresh, logout } from 'src/actions/auth';
import { showAlert } from 'src/actions/globalAlert';
import { fetch as fetchAccount } from 'src/actions/account';
import { useRefreshToken } from 'src/helpers/http';

/**
 * Common preparation steps composed of other hooks
 */
export function usePrepareQuery() {
  const queryClient = useQueryClient();
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();

  return {
    queryClient,
    auth,
    dispatch,
  };
}

/**
 * Handle errors based on the response from a failed query
 *
 * @param {object} error - error returned from a failed API request
 * @param {string} method - HTTP request method
 * @param {object} queryClient - `react-query` queryClient - https://react-query.tanstack.com/reference/QueryClient
 * @param {object} auth - auth state stored in global Redux store
 * @param {function} dispatch - `react-redux` dispatch method, typically derived from `useDispatch()`
 *
 */
export function handleError({ error, method, queryClient, auth, dispatch }) {
  const { response = {} } = error;

  if (response.status === 401 && auth.refreshToken) {
    // Invalidate any in-progress queries
    queryClient.invalidateQueries();

    return (
      // This isn't actually a hook 🤔
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useRefreshToken(auth.refreshToken) // eslint-disable-line react-hooks/rules-of-hooks
        // dispatch a refresh action to save new token results in cookie and store
        .then(({ data } = {}) => dispatch(refresh(data.access_token, auth.refreshToken)))

        // dispatch the original action again, now that we have a new token ...
        // if anything in this refresh flow blew up, log out
        .then(
          // refresh token request succeeded
          async () => {
            // Refetch queries when the refresh token is successful
            // See: https://react-query.tanstack.com/docs/api/#queryClientrefetchqueries
            return await queryClient.refetchQueries();
          },
          // refresh token request failed
          err => {
            dispatch(logout());
            throw err;
          },
        )
    );
  }

  if (response.status === 401) {
    return dispatch(logout());
  }

  if (response.status === 403) {
    return dispatch(fetchAccount());
  }

  // No messaging necessary for 404 errors for "GET" requests
  if (response.status === 404 && method === 'GET') {
    return;
  }

  // This error handling could be handled on the server, however, the effort required to do so was significantly larger than handling it here
  if (response.status === 413) {
    return dispatch(
      showAlert({
        type: 'error',
        message: 'Something went wrong.',
        details: 'File size larger than the server allows.',
      }),
    );
  }

  return dispatch(
    showAlert({
      type: 'error',
      message: 'Something went wrong.',
      details: error.message,
    }),
  );
}

/**
 * Derive query key from passed in queryFn and auth state from Redux store. This would have been a custom hook, however, needed to be run within a callback - impossible with a hook.
 * See: https://react-query.tanstack.com/docs/guides/queries#query-keys
 *
 * @param {function} queryFn - query function derived from `src/helpers/api` helpers
 * @param {object} auth - auth Redux state
 *
 */
export function deriveQueryKey({ queryFn, auth }) {
  const { url, method, params, headers } = queryFn();

  return [url, { method, params, headers, auth }];
}
