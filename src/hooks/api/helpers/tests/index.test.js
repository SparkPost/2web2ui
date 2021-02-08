import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { TestApp } from 'src/__testHelpers__';
import { refresh, logout } from 'src/actions/auth';
import { showAlert } from 'src/actions/globalAlert';
import { fetch as fetchAccount } from 'src/actions/account';
import { useRefreshToken } from 'src/helpers/http';
import { usePrepareQuery, handleError, deriveQueryKey } from '../';

jest.mock('src/actions/auth');
jest.mock('src/actions/globalAlert');
jest.mock('src/actions/account');
jest.mock('src/helpers/http');

describe('Helpers for global API hooks', () => {
  describe('usePrepareQuery', () => {
    it('returns the `queryClient`, `auth`, and `dispatch` as expected', () => {
      const wrapper = ({ children }) => (
        <TestApp store={{ auth: { loggedIn: true, token: '123456' } }}>{children}</TestApp>
      );
      const { result } = renderHook(() => usePrepareQuery(), { wrapper });

      expect(result.current).toMatchInlineSnapshot(`
        Object {
          "auth": Object {
            "loggedIn": true,
            "token": "123456",
          },
          "dispatch": [Function],
          "queryClient": QueryClient {
            "defaultOptions": Object {
              "mutations": Object {},
              "queries": Object {
                "queryFn": [Function],
              },
            },
            "mutationCache": MutationCache {
              "config": Object {},
              "listeners": Array [],
              "mutationId": 0,
              "mutations": Array [],
            },
            "mutationDefaults": Array [],
            "queryCache": QueryCache {
              "config": Object {},
              "listeners": Array [],
              "queries": Array [],
              "queriesMap": Object {},
            },
            "queryDefaults": Array [],
            "unsubscribeFocus": [Function],
            "unsubscribeOnline": [Function],
          },
        }
      `);
    });
  });

  describe('handleError', () => {
    const mockInvalidateQueries = jest.fn();
    const mockRefetchQueries = jest.fn();
    const mockDispatch = jest.fn();
    const defaultArguments = {
      error: { response: { status: 400 } },
      method: 'GET',
      queryClient: {
        invalidateQueries: mockInvalidateQueries,
        refetchQueries: mockRefetchQueries,
      },
      auth: {},
      dispatch: mockDispatch,
    };

    it('handles a 401 response status when a refresh token is present', async () => {
      const promise = Promise.resolve({
        data: { access_token: 'fake-access-token' },
      });
      const mockUseRefreshToken = jest.fn(() => promise);
      const mockRefresh = jest.fn();
      useRefreshToken.mockImplementationOnce(mockUseRefreshToken);
      refresh.mockImplementationOnce(mockRefresh);
      handleError({
        ...defaultArguments,
        error: { response: { status: 401 } },
        auth: { refreshToken: '1234' },
      });
      // In-progress queries are invalidated
      expect(mockInvalidateQueries).toHaveBeenCalled();
      expect(mockUseRefreshToken).toHaveBeenCalledWith('1234');

      // A request is made for a new refresh token
      return (
        promise
          .then(() => {
            expect(mockDispatch).toHaveBeenCalledWith(mockRefresh());
            expect(mockRefresh).toHaveBeenCalledWith('fake-access-token', '1234');
          })
          // And then in-progress `react-query` queries are refetched
          .then(() => {
            expect(mockRefetchQueries).toHaveBeenCalled();
          })
      );
    });

    it('handles a 401 response status when a refresh token is present when the refresh token request fails', () => {
      const refreshTokenPromise = Promise.resolve({
        data: { access_token: 'fake-access-token' },
      });
      const refreshPromise = Promise.reject({ error: 'my error message' });
      const mockUseRefreshToken = jest.fn(() => refreshTokenPromise);
      const mockLogout = jest.fn();
      const mockRefresh = jest.fn(() => refreshPromise);
      useRefreshToken.mockImplementationOnce(mockUseRefreshToken);
      refresh.mockImplementationOnce(mockRefresh);
      logout.mockImplementationOnce(mockLogout);

      handleError({
        ...defaultArguments,
        error: { response: { status: 401 } },
        auth: { refreshToken: '1234' },
      });

      expect(mockInvalidateQueries).toHaveBeenCalled();
      expect(mockUseRefreshToken).toHaveBeenCalledWith('1234');

      return refreshTokenPromise.then(() => {
        return refreshPromise.catch(() => {
          // Logout is called on error
          expect(mockDispatch).toHaveBeenCalled(mockLogout());
        });
      });
    });

    it('handles a 401 response status when no refresh token is present', () => {
      const mockLogout = jest.fn();
      logout.mockImplementationOnce(mockLogout);

      handleError({
        ...defaultArguments,
        error: { response: { status: 401 } },
      });

      expect(mockDispatch).toHaveBeenCalledWith(mockLogout());
    });

    it('handles a 403 response status', () => {
      const mockFetchAccount = jest.fn();
      fetchAccount.mockImplementationOnce(mockFetchAccount);

      handleError({
        ...defaultArguments,
        error: { response: { status: 403 } },
      });

      expect(mockDispatch).toHaveBeenCalledWith(mockFetchAccount());
    });

    it('handles a 404 response status for "GET" requests', () => {
      handleError({
        ...defaultArguments,
        error: { response: { status: 404 } },
        method: 'GET',
      });

      // Nothing happens!
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('handles a 413 response status', () => {
      const mockShowAlert = jest.fn();
      showAlert.mockImplementationOnce(mockShowAlert);

      handleError({
        ...defaultArguments,
        error: { response: { status: 413 } },
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        mockShowAlert({
          type: 'error',
          message: 'Something went wrong.',
          details: 'File size larger than the server allows.',
        }),
      );
    });

    it('handles all other errors', () => {
      const mockShowAlert = jest.fn();
      showAlert.mockImplementationOnce(mockShowAlert);

      handleError({
        ...defaultArguments,
        error: { response: { status: 413, message: 'This is an error' } },
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        mockShowAlert({
          type: 'error',
          message: 'Something went wrong.',
          details: 'This is an error',
        }),
      );
    });
  });

  describe('deriveQuery', () => {
    it('structures the passed in queryFn and auth data in to an array consumable by `useSparkPostQuery`', () => {
      const queryKey = deriveQueryKey({
        queryFn: () => ({
          url: 'hello.com',
          method: 'POST',
          params: { something: 'here' },
          headers: { anotherThing: 'here' },
        }),
        auth: {
          loggedIn: true,
          other: 'stuff',
        },
      });

      expect(queryKey).toMatchInlineSnapshot(`
        Array [
          "hello.com",
          Object {
            "auth": Object {
              "loggedIn": true,
              "other": "stuff",
            },
            "headers": Object {
              "anotherThing": "here",
            },
            "method": "POST",
            "params": Object {
              "something": "here",
            },
          },
        ]
      `);
    });
  });
});
