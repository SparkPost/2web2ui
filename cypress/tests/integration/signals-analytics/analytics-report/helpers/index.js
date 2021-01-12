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
  fixture = '200.get.no-results.json',
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
