const path = require('path');

// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const WEBPACK_OPTIONS = {
  mode: 'development',
  resolve: {
    alias: {
      src: path.join(__dirname, '../../src'),
      cypress: path.join(__dirname, '../../cypress'),
    },
  },
};

module.exports = (on, config) => {
  const webpackPreprocessor = require('@cypress/webpack-preprocessor');

  // Allows for custom webpack configuration for Cypress tests.
  // Particularly useful to allow the usage of import aliases.
  on(
    'file:preprocessor',
    webpackPreprocessor({
      webpackOptions: WEBPACK_OPTIONS,
      watchOptions: {},
    }),
  );

  on('task', {
    // Used to allow `cy.log()` to the Node console when running in headless mode
    log(message) {
      // eslint-disable-next-line
      console.log(message);

      return null;
    },
  });

  // Configuration options that do not change between environments
  config.blockHosts = [
    '*algolia.net',
    '*google-analytics.com',
    '*googletagmanager.com',
    '*.storage.googleapis.com',
    '*siftscience.com',
    '*sparkpost.test',
    '*sentry.io',
    '*siftscience.com',
    '*visualwebsiteoptimizer.com',
    '*zuora.com',
  ];
  config.integrationFolder = 'cypress/tests/integration';
  config.reporter = 'cypress-multi-reporters';
  config.reporterOptions = {
    configFile: 'cypress.reporter.json',
  };
  config.viewportWidth = 1280;
  config.viewportHeight = 800;

  return config;
};
