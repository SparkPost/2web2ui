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

  it('resets returned data to the initial state using the returned "reset" function', () => {});

  it('returns error messages when mutations fail', () => {});

  it('calls the passed in "onMutate" handler when the mutation succeeds', () => {});

  it('calls the passed in "onSuccess" handler when the mutation succeeds', () => {});

  it('calls the passed in "onError" handler when the mutation fails', () => {});
});
