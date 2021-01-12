import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Providers from 'src/Providers';
import configureStore from 'src/store';
import App from 'src/App';
import { authenticate } from 'src/actions/auth';
import { initializeAccessControl } from 'src/actions/accessControl';
import asyncFlush from 'src/__testHelpers__/asyncFlush';

jest.mock('react-query/devtools', () => ({
  ReactQueryDevtools: () => null,
}));

const forceUpdate = async wrapper => {
  await asyncFlush();
  wrapper.update();
};

const simulate = async (wrapper, selector, eventName) => {
  wrapper.find(selector).simulate(eventName);
  await forceUpdate(wrapper);
};

const currentLocation = wrapper => wrapper.find('MemoryRouter Router').prop('history').location;

/** Bring up the app with in-memory routing on enzyme/jsdom.
 * @param {string} route - the app route to load (see src/config/routes.js)
 * @param {object} options - optional settings
 * @param {boolean} options.authenticated - log into the app?
 * @param {boolean} options.clearApiAfterAuth - clear out the mock axios instance after auth?
 * @returns {Promise<WrappedApp>} an Enzyme wrapper containing the app
 */
export default async function mountRoute(
  route,
  { authenticated = true, clearApiAfterAuth = true } = {},
) {
  const store = configureStore();

  // Note: axios#create() is mocked and now returns the same object on every call
  const axiosMock = axios.create();

  if (authenticated) {
    await store.dispatch(authenticate('test-username', 'test-password'));
    await store.dispatch(initializeAccessControl());

    if (clearApiAfterAuth) {
      axiosMock.mockClear();
    }
  }

  const Router = ({ children }) => <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>;

  const wrapper = mount(
    <Providers store={store}>
      <App RouterComponent={Router} />
    </Providers>,
  );

  await asyncFlush();
  wrapper.update();

  /** A testable instance of the app
   * @typedef {object} WrappedApp
   * @property {ReactWrapper} wrapper - the underlying Enzyme wrapper
   * @property {function} currentRoute
   * @property {function} simulate - ReactWrapper#simulate
   * @property {function} forceUpdate - wait a tick and force the app to re-render
   * @property {object[]} mockApiCalls - array of calls made to axios
   * @property {object} axiosMock - the underlying (singleton) mock axios instance
   * @property {Store} store - the app's redux store
   */
  return {
    wrapper,
    currentLocation: () => currentLocation(wrapper),
    currentRoute: () => currentLocation(wrapper).pathname,
    find: wrapper.find.bind(wrapper),
    simulate: (...rest) => simulate(wrapper, ...rest),
    forceUpdate: (...rest) => forceUpdate(wrapper, ...rest),
    mockApiCalls: axiosMock.mock.calls,
    axiosMock,
    store,
  };
}
