import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';
import { USERNAME, PASSWORD } from 'cypress/constants';

/**
 * Used to authenticate with Cypress
 *
 * @param {boolean} isStubbed - whether the authentication response is stubbed. Must be preceded by `cy.stubAuth()` to succeed
 */
Cypress.Commands.add('login', (options = {}) => {
  const { isStubbed } = options;

  cy.getCookie('auth').then(authCookie => {
    cy.server();

    if (!authCookie) {
      if (!isStubbed) {
        cy.route('POST', '/api/v1/authenticate').as('loginPost');
        cy.route('GET', `/api/v1/users/${USERNAME}/two-factor`).as('twoFactorGet');
      }

      cy.visit('/');
      cy.findByLabelText('Email or Username').type(USERNAME);
      cy.findByLabelText('Password').type(PASSWORD);
      cy.findByRole('button', { name: 'Log In' }).click();

      if (!isStubbed) {
        cy.wait('@loginPost');
        cy.wait('@twoFactorGet');
      }

      // Preserves cookies once per spec to avoid repeating login flow for each test
      Cypress.Cookies.preserveOnce('website_auth', '__ssid', 'auth');
    }
  });
});

/**
 * Used to stub network responses for basic user, account, and auth requests
 */
Cypress.Commands.add('stubAuth', ({ hasRefreshToken = false } = {}) => {
  const authFixture = hasRefreshToken
    ? 'authenticate/200.post.with-refresh-token.json'
    : 'authenticate/200.post.json';
  cy.server();

  cy.fixture(authFixture).as('authenticatePost');
  cy.fixture('users/two-factor/200.get.json').as('twoFactorGet');
  cy.fixture('users/200.get.json').as('usersGet');
  cy.fixture('account/200.get.json').as('accountGet');
  cy.fixture('billing/plans/200.get.json').as('plansGet');
  cy.fixture('billing/subscription/200.get.json').as('subscriptionGet');
  cy.fixture('billing/bundles/200.get.json').as('bundlesGet');
  cy.fixture('authenticate/grants/200.get.admin.json').as('grantsGet');
  cy.fixture('suppression-list/200.get.json').as('suppressionsGet');
  cy.fixture('api-keys/200.get.json').as('apiKeysGet');
  cy.fixture('sending-domains/200.get.json').as('sendingDomainsGet');

  cy.route({
    method: 'POST',
    url: '/api/v1/authenticate',
    status: 200,
    response: '@authenticatePost',
  }).as('stubbedAuthenticateRequest');
  cy.route({
    method: 'GET',
    url: `/api/v1/users/${USERNAME}/two-factor`,
    status: 200,
    response: '@twoFactorGet',
  }).as('stubbedTwoFactorRequest');
  cy.route({
    method: 'GET',
    url: '/api/v1/account*',
    status: 200,
    response: '@accountGet',
  }).as('stubbedAccountRequest');
  cy.route({
    method: 'GET',
    url: '/api/v1/billing/plans',
    status: 200,
    response: '@plansGet',
  }).as('stubbedPlansRequest');
  cy.route({
    method: 'GET',
    url: '/api/v1/billing/subscription',
    status: 200,
    response: '@subscriptionGet',
  }).as('stubbedBillingSubscriptionRequest');
  cy.route({
    method: 'GET',
    url: '/api/v1/billing/bundles',
    status: 200,
    response: '@bundlesGet',
  }).as('stubbedBundlesRequest');
  cy.route({
    method: 'GET',
    url: `/api/v1/users/${USERNAME}`,
    status: 200,
    response: '@usersGet',
  }).as('stubbedUsersRequest');
  cy.route({
    method: 'GET',
    url: '/api/v1/authenticate/grants*',
    status: 200,
    response: '@grantsGet',
  }).as('stubbedGrantsRequest');
  cy.route({
    method: 'GET',
    url: '/api/v1/suppression-list*',
    status: 200,
    response: '@suppressionsGet',
  }).as('stubbedSuppressionsGet');
  cy.route({
    method: 'GET',
    url: '/api/v1/api-keys',
    status: 200,
    response: '@apiKeysGet',
  }).as('stubbedApiKeysGet');
  cy.route({
    method: 'GET',
    url: '/api/v1/sending-domains',
    status: 200,
    response: '@sendingDomainsGet',
  }).as('stubbedSendingDomains');
  cy.route({
    method: 'POST',
    url: '/sockjs-node/**/*',
    status: 200,
    response: {},
  }).as('stubbedSockNodePost');
  cy.route({
    method: 'GET',
    url: '/sockjs-node/**/*',
    status: 200,
    response: {},
  }).as('stubbedSockNodeGet');
  cy.route({
    method: 'POST',
    url: 'https://api.analytics.sparkpost.com/v1/*',
    status: 200,
    response: {},
  }).as('stubbedAnalytics');
});

/**
 * Used to concisely stub network requests within Cypress integration tests
 *
 * @param {string} method - the method of the HTTP request being stubbed (https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods). Defaults to `GET`.
 * @param {number} statusCode - the HTTP response status code. Defaults to `200`.
 * @param {string} url - the URL of the request that will be intercepted
 * @param {string} fixture - the path of the relevant fixture. See: https://docs.cypress.io/api/commands/fixture.html
 * @param {string} fixtureAlias - the name of the alias used for the passed in fixture
 * @param {string} requestAlias - the alias name for the passed in route - useful when paired with cy.wait();
 * @param {number} delay - delay before a request will resolve - useful for testing loading states
 */
Cypress.Commands.add(
  'stubRequest',
  ({
    onRequest,
    method = 'GET',
    statusCode = 200,
    url,
    fixture,
    fixtureAlias = 'requestAlias',
    requestAlias = 'stubbedRequest',
    delay,
  }) => {
    cy.server();
    cy.fixture(fixture).as(fixtureAlias);
    cy.route({
      method,
      url,
      status: statusCode,
      response: `@${fixtureAlias}`,
      onRequest,
      delay,
    }).as(requestAlias);
  },
);

/**
 * Used to check for link visibility with a certain `href` attribute value
 *
 * @param {string} content - The content within the link - if the content is broken up by multiple DOM elements, this may not work well
 * @param {string} href - The expected value of the `href` attribute present on the link
 *
 */
Cypress.Commands.add('verifyLink', ({ content, href }) => {
  cy.findByText(content)
    .should('be.visible')
    .closest('a')
    .should('have.attr', 'href', href);
});

/**
 * Used to interact and assert within a modal dialog
 *
 * @param {function} callback - The callback function that runs inside the modal
 *
 */
Cypress.Commands.add('withinModal', callback => {
  cy.get('[role="dialog"]:visible').within(callback);
});

/**
 * Used to check within the global alert view
 *
 * @param {function} callback - The function that has assertions to run within the alert container
 *
 */
Cypress.Commands.add('withinSnackbar', callback => {
  cy.get('#alert-portal').within(callback);
});

/**
 * Used to interact and assert within the main content of the page
 *
 * @param {function} callback - The callback function that runs inside the main content of the page
 *
 */
Cypress.Commands.add('withinMainContent', callback => {
  cy.get('main').within(callback);
});

/**
 * Used to interact and assert within the drawer
 *
 * @param {function} callback - The callback function that runs inside the drawer
 *
 */
Cypress.Commands.add('withinDrawer', callback => {
  cy.get('#drawer-portal').within(callback);
});

Cypress.Commands.add('findByDataId', id => cy.get(`[data-id="${id}"]`));

// todo, replace with findByLabelText when it works as documented
Cypress.Commands.add('findByAriaLabelledByText', text =>
  cy.findByText(text).then($label => {
    const id = $label.prop('id');

    if (!id) {
      throw new Error(`Unable to find id for label with '${text}' text`);
    }

    return cy.get(`[aria-labelledby="${id}"]`);
  }),
);

// todo, replace with findByAriaLabelledByText when Panel sets the correct aria attributes
Cypress.Commands.add('findByPanelTitle', text =>
  cy
    .findByText(text)
    .parent({ log: false })
    .parent({ log: false }),
);

Cypress.Commands.add('findListBoxByLabelText', text =>
  cy.findByLabelText(text).then($input => {
    const id = $input.attr('aria-controls');

    if (!id) {
      throw new Error(`Unable to find listbox id for label with '${text}' text`);
    }

    return cy.get(`#${id}[role=listbox]`);
  }),
);
