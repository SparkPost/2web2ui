import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useQueryClient } from 'react-query';
import { refresh, logout } from 'src/actions/auth';
import { useRefreshToken } from 'src/helpers/http';
import { showAlert } from 'src/actions/globalAlert';
import { fetch as fetchAccount } from 'src/actions/account';
import { defaultQueryFn } from 'src/helpers/api';

export function useSparkPostQueries(queries, config = {}, queryKey) {
  const queryClient = useQueryClient();
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();

  //Prepares the query by generating query metadata w/ query handler
  const queryRequests = () =>
    queries.map(queryFn => {
      const { url, method, params, headers } = queryFn();
      return defaultQueryFn(url, { method, params, headers, auth });
    });

  //Joins queries as single promise
  const queryFn = () =>
    Promise.all(queryRequests()).then(res => {
      return res;
    });

  return useQuery({
    // Passed in similarly to dependency array in other hooks
    queryKey,
    config: {
      ...config,
      onError: error => handleError({ error, queryClient, auth, dispatch }),
    },
    queryFn,
  });
}

export function useSparkPostQuery(queryFn, config = {}) {
  const queryClient = useQueryClient();
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const { url, method, params, headers } = queryFn();
  // See: https://react-query.tanstack.com/docs/guides/queries#query-keys
  // Generate a unique queryKey based on passed in query function values
  const queryKey = [url, { method, params, headers, auth }];

  // And: https://react-query.tanstack.com/docs/api#usequery
  return useQuery({
    queryKey,
    config: {
      // Pass in a custom handler for handling errors
      onError: error => handleError({ error, method, queryClient, auth, dispatch }),
      // Allow config overriding on a case-by-case basis, for any value not manually updated,
      // `react-query` defaults are used.
      ...config,
    },
  });
}

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
