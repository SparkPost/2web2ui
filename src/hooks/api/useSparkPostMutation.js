import { useMutation } from 'react-query';
import { usePrepareQuery, deriveQueryKey, handleError } from './helpers';

/**
 * Wrapper hook for react-query `useMutation` hook that handles consistent auth/error behavior
 * See: https://react-query.tanstack.com/reference/useMutation
 *
 * @param {function} mutationFn
 * @param {object} config
 *
 */

export function useSparkPostMutation(mutationFn, config = {}) {
  const { queryClient, auth, dispatch } = usePrepareQuery();
  const { method } = mutationFn();

  return useMutation(mutationFn, {
    mutationKey: deriveQueryKey({ queryFn: mutationFn, auth }),
    onError: error => handleError({ error, method, queryClient, auth, dispatch }),
    ...config,
  });
}
