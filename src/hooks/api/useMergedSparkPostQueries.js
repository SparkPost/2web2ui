import _ from 'lodash';
import { useQuery } from 'react-query';
import { defaultQueryFn } from 'src/helpers/api';
import { usePrepareQuery, deriveQueryKey, handleError } from './helpers';

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
