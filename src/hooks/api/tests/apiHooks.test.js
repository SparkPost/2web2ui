import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import nock from 'nock';
import { useQuery } from 'react-query';
import TestApp from 'src/__testHelpers__/TestApp';
import { useSparkPostQuery } from 'src/hooks';
import { getUsage } from 'src/helpers/api/account';

function useFetchData() {
  return useQuery('fetchData', () => fetch('/api/data').then(res => res.json()));
}

const wrapper = ({ children }) => (
  <TestApp reduxStore={{ auth: { token: '123456', loggedIn: true } }}>{children}</TestApp>
);

describe('useSparkPostQuery', () => {
  it('does stuff', async () => {
    nock('http://api.sparkpost.test')
      .get('/api/data')
      .reply(200, {
        answer: 42,
      });

    const { result, waitFor } = renderHook(() => useFetchData(), { wrapper });

    await waitFor(() => {
      return result.current.isSuccess;
    });

    expect(result.current.data).toEqual({ answer: 42 });
  });

  it('does some more stuff', async () => {
    const fixture = {
      results: {
        recipient_validation: {
          day: { end: '2020-01-06T17:15:00.000Z', start: '2020-01-05T17:15:00.000Z', used: 50 },
          month: {
            start: '2020-01-05T08:00:00.000Z',
            end: '2020-02-05T08:00:00.000Z',
            used: 50,
          },
          timestamp: '2020-01-06T17:27:21.844Z',
        },
      },
    };
    nock('http://api.sparkpost.test')
      .intercept('/v1/usage', 'GET')
      .reply(200, fixture);

    const { result, waitFor } = renderHook(() => useSparkPostQuery(getUsage), { wrapper });

    await waitFor(() => result.current.status === 'success');

    expect(result.current.data).toEqual(fixture.results);
  });
});
