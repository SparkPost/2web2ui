import React from 'react';
import { MemoryRouter as Router } from 'react-router-dom';
import Providers from 'src/Providers';
import store from 'src/store';

const TestApp = ({ children, history, isHibanaEnabled = true, store: reduxStore = {} }) => {
  const state = {
    currentUser: {
      options: {
        ui: {
          isHibanaEnabled,
        },
      },
    },
    ...reduxStore,
  };

  return (
    <Providers store={store(state)}>
      <Router history={history}>{children}</Router>
    </Providers>
  );
};

export default TestApp;
