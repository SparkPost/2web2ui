const PAGE_URL = '/usage';

describe('The usage page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });

    cy.stubRequest({
      url: `api/v1/billing/subscription`,
      fixture: 'billing/subscription/200.get.json',
      requestAlias: 'subscriptionReq',
    });
  });

  it('renders with a relevant page title ', () => {
    cy.stubRequest({
      url: '/api/v1/usage',
      fixture: 'usage/200.get.json',
      requestAlias: 'usageReq',
    });

    cy.stubRequest({
      url: '/api/v1/usage/history',
      fixture: 'usage/history/200.get.json',
      requestAlias: 'usageHistoryReq',
    });

    cy.visit(PAGE_URL);
    cy.wait(['@usageReq', '@usageHistoryReq', '@subscriptionReq']);
    cy.title().should('include', 'Usage');
    cy.findByRole('heading', { name: 'Usage' }).should('be.visible');
  });

  it('renders three sections when rvUsage and both products are present', () => {
    cy.stubRequest({
      url: '/api/v1/usage',
      fixture: 'usage/200.get.json',
      requestAlias: 'usageReq',
    });

    cy.stubRequest({
      url: '/api/v1/usage/history',
      fixture: 'usage/history/200.get.json',
      requestAlias: 'usageHistoryReq',
    });

    cy.visit(PAGE_URL);
    cy.wait(['@usageReq', '@usageHistoryReq', '@subscriptionReq']);
    cy.findByText('Messaging Usage').should('be.visible');
    cy.findByText('Feature Usage').should('be.visible');
    cy.findByText('Recipient Validation Usage').should('be.visible');
    cy.findByText('Feb 4th').should('be.visible');
  });

  it('renders RV usage cost calculation modal correctly', () => {
    cy.stubRequest({
      url: '/api/v1/usage',
      fixture: 'usage/200.get.json',
      requestAlias: 'usageReq',
    });

    cy.stubRequest({
      url: '/api/v1/usage/history',
      fixture: 'usage/history/200.get.json',
      requestAlias: 'usageHistoryReq',
    });

    cy.visit(PAGE_URL);
    cy.wait(['@usageReq', '@usageHistoryReq', '@subscriptionReq']);
    cy.findByText('View Expense Calculation').click();
    cy.findByText('Recipient Validation Expense Calculation').should('be.visible');
    cy.findAllByText('$0.50').should('have.length', 3);
  });

  it('does not render recipient validation section when the user has no RV usage', () => {
    cy.stubRequest({
      url: '/api/v1/usage',
      fixture: 'usage/200.get.no-results.json',
      requestAlias: 'usageReq',
    });

    cy.stubRequest({
      url: '/api/v1/usage/history',
      fixture: 'usage/history/200.get.json',
      requestAlias: 'usageHistoryReq',
    });

    cy.visit(PAGE_URL);
    cy.wait(['@usageReq', '@usageHistoryReq', '@subscriptionReq']);
    cy.findByRole('heading', { name: 'Messaging Usage' }).should('be.visible');
    cy.findByRole('heading', { name: 'Feature Usage' }).should('be.visible');
    cy.findByRole('heading', { name: 'Recipient Validation Usage' }).should('not.exist');
  });

  it('does not render recipient validation usage chart when the request fails', () => {
    cy.stubRequest({
      url: '/api/v1/usage',
      fixture: 'usage/200.get.no-results.json',
      requestAlias: 'usageReq',
    });

    cy.stubRequest({
      url: '/api/v1/usage/history',
      statusCode: 400,
      fixture: '400.json',
      requestAlias: 'usageHistoryReq',
    });

    cy.visit(PAGE_URL);
    cy.wait(['@usageReq', '@usageHistoryReq', '@subscriptionReq']);
    cy.findByText('Aug 18th').should('not.exist');
  });

  it('renders Usage Page correctly for customers on Annual plans', () => {
    cy.stubRequest({
      url: 'api/v1/account',
      fixture: 'account/200.get.annual-plan.json',
      requestAlias: 'accountReq',
    });
    cy.stubRequest({
      url: '/api/v1/usage',
      fixture: 'usage/200.get.no-results.json',
      requestAlias: 'usageReq',
    });

    cy.stubRequest({
      url: '/api/v1/usage/history',
      statusCode: 400,
      fixture: '400.json',
      requestAlias: 'usageHistoryReq',
    });

    cy.visit(PAGE_URL);
    cy.wait(['@usageReq', '@usageHistoryReq', '@subscriptionReq', '@accountReq']);
    cy.get('[data-id="messaging-usage-chart"]').should('be.visible');
    cy.findByRole('heading', { name: 'Messaging Usage' }).should('be.visible');
    cy.findByRole('heading', { name: 'Feature Usage' }).should('be.visible');
  });

  it('renders an error when a request fails, allowing the user to retry', () => {
    cy.visit(PAGE_URL);
    cy.stubRequest({
      url: '/api/v1/usage',
      statusCode: 400,
      fixture: '400.json',
      requestAlias: 'usageReq',
    });

    cy.stubRequest({
      url: '/api/v1/usage/history',
      fixture: 'usage/history/200.get.json',
      requestAlias: 'usageHistoryReq',
    });

    // Usage request occurs 3 times due to retries
    cy.wait(['@usageReq', '@usageHistoryReq', '@subscriptionReq']);
    cy.wait('@usageReq');
    cy.wait('@usageReq');

    cy.findByRole('heading', { name: 'An error occurred' }).should('be.visible');

    cy.stubRequest({
      url: '/api/v1/usage',
      fixture: 'usage/200.get.json',
      requestAlias: 'successfulUsageReq',
    });
    cy.findByRole('button', { name: 'Try Again' }).click();
    cy.wait(['@successfulUsageReq', '@usageHistoryReq', '@subscriptionReq']);
    cy.findByRole('heading', { name: 'Messaging Usage' }).should('be.visible');
    cy.findByRole('heading', { name: 'Feature Usage' }).should('be.visible');
    cy.findByRole('heading', { name: 'Recipient Validation Usage' }).should('be.visible');
  });

  it('renders the messaging usage chart correctly', () => {
    cy.stubRequest({
      url: '/api/v1/usage',
      fixture: 'usage/200.get.json',
      requestAlias: 'usageReq',
    });

    cy.stubRequest({
      url: '/api/v1/usage/history',
      fixture: 'usage/history/200.get.json',
      requestAlias: 'usageHistoryReq',
    });

    cy.visit(PAGE_URL);
    cy.wait(['@usageReq', '@usageHistoryReq', '@subscriptionReq']);
    cy.get('[data-id="messaging-usage-chart"]').should('be.visible');
  });

  it('renders Usage Page correctly for enterprise customers', () => {
    cy.stubRequest({
      url: 'api/v1/account*',
      fixture: 'account/200.get.enterprise-tenant.json',
      requestAlias: 'accountReq',
    });
    cy.stubRequest({
      url: '/api/v1/usage',
      fixture: 'usage/200.get.enterprise-tenant.json',
      requestAlias: 'usageReq',
    });

    cy.stubRequest({
      url: '/api/v1/usage/history',
      fixture: 'usage/history/200.get.enterprise-tenant.json',
      requestAlias: 'usageHistoryReq',
    });
    cy.visit(PAGE_URL);
    cy.wait(['@usageReq', '@usageHistoryReq', '@subscriptionReq', '@accountReq']);
    cy.get('[data-id="messaging-usage-chart"]').should('be.visible');
    cy.findByRole('heading', { name: 'Messaging Usage' }).should('be.visible');
    cy.findByRole('heading', { name: 'Feature Usage' }).should('be.visible');
  });
});
