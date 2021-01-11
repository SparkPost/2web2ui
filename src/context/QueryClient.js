import React from 'react';
import _ from 'lodash';
import { QueryClient, QueryClientProvider as ReactQueryClientProvider } from 'react-query';
import { defaultQuery } from 'src/helpers/api';

const queryClient = new QueryClient({
  defaultConfig: {
    queries: {
      queryFn: defaultQuery,
    },
  },
});

export function QueryClientProvider({ children }) {
  return <ReactQueryClientProvider client={queryClient}>{children}</ReactQueryClientProvider>;
}
