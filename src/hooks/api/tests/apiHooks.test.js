import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import nock from 'nock';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';

const queryClient = new QueryClient();

function useFetchData() {
  return useQuery('fetchData', () => fetch('/api/data').then(res => res.json()));
}

const subject = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useQuery', () => {
  it('does stuff', async () => {
    nock('http://api.sparkpost.test')
      .get('/api/data')
      .reply(200, {
        answer: 42,
      });

    const { result, waitFor } = renderHook(() => useFetchData(), { wrapper: subject });

    await waitFor(() => {
      return result.current.isSuccess;
    });

    expect(result.current.data).toEqual({ answer: 42 });
  });
});
