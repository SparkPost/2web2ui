const PAGE_URL = '/alerts/details/5';
const API_URL = '/api/v1/alerts/5';

describe('The alerts details pages', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });

    cy.stubRequest({
      url: API_URL,
      fixture: 'alerts/5/200.get.json',
    });

    cy.stubRequest({
      url: `${API_URL}/incidents`,
      fixture: 'alerts/5/incidents/200.get.json',
      requestAlias: 'getIncidents',
    });

    cy.stubRequest({
      url: '/api/v1/subaccounts',
      fixture: 'subaccounts/200.get.json',
      requestAlias: 'getSubaccounts',
    });
  });

  it('renders with relevant alert details data', () => {
    cy.visit(PAGE_URL);
  });
});
