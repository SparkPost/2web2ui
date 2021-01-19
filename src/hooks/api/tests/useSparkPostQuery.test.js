import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { TestApp, stubRequest } from 'src/__testHelpers__';
import { useSparkPostQuery } from 'src/hooks';
import { getUsage } from 'src/helpers/api/account';

const wrapper = ({ children }) => (
  <TestApp reduxStore={{ auth: { token: '123456', loggedIn: true } }}>{children}</TestApp>
);

describe('useSparkPostQuery', () => {
  it('makes network requests derived from the passed in query function', async () => {
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
    stubRequest({
      path: '/v1/usage',
      fixture,
    });

    const { result, waitFor } = renderHook(() => useSparkPostQuery(getUsage), { wrapper });

    expect(result.current.status).toBe('loading');

    await waitFor(() => result.current.status === 'success');

    expect(result.current.data).toEqual(fixture.results);
  });

  it('re-requests data via the returned "refetch" function', () => {});

  it('makes requests with the auth token stored in the Redux data store', () => {});

  it('makes requests with parameters passed in to query functions', () => {});

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
