import _ from 'lodash';
import { sparkpost as sparkpostRequest } from 'src/helpers/axiosInstances';

/**
 * Default query by which all query functions are derived when using `react-query`. See: https://react-query.tanstack.com/guides/default-query-function#_top
 *
 * @param {string} url - Unique key for the query. See: https://react-query.tanstack.com/docs/guides/queries#query-keys
 * @param {Object} options
 * @param {string} options.method - the intended method for the XHR request, i.e., "GET", "POST", "PUT", "DELETE"
 * @param {Object} options.params - params passed to the request
 * @param {Object} options.headers - headers passed to the request
 * @param {Object} options.auth - auth object derived from global app data store - as of now, from Redux
 * @param {Object} options.dispatch - Redux dispatch function passed from hooks referencing the default query
 */
export function defaultQueryFn({ queryKey }) {
  // Destructure the passed in `queryKey` to pass arguments to our axios instance
  const [url, { method, params, headers, auth }] = queryKey;

  return sparkpostRequest({
    url,
    method,
    params,
    headers: {
      ...headers,
      Authorization: auth.loggedIn ? auth.token : undefined,
    },
  }).then(response => {
    const results = _.get(response, 'data.results', response.data);

    return results;
  });
}
