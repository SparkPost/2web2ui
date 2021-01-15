import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

// Export the `createMockStore` method if we need to create a new mock store.
// We can place middleware here just like `createStore` if we need it in the
// test environment.
export const createMockStore = configureMockStore([thunk]);

// Export a singleton with blank initial state as default.
export default createMockStore({
  auth: {},
});
