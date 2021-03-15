import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { TestApp, stubRequest } from 'src/__testHelpers__';
import { useSparkPostMutation } from 'src/hooks';

const FAKE_AUTH_TOKEN = '123456';

const FIXTURE = {
  results: {
    message: 'Success!',
  },
};

const DEFAULT_OPTIONS = {};

const wrapper = ({ children }) => (
  <TestApp store={{ auth: { token: FAKE_AUTH_TOKEN, loggedIn: true } }}>{children}</TestApp>
);

function mockPostFn(data) {
  return {
    method: 'POST',
    url: '/v1/some/fake/endpoint',
    data,
  };
}

describe('useSparkPostMutation', () => {
  it('makes network requests derived from the passed in mutation function using the returned mutate function', async () => {
    stubRequest({
      method: 'POST',
      path: '/v1/some/fake/endpoint',
      fixture: FIXTURE,
    });

    const { result, waitFor } = renderHook(
      () => useSparkPostMutation(mockPostFn, DEFAULT_OPTIONS),
      { wrapper },
    );
    result.current.mutate({ some: 'data' });

    await waitFor(() => result.current.status === 'success');

    expect(result.current.data).toEqual(FIXTURE.results);
  });

  it('returns error messages when mutations fail', async () => {
    stubRequest({
      method: 'POST',
      path: '/v1/some/fake/endpoint',
      fixture: {},
      statusCode: 400,
    });

    const { result, waitFor } = renderHook(
      () => useSparkPostMutation(mockPostFn, DEFAULT_OPTIONS),
      { wrapper },
    );
    result.current.mutate({ some: 'other data' });

    await waitFor(() => result.current.status === 'error');

    expect(result.current.error.message).toBe('Request failed with status code 400');
  });

  it('calls the passed in "onMutate" handler when the mutation succeeds', async () => {
    const mockOnMutate = jest.fn();

    stubRequest({
      method: 'POST',
      path: '/v1/some/fake/endpoint',
      fixture: FIXTURE,
    });

    const { result, waitFor } = renderHook(
      () => useSparkPostMutation(mockPostFn, { ...DEFAULT_OPTIONS, onMutate: mockOnMutate }),
      { wrapper },
    );
    result.current.mutate({ some: 'data' });

    await waitFor(() => result.current.status === 'success');

    expect(mockOnMutate).toHaveBeenCalled();
  });

  it('calls the passed in "onSuccess" handler when the mutation succeeds', async () => {
    const mockOnError = jest.fn();
    const mockOnSuccess = jest.fn();

    stubRequest({
      method: 'POST',
      path: '/v1/some/fake/endpoint',
      fixture: FIXTURE,
    });

    const { result, waitFor } = renderHook(
      () =>
        useSparkPostMutation(mockPostFn, {
          ...DEFAULT_OPTIONS,
          onError: mockOnError,
          onSuccess: mockOnSuccess,
        }),
      { wrapper },
    );
    result.current.mutate({ some: 'data' });

    await waitFor(() => result.current.status === 'success');

    expect(mockOnError).not.toHaveBeenCalled();
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('calls the passed in "onError" handler when the mutation fails', async () => {
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();

    stubRequest({
      method: 'POST',
      path: '/v1/some/fake/endpoint',
      fixture: {},
      statusCode: 400,
    });

    const { result, waitFor } = renderHook(
      () =>
        useSparkPostMutation(mockPostFn, {
          ...DEFAULT_OPTIONS,
          onSuccess: mockOnSuccess,
          onError: mockOnError,
        }),
      { wrapper },
    );
    result.current.mutate({ some: 'data' });

    await waitFor(() => result.current.status === 'error');

    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnError).toHaveBeenCalled();
  });
});
