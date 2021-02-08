import { useQuery } from 'react-query';
import { usePrepareQuery, deriveQueryKey, handleError } from './helpers';

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
