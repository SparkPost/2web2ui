import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { TestApp, stubRequest } from 'src/__testHelpers__';
import { useSparkPostQuery } from 'src/hooks';
import { getUsage } from 'src/helpers/api/account';

const FAKE_AUTH_TOKEN = '123456';
const USAGE_FIXTURE = {
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
const DEFAULT_OPTIONS = {
  // Caching the results impacts other tests as data is not re-requested
  cacheTime: 0,
};

const wrapper = ({ children }) => (
  <TestApp store={{ auth: { token: FAKE_AUTH_TOKEN, loggedIn: true } }}>{children}</TestApp>
);

describe('useSparkPostQuery', () => {
  it('makes network requests derived from the passed in query function', async () => {
    stubRequest({
      path: '/v1/usage',
      fixture: USAGE_FIXTURE,
    });

    const { result, waitFor } = renderHook(() => useSparkPostQuery(getUsage, DEFAULT_OPTIONS), {
      wrapper,
    });

    expect(result.current.status).toBe('loading');

    await waitFor(() => result.current.status === 'success');

    expect(result.current.data).toEqual(USAGE_FIXTURE.results);
  });

  it('re-requests data via the returned "refetch" function', async () => {
    stubRequest({
      path: '/v1/usage',
      fixture: USAGE_FIXTURE,
    });
    const { result, waitFor } = renderHook(() => useSparkPostQuery(getUsage, DEFAULT_OPTIONS), {
      wrapper,
    });

    expect(result.current.status).toBe('loading');

    await waitFor(() => result.current.status === 'success');

    expect(result.current.data).toEqual(USAGE_FIXTURE.results);

    stubRequest({
      path: '/v1/usage',
      fixture: { different: 'results' },
    });
    await result.current.refetch();
    await waitFor(() => result.current.status === 'success');

    expect(result.current.data).toEqual({ different: 'results' });
  });

  it('returns error messages when requests fail', async () => {
    stubRequest({
      path: '/v1/usage',
      fixture: {},
      statusCode: 400,
    });
    const { result, waitFor } = renderHook(
      () => useSparkPostQuery(getUsage, { ...DEFAULT_OPTIONS, retry: false }),
      {
        wrapper,
      },
    );
    expect(result.current.status).toBe('loading');

    await waitFor(() => result.current.status === 'error');

    expect(result.current.error.message).toBe('Request failed with status code 400');
  });
});
