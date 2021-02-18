//Need two sets because timezones contain a '/'
export function stubDeliverability(requestAlias = 'getDeliverability') {
  cy.stubRequest({
    url: '/api/v1/metrics/deliverability**/**',
    fixture: 'metrics/deliverability/200.get.json',
    requestAlias,
  });
}

export function stubUTCDeliverability(requestAlias = 'getUTCDeliverability') {
  cy.stubRequest({
    url: '/api/v1/metrics/deliverability**',
    fixture: 'metrics/deliverability/200.get.json',
    requestAlias,
  });
}

export function stubTimeSeries(requestAlias = 'getTimeSeries') {
  cy.stubRequest({
    url: '/api/v1/metrics/deliverability/time-series**/**',
    fixture: 'metrics/deliverability/time-series/200.get.json',
    requestAlias,
  });
}

export function stubUTCTimeSeries(requestAlias = 'getUTCTimeSeries') {
  cy.stubRequest({
    url: '/api/v1/metrics/deliverability/time-series**',
    fixture: 'metrics/deliverability/time-series/200.get.json',
    requestAlias,
  });
}

export function stubSubaccounts(requestAlias = 'getSubaccounts') {
  cy.stubRequest({
    url: '/api/v1/subaccounts',
    fixture: 'subaccounts/200.get.json',
    requestAlias,
  });
}

export function stubReports(requestAlias = 'getReports') {
  cy.stubRequest({
    url: '/api/v1/reports',
    fixture: 'reports/200.get.json',
    requestAlias,
  });
}

export function stubSubscription(requestAlias = 'getSubscription') {
  cy.stubRequest({
    url: '/api/v1/billing/subscription',
    fixture: 'billing/subscription/200.get.json',
    requestAlias,
  });
}

export function stubSendingDomains({
  fixture = 'sending-domains/200.get.json',
  requestAlias = 'sendingDomainsReq',
  statusCode = 200,
} = {}) {
  cy.stubRequest({
    url: '/api/v1/sending-domains',
    fixture,
    requestAlias,
    statusCode,
  });
}

export function commonBeforeSteps() {
  cy.stubAuth();
  cy.login({ isStubbed: true });

  stubSubaccounts();
  stubDeliverability();
  stubReports();
  stubTimeSeries();
  stubUTCDeliverability();
  stubUTCTimeSeries();
  stubSubscription();
  stubSendingDomains();
}

export function getFilterTags() {
  return cy.findByDataId('active-filter-tags');
}

export function getFilterGroupings() {
  return cy.findByDataId('active-filter-group');
}

/**
 * Applies two subaccount comparisons to the current report
 */
export function applySubaccountComparisons() {
  cy.findByRole('button', { name: 'Add Comparison' }).click();
  cy.withinDrawer(() => {
    cy.findByLabelText('Type').select('Subaccount');
    cy.findAllByLabelText('Subaccount')
      .eq(0)
      .type('sub');
    cy.wait('@getSubaccounts');
    cy.findByRole('option', { name: 'Fake Subaccount 1 (ID 101)' }).click();
    cy.findAllByLabelText('Subaccount')
      .eq(1)
      .type('sub');
    cy.wait('@getSubaccounts');
    cy.findByRole('option', { name: 'Fake Subaccount 2 (ID 102)' }).click();
    cy.findByRole('button', { name: 'Compare' }).click();
  });
}

/**
 * Applies bounce-related metrics to the current report
 */
export function applyBounceMetrics() {
  cy.withinDrawer(() => {
    // Uncheck defaults, and check a metric that renders the "Bounce Reason" table
    cy.findByLabelText('Targeted').uncheck({ force: true });
    cy.findByLabelText('Accepted').uncheck({ force: true });
    cy.findByLabelText('Bounces').uncheck({ force: true });
    cy.findByLabelText('Sent').uncheck({ force: true });

    // Then check bounce-related metrics
    cy.findByLabelText('Bounces').check({ force: true });

    cy.findByRole('button', { name: 'Apply Metrics' }).click();
    cy.wait(['@getDeliverability', '@getTimeSeries']);
  });
}

/**
 * Applies rejected-related metrics to the current report
 */
export function applyRejectionMetrics() {
  cy.withinDrawer(() => {
    // Uncheck defaults, and check a metric that renders the "Rejection Reason" table
    cy.findByLabelText('Targeted').uncheck({ force: true });
    cy.findByLabelText('Accepted').uncheck({ force: true });
    cy.findByLabelText('Bounces').uncheck({ force: true });
    cy.findByLabelText('Sent').uncheck({ force: true });

    // Then check rejection-related metrics
    cy.findByLabelText('Rejected').check({ force: true });
    cy.findByLabelText('Policy Rejections').check({ force: true });
    cy.findByLabelText('Generation Failures').check({ force: true });
    cy.findByLabelText('Generation Rejections').check({ force: true });
    cy.findByLabelText('Rejection Rate').check({ force: true });

    cy.findByRole('button', { name: 'Apply Metrics' }).click();
    cy.wait(['@getDeliverability', '@getTimeSeries']);
  });
}

/**
 * Applies delay-related metrics to the current report
 */
export function applyDelayMetrics() {
  cy.withinDrawer(() => {
    // Uncheck defaults, and check a metric that renders the "Rejection Reason" table
    cy.findByLabelText('Targeted').uncheck({ force: true });
    cy.findByLabelText('Accepted').uncheck({ force: true });
    cy.findByLabelText('Bounces').uncheck({ force: true });
    cy.findByLabelText('Sent').uncheck({ force: true });

    // Then check delay-related metrics
    cy.findByLabelText('Accepted').check({ force: true });
    cy.findByLabelText('Delayed').check({ force: true });
    cy.findByLabelText('Delayed 1st Attempt').check({ force: true });

    cy.findByRole('button', { name: 'Apply Metrics' }).click();
    cy.wait(['@getDeliverability', '@getTimeSeries']);
  });
}

/**
 * Applies engagement-related metrics to the current report
 */
export function applyEngagementMetrics() {
  cy.withinDrawer(() => {
    // Uncheck defaults, and check a metric that renders the "Links" table
    cy.findByLabelText('Targeted').uncheck({ force: true });
    cy.findByLabelText('Accepted').uncheck({ force: true });
    cy.findByLabelText('Bounces').uncheck({ force: true });
    cy.findByLabelText('Clicks').check({ force: true });
    cy.findByRole('button', { name: 'Apply Metrics' }).click();

    cy.wait(['@getDeliverability', '@getTimeSeries']);
  });
}
