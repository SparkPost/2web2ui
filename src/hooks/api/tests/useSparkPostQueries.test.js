import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { TestApp, stubRequest } from 'src/__testHelpers__';
import { useSparkPostQueries } from 'src/hooks';
import { getUsage, getAccount } from 'src/helpers/api/account';

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
const ACCOUNT_FIXTURE = {
  results: {
    fakeAccountId: '134134',
  },
};
const DEFAULT_OPTIONS = {
  // Caching the results impacts other tests as data is not re-requested
  cacheTime: 0,
};

const wrapper = ({ children }) => (
  <TestApp store={{ auth: { token: FAKE_AUTH_TOKEN, loggedIn: true } }}>{children}</TestApp>
);

describe('useSparkPostQueries', () => {
  it('makes multiple network requests based on the passed in array of query functions', async () => {
    stubRequest({
      path: '/v1/usage',
      fixture: USAGE_FIXTURE,
    });
    stubRequest({
      path: '/v1/account',
      fixture: ACCOUNT_FIXTURE,
    });

    const { result, waitFor } = renderHook(
      () => useSparkPostQueries([getUsage, getAccount], DEFAULT_OPTIONS),
      {
        wrapper,
      },
    );

    await waitFor(() => result.current.some(query => query.status === 'success'));

    expect(result.current[0].data).toEqual(USAGE_FIXTURE.results);
    expect(result.current[1].data).toEqual(ACCOUNT_FIXTURE.results);
  });
});
