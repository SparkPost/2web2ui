const PAGE_BASE_URL = '/signals/integration';

describe('The Signals integration page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
    cy.stubRequest({
      url: '/api/v1/account**',
      fixture: 'account/200.get.has-on-prem.json',
      requestAlias: 'accountReq',
    });
  });

  it('navigates to the signals integration page and renders correct title', () => {
    cy.stubRequest({
      url: `api/v1/events/ingest*`,
      fixture: 'events/ingest/200.get.json',
      requestAlias: 'getIngestFirst',
    });
    cy.visit(PAGE_BASE_URL);
    cy.wait(['@getIngestFirst', '@accountReq']);
    cy.url().should('include', PAGE_BASE_URL);
    cy.title().should('include', 'Signals Integration');
    cy.findByText('Review the health of your Signals integration.').should('be.visible');
  });

  it('on filtering by status api is called with correct params and request parameters change correctly', () => {
    cy.stubRequest({
      url: `api/v1/events/ingest*`,
      fixture: 'events/ingest/200.get.json',
      requestAlias: 'getIngestFirst',
    });
    cy.visit(PAGE_BASE_URL);
    cy.wait(['@getIngestFirst', '@accountReq']);
    cy.findByLabelText('Status Filter').select('Success');
    cy.wait('@getIngestFirst').should(xhr => {
      expect(xhr.url).to.contain('events=success');
    });
    cy.url().should('include', 'batchStatus=success');
  });

  it('on filtering by batch ids api is called with correct params and request parameters change correctly', () => {
    cy.stubRequest({
      url: `api/v1/events/ingest*`,
      fixture: 'events/ingest/200.get.json',
      requestAlias: 'getIngestFirst',
    });
    cy.visit(PAGE_BASE_URL);
    cy.wait(['@getIngestFirst', '@accountReq']);
    cy.findByLabelText('Filter by Batch ID').type('704c1176-fa52-4ce0-81f5-290b6c917a15{enter}');
    cy.wait('@getIngestFirst').should(xhr => {
      expect(xhr.url).to.contain('?batch_ids=704c1176-fa52-4ce0-81f5-290b6c917a15');
    });
    cy.url().should('include', '?batchIds=704c1176-fa52-4ce0-81f5-290b6c917a15');
  });

  it('on clicking next page, api is called with correct params', () => {
    cy.stubRequest({
      url: `api/v1/events/ingest*`,
      fixture: 'events/ingest/200.get.json',
      requestAlias: 'getIngestFirst',
    });
    cy.visit(PAGE_BASE_URL);
    cy.wait(['@getIngestFirst', '@accountReq']);
    cy.findByRole('button', { name: 'Next' }).click();
    cy.wait('@getIngestFirst').should(xhr => {
      expect(xhr.url).to.contain('?cursor=next-page-cursor');
    });
    cy.contains('Page: 2');
  });

  it('on changing per page, api is called with correct params and request parameters change correctly', () => {
    cy.stubRequest({
      url: `api/v1/events/ingest*`,
      fixture: 'events/ingest/200.get.json',
      requestAlias: 'getIngestFirst',
    });
    cy.visit(PAGE_BASE_URL);
    cy.wait(['@getIngestFirst', '@accountReq']);
    cy.findByText('Per Page')
      .scrollIntoView()
      .should('be.visible');
    cy.findByRole('button', { name: '25 per page' }).click();
    cy.wait('@getIngestFirst').should(xhr => {
      expect(xhr.url).to.contain('per_page=25');
    });
  });
});
