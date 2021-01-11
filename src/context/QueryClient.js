import React from 'react';
import _ from 'lodash';
import { QueryClient, QueryClientProvider as ReactQueryClientProvider } from 'react-query';
import { defaultQuery } from 'src/helpers/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQuery,
    },
    mutations: {}, // TODO: Will be fleshed out when `useMutation` is incorporated
  },
});

export function QueryClientProvider({ children }) {
  return <ReactQueryClientProvider client={queryClient}>{children}</ReactQueryClientProvider>;
}
