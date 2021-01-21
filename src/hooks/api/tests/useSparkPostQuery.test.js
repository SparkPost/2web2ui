import React from 'react';
import nock from 'nock';
import { renderHook } from '@testing-library/react-hooks';
import { TestApp, stubRequest } from 'src/__testHelpers__';
import { useSparkPostQuery } from 'src/hooks';
import { getUsage } from 'src/helpers/api/account';
import { getBilling } from 'src/helpers/api/billing';

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

  it('makes requests with the auth token stored in the Redux data store', async () => {
    // See: https://github.com/nock/nock#recording
    nock.recorder.rec({
      dont_print: true,
      output_objects: true,
      enable_reqheaders_recording: true,
    });

    const { result, waitFor } = renderHook(
      // Skip retries as we know this request will result in an error
      () => useSparkPostQuery(getUsage, { ...DEFAULT_OPTIONS, retry: false }),
      { wrapper },
    );

    expect(result.current.status).toBe('loading');

    await waitFor(() => result.current.status === 'error');

    const nockCalls = nock.recorder.play();
    expect(nockCalls[0].reqheaders.authorization).toEqual(FAKE_AUTH_TOKEN);
    nock.restore(); // Stops recording
    nock.recorder.clear(); // Remove recordings
  });

  it('makes requests with parameters passed in to query functions', async () => {
    nock.recorder.rec({
      dont_print: true,
      output_objects: true,
    });

    const { result, waitFor } = renderHook(
      () =>
        useSparkPostQuery(() => getBilling({ my: 'param' }), { ...DEFAULT_OPTIONS, retry: false }),
      { wrapper },
    );

    expect(result.current.status).toBe('loading');
    await waitFor(() => result.current.status === 'error');
    const nockCalls = nock.recorder.play();
    expect(nockCalls[0].path).toEqual('/v1/billing?my=param');
    nock.restore(); // Stops recording
    nock.recorder.clear(); // Remove recordings
  });

  it('makes requests with headers passed in to the query function', () => {});

  describe('error handling', () => {
    it('attempts to retries network requests 3 times after an error is first encountered', () => {});

    it('handles an expired token via an existing refresh token', () => {});

    it('logs the user out when a request status is `401` and no refresh token is present', () => {});

    it("re-requests the user's account when a request status is `403`", () => {});

    it('does nothing when a request responds with a `404` for "GET" requests', () => {});

    it('calls `showAlert` when the server responds with a `413` error code', () => {});

    it('calls `showAlert` when the server responds with any other error code', () => {});

    it('returns error message content when present', () => {});
  });
});
