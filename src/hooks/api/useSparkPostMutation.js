import { useMutation } from 'react-query';
import { defaultQueryFn } from 'src/helpers/api';
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
  const { method } = mutationFn();
  const { queryClient, auth, dispatch } = usePrepareQuery();

  function derivedMutationFn(vars, config) {
    const derivedQueryKey = deriveQueryKey({ queryFn: () => mutationFn(vars, config), auth });

    return defaultQueryFn({ queryKey: derivedQueryKey });
  }

  return useMutation(derivedMutationFn, {
    onError: error => handleError({ error, method, queryClient, auth, dispatch }),
    ...config,
  });
}
