import React from 'react';
import _ from 'lodash';
import { QueryClient, QueryClientProvider as ReactQueryClientProvider } from 'react-query';
import { defaultQueryFn } from 'src/helpers/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
    },
    mutations: {}, // TODO: Will be fleshed out when `useMutation` is incorporated
  },
});

export function QueryClientProvider({ children }) {
  return <ReactQueryClientProvider client={queryClient}>{children}</ReactQueryClientProvider>;
}
