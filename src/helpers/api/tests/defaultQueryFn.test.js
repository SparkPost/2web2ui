import { defaultQueryFn } from '../defaultQueryFn';
import { sparkpost as sparkpostRequest } from 'src/helpers/axiosInstances';
jest.mock('src/helpers/axiosInstances');

describe('defaultQueryFn', () => {
  it('destructures the passed in `queryKey`, passing the url, method, params, headers, and authorization headers to `sparkpostRequest`', () => {
    const mockSparkPostRequest = jest.fn(() => Promise.resolve({}));
    sparkpostRequest.mockImplementationOnce(mockSparkPostRequest);

    defaultQueryFn({
      queryKey: [
        'fake.api.com',
        {
          method: 'GET',
          params: {
            some: 'param',
          },
          headers: {
            some: 'header',
          },
          auth: {
            loggedIn: true,
            token: '123456789',
          },
        },
      ],
    });

    expect(mockSparkPostRequest).toHaveBeenCalledWith({
      url: 'fake.api.com',
      method: 'GET',
      params: {
        some: 'param',
      },
      headers: {
        some: 'header',
        Authorization: '123456789',
      },
    });
  });

  it('makes a request without an Authorization header when auth.loggedIn is falsy', () => {
    const mockSparkPostRequest = jest.fn(() => Promise.resolve({}));
    sparkpostRequest.mockImplementationOnce(mockSparkPostRequest);

    defaultQueryFn({
      queryKey: [
        'fake.api.com',
        {
          method: 'GET',
          params: {
            some: 'param',
          },
          headers: {
            some: 'header',
          },
          auth: {
            loggedIn: false,
            token: '123456789',
          },
        },
      ],
    });

    expect(mockSparkPostRequest).toHaveBeenCalledWith({
      url: 'fake.api.com',
      method: 'GET',
      params: {
        some: 'param',
      },
      headers: {
        some: 'header',
      },
    });
  });

  it('returns data from the "data.results" derived from the response', async () => {
    const mockResults = [1, 2, 3, 4, 5];
    const mockSparkPostRequest = jest.fn(() => Promise.resolve({ data: { results: mockResults } }));
    sparkpostRequest.mockImplementationOnce(mockSparkPostRequest);

    const results = await defaultQueryFn({
      queryKey: [
        'fake.api.com',
        {
          method: 'GET',
          params: {
            some: 'param',
          },
          headers: {
            some: 'header',
          },
          auth: {
            loggedIn: false,
            token: '123456789',
          },
        },
      ],
    });

    expect(results).toEqual(mockResults);
  });

  it('returns data from the "data" key if no "data.results" are present', async () => {
    const mockResults = [6, 7, 8, 9, 10];
    const mockSparkPostRequest = jest.fn(() => Promise.resolve({ data: mockResults }));
    sparkpostRequest.mockImplementationOnce(mockSparkPostRequest);

    const results = await defaultQueryFn({
      queryKey: [
        'fake.api.com',
        {
          method: 'GET',
          params: {
            some: 'param',
          },
          headers: {
            some: 'header',
          },
          auth: {
            loggedIn: false,
            token: '123456789',
          },
        },
      ],
    });

    expect(results).toEqual(mockResults);
  });
});
