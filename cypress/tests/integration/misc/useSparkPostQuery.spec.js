const PAGE_URL = '/usage'; // This page has relatively simple i/o for testing the basics of the network request layer

function commonBeforeSteps() {
  cy.stubAuth();
  cy.login({ isStubbed: true });
  cy.stubRequest({
    url: `api/v1/billing/subscription`,
    fixture: 'billing/subscription/200.get.json',
    requestAlias: 'billingReq',
  });
  cy.stubRequest({
    url: 'api/v1/account?include=usage',
    fixture: 'account/200.get.include-usage.json',
    requestAlias: 'accountUsageReq',
  });
  cy.stubRequest({
    url: '/api/v1/usage/history',
    fixture: 'usage/history/200.get.json',
    requestAlias: 'usageHistoryReq',
  });
}

describe('SparkPost request handling via `useSparkPostQuery`', () => {
  it('does not render an error when an API responds with a 404 status code', () => {
    commonBeforeSteps();
    cy.stubRequest({
      url: '/api/v1/usage',
      statusCode: 404,
      fixture: '400.json',
      requestAlias: 'usageReq',
    });

    cy.visit(PAGE_URL);
    cy.wait('@usageReq');
    cy.wait('@usageReq');
    cy.wait('@usageReq');
    cy.findByText('Something went wrong.').should('not.exist');
  });

  it("re-requests the user's account information when an API responds with a 403 status code", () => {
    commonBeforeSteps();
    cy.stubRequest({
      url: '/api/v1/usage',
      statusCode: 403,
      fixture: '400.json',
      requestAlias: 'usageReq',
    });
    cy.stubRequest({
      url: '/api/v1/account',
      fixture: 'account/200.get.test-plan.json',
      requestAlias: 'accountReq',
    });

    cy.visit(PAGE_URL);

    // First account request should be made on page load
    cy.wait('@accountReq');
    // Then we wait for both the usage request to fail and then the account to be re-requested due to the `403` response
    cy.wait('@usageReq');
    cy.wait('@usageReq');
    cy.wait('@usageReq');
    cy.wait('@accountReq');
    cy.findByRole('heading', { name: 'An error occurred' }).should('be.visible');
  });

  it('logs the user out when an API returns a 401 status code when no refresh token is present', () => {
    commonBeforeSteps();
    cy.stubRequest({
      url: '/api/v1/usage',
      statusCode: 401,
      fixture: '400.json',
      requestAlias: 'usageReq',
    });
    cy.stubRequest({
      url: '/api/v1/authenticate/logout',
      method: 'POST',
      fixture: 'authenticate/logout/200.post.json',
      requestAlias: 'logoutReq',
    });

    cy.visit(PAGE_URL);
    // Three retry attempts
    cy.wait('@usageReq');
    cy.wait('@usageReq');
    cy.wait('@usageReq');
    cy.wait('@logoutReq');

    cy.title().should('include', 'Log In');
    cy.url().should('include', '/auth');
  });

  it('makes a request for a new access token if the API returns a 401 and the refresh token request succeeds', () => {
    cy.stubAuth({ hasRefreshToken: true });
    cy.login({ isStubbed: true });
    cy.visit(PAGE_URL);
    cy.stubRequest({
      url: '/api/v1/usage',
      statusCode: 401,
      fixture: '400.json',
      requestAlias: 'usageReq',
    });
    cy.stubRequest({
      url: '/api/v1/authenticate',
      method: 'POST',
      fixture: 'authenticate/200.post.json',
      requestAlias: 'authReq',
    });
    // Three retry attempts
    cy.wait('@usageReq');
    cy.wait('@usageReq');
    cy.wait('@usageReq');
    cy.wait('@usageReq');

    cy.stubRequest({
      url: '/api/v1/usage',
      fixture: 'usage/200.get.json',
      requestAlias: 'usageReq',
    });
    cy.wait(['@authReq', '@usageReq']);

    // The request is successful and the user is not logged out
    cy.title().should('not.include', 'Log In');
    cy.url().should('not.include', '/auth');
    // And the page renders successfully
    cy.findByRole('heading', { name: 'Usage' }).should('be.visible');
    cy.findByRole('heading', { name: 'Messaging Usage' }).should('be.visible');
    cy.findByRole('heading', { name: 'Feature Usage' }).should('be.visible');
    cy.findByRole('heading', { name: 'Recipient Validation Usage' }).should('be.visible');
  });

  it('logs the user out if the API returns a 401 and the refresh token request fails', () => {
    cy.stubAuth({ hasRefreshToken: true });
    cy.login({ isStubbed: true });
    cy.stubRequest({
      url: '/api/v1/usage',
      statusCode: 401,
      fixture: '400.json',
      requestAlias: 'usageReq',
    });
    cy.stubRequest({
      url: '/api/v1/authenticate',
      method: 'POST',
      statusCode: 400,
      fixture: 'authenticate/400.post.json',
      requestAlias: 'authReq',
    });
    cy.stubRequest({
      url: '/api/v1/authenticate/logout',
      method: 'POST',
      fixture: 'authenticate/logout/200.post.json',
      requestAlias: 'logoutReq',
    });

    cy.visit(PAGE_URL);
    // Three retry attempts
    cy.wait('@usageReq');
    cy.wait('@usageReq');
    cy.wait('@usageReq');
    cy.wait('@authReq');
    cy.wait('@logoutReq');

    cy.title().should('include', 'Log In');
    cy.url().should('include', '/auth');
  });

  it('renders a "File size larger than the server allows." error when an API responds with the 413 status code', () => {
    commonBeforeSteps();
    // This scenario doesn't really make sense since a GET request couldn't result in a `413`, but the logic can still be accounted for in this manner
    cy.stubRequest({
      url: '/api/v1/usage',
      statusCode: 413,
      fixture: '400.json',
      requestAlias: 'usageReq',
    });
    cy.visit(PAGE_URL);
    cy.wait('@usageReq');
    cy.wait('@usageReq');
    cy.wait('@usageReq');
    cy.wait('@usageReq');

    cy.findByText('Something went wrong.').should('be.visible');
    cy.findByText('View Details').click();
    cy.findByText('File size larger than the server allows.').should('be.visible');
  });

  it('renders the returned error message when an API returns an error', () => {
    commonBeforeSteps();
    cy.stubRequest({
      url: '/api/v1/usage',
      statusCode: 400,
      fixture: '400.json',
      requestAlias: 'usageReq',
    });
    cy.visit(PAGE_URL);
    cy.wait('@usageReq');
    cy.wait('@usageReq');
    cy.wait('@usageReq');
    cy.wait('@usageReq');

    cy.findByText('Something went wrong.').should('be.visible');
    cy.findByText('View Details').click();
    cy.findByText('This is an error').should('be.visible');
  });

  // todo, make this test work, Cypress does not provide a way to "block" an individual network request similar
  //   to losing your network connection or Ad Blocker, tried Cypress.automation, calling xhr.onerror from
  //   all the callbacks, not stubbing at all, and more
  // see, https://www.cypress.io/blog/2020/11/12/testing-application-in-offline-network-mode/
  // it('renders a generic "You may be having network issues or an adblocker may be blocking part of the app." when the error does not have a description or message', () => {
  //   commonBeforeSteps();
  //   cy.stubRequest({
  //     url: '/api/v1/usage',
  //     statusCode: 400,
  //     fixture: 'blank.json',
  //     requestAlias: 'usageReq',
  //   });
  //   cy.visit(PAGE_URL);
  //   cy.wait('@usageReq');
  //   cy.wait('@usageReq');
  //   cy.wait('@usageReq');
  //   cy.wait('@usageReq');

  //   cy.findByText('Something went wrong.').should('be.visible');
  //   cy.findByText('View Details').click();
  //   cy.findByText(
  //     'You may be having network issues or an adblocker may be blocking part of the app.',
  //   ).should('be.visible');
  // });
});
