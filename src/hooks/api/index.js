import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useQueries, useQueryClient } from 'react-query';
import { refresh, logout } from 'src/actions/auth';
import { useRefreshToken } from 'src/helpers/http';
import { defaultQueryFn } from 'src/helpers/api';
import { showAlert } from 'src/actions/globalAlert';
import { fetch as fetchAccount } from 'src/actions/account';

/**
 * Wrapper hook for react-query `useQuery` hook that handles consistent auth/error behavior
 * See: https://react-query.tanstack.com/reference/useQuery
 *
 * @param {function} queryFn - query function that returns configuration used to generate a unique query
 * @param {object} config - options that can be passed in to the `useQuery` instance. See: https://react-query.tanstack.com/reference/useQuery#_top:~:text=Options,-queryKey%3A
 *
 */
export function useSparkPostQuery(queryFn, config = {}) {
  const { queryClient, auth, dispatch } = usePrepareQuery();
  const { method } = queryFn();

  return useQuery({
    queryKey: deriveQueryKey({ queryFn, auth }),
    // Pass in a custom handler for handling errors
    onError: error => handleError({ error, method, queryClient, auth, dispatch }),
    // Allow config overriding on a case-by-case basis, for any value not manually updated, `react-query` defaults are used.
    ...config,
  });
}

/**
 * Wrapper hook for react-query `useQueries` hook that handles consistent auth/error behavior for multiple, simultaneous requests
 * See: https://react-query.tanstack.com/reference/useQueries
 *
 * @param {function} queryFn - query function that returns configuration used to generate a unique query
 * @param {object} config - options that can be passed in to the `useQuery` instance. See: https://react-query.tanstack.com/reference/useQuery#_top:~:text=Options,-queryKey%3A
 *
 */
export function useSparkPostQueries(queryFns, config = {}) {
  const { queryClient, auth, dispatch } = usePrepareQuery();

  // Generate array of query keys based on each passed in query function
  const derivedQueryFns = queryFns.map(queryFn => {
    const { method } = queryFn();

    return {
      queryKey: deriveQueryKey({ queryFn, auth }),
      onError: error => handleError({ error, method, queryClient, auth, dispatch }),
      ...config,
    };
  });

  return useQueries(derivedQueryFns);
}

/**
 * Wrapper hook for react-query `useQuery` hook leveraging `Promise.all()` to merge request response data from a dynamic series of requests
 *
 * @param {array} queries - array of query functions that return configuration used to make an async API request
 * @param {object} config - options that can be passed in to the `useQuery` instance. See: https://react-query.tanstack.com/reference/useQuery#_top:~:text=Options,-queryKey%3A
 * @param {array} queryKey - array to generate a unique query key for these requests for caching purposes.
 *
 */
export function useMergedSparkPostQueries(queries, config = {}, queryKey) {
  const { queryClient, auth, dispatch } = usePrepareQuery();

  // Prepares the query by generating query metadata w/ query handler
  const queryRequests = () =>
    queries.map(queryFn => {
      const derivedQueryKey = deriveQueryKey({ queryFn, auth });

      return defaultQueryFn({ queryKey: derivedQueryKey });
    });

  // Joins queries as single promise
  const queryFn = () =>
    Promise.all(queryRequests()).then(res => {
      return res;
    });

  return useQuery({
    // Passed in similarly to dependency array in other hooks
    queryKey: queryKey,
    queryFn,
    onError: error => handleError({ error, queryClient, auth, dispatch }),
    ...config,
  });
}

/**
 * Common preparation steps derived from other hooks
 */
function usePrepareQuery() {
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
 * @param {object} error
 * @param {string} method
 * @param {object} queryClient
 * @param {object} auth
 * @param {function} dispatch
 *
 */
function handleError({ error, method, queryClient, auth, dispatch }) {
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
 * @param {function} queryFn
 * @param {object} auth
 *
 */
function deriveQueryKey({ queryFn, auth }) {
  const { url, method, params, headers } = queryFn();

  return [url, { method, params, headers, auth }];
}
