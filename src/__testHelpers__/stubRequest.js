import nock from 'nock';

/**
 * Stub network requests in a Jest environment.
 *
 * @param {string} url - base URL for stubbed requests
 * @param {string} path - path following the passed in `url`, e.g., "/users/username"
 * @param {enum} method - HTTP request method - https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
 * @param {number} statusCode - HTTP status code for the stubbed response
 * @param {object} fixture - response to the stubbed request
 *
 */
export default function stubRequest({
  url = 'http://api.sparkpost.test',
  path,
  method = 'GET',
  statusCode = 200,
  fixture,
}) {
  return nock(url)
    .intercept(path, method)
    .reply(statusCode, fixture);
}
