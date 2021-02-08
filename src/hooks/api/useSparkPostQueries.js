import _ from 'lodash';
import { useQueries } from 'react-query';
import { usePrepareQuery, deriveQueryKey, handleError } from './helpers';

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
