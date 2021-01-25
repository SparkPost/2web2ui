const PAGE_URL = '/signals/blocklist/incidents/7';
const BLOCKLIST_BASE_API_URL = '/api/v1/blocklist-monitors';

describe('Blocklist Incident Details Page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });

    cy.stubRequest({
      url: `${BLOCKLIST_BASE_API_URL}/incidents/7`,
      fixture: 'blocklists/single/200.get.json',
      requestAlias: 'singleIncident',
    });

    cy.stubRequest({
      url: `${BLOCKLIST_BASE_API_URL}/incidents?**`,
      fixture: 'blocklists/200.get.other-recent.json',
      requestAlias: 'otherIncidents',
    });

    cy.stubRequest({
      url: `${BLOCKLIST_BASE_API_URL}/sparkpost.io/incidents**`,
      fixture: 'blocklists/200.get.historical-incidents.json',
      requestAlias: 'historicalIncidents',
    });
  });

  it('has a relevant page title', () => {
    cy.visit(PAGE_URL);
    cy.title().should('include', 'Incident Details');
  });

  it('loads and renders the blocklist incident correctly', () => {
    const timestamp = 1580392800000; //01/30/2020 @ 2:00pm (UTC)
    cy.clock(timestamp);
    cy.visit(PAGE_URL);
    //Separated into 2 waits bc the page calls the incidents endpoint first and then calls the other 3 async
    cy.wait('@singleIncident');
    cy.wait(['@otherIncidents', '@otherIncidents', '@historicalIncidents']);

    cy.findByText('Blocklist Incident').should('be.visible');

    cy.get('[data-id=incident-details]').within(() => {
      cy.findByText('sparkpost.io');
      cy.findByText('abuseat.org (CBL)').should('be.visible');
      cy.findByText(/Dec 2[456] 2019, \d*:30[ap]m/).should('be.visible');
      cy.findByText('Active').should('be.visible');
      cy.findByText('36').should('be.visible');
    });

    cy.get('[data-id=related-incidents-blocklist]').within(() => {
      cy.findByText('127.0.0.2').should('be.visible');
      cy.findByText(/Nov 2[012] 2019/).should('be.visible');
      cy.findByText('Active').should('be.visible');
      cy.findByText('123.123.123.1').should('be.visible');
      cy.findAllByText(/Dec 2[567] 2019/).should('have.length', 2);
    });

    cy.get('[data-id=related-incidents-resource]').within(() => {
      cy.findByText('new.spam.dnsbl.sorbs.net').should('be.visible');
      cy.findByText(/Dec 2[567] 2019/).should('be.visible');
      cy.findByText('Active').should('be.visible');
    });
  });

  it('shows error component when there is an error', () => {
    cy.stubRequest({
      statusCode: 400,
      url: `${BLOCKLIST_BASE_API_URL}/incidents/**`,
      fixture: 'blocklists/400.get.json',
      requestAlias: 'incidentError',
    });

    cy.visit(PAGE_URL);
    cy.findByText('An error occurred').should('be.visible');
    cy.findByText(
      'Sorry, we seem to have had some trouble loading your blocklist incidents.',
    ).should('be.visible');
    cy.findByText('Show Error Details').click();
    cy.findByText('Hey look, an error').should('be.visible');
  });

  it('Opens support panel when clicking on "Contact Support" action in remediation steps', () => {
    cy.visit(PAGE_URL);
    cy.findByText('Contact Support').click();
    cy.withinModal(() => {
      cy.findByText('Submit A Ticket').should('be.visible');
      cy.findByLabelText('Tell us more about your issue').contains('Listed Resource: sparkpost.io');
      cy.findByLabelText('Tell us more about your issue').contains(
        'List: AbuseAt CBL (abuseat.org (CBL))',
      );
      cy.findByLabelText('Tell us more about your issue').contains(
        'Listing Date: Dec 25 2019, 2:30am',
      );
    });
  });

  describe('Incident Details', () => {
    it('displays alternative text when there are no historical incidents', () => {
      cy.stubRequest({
        url: `${BLOCKLIST_BASE_API_URL}/sparkpost.io/incidents**`,
        fixture: '/200.get.no-results.json',
        requestAlias: 'historicalIncidentsEmpty',
      });
      cy.visit(PAGE_URL);
      cy.wait('@historicalIncidentsEmpty');
      cy.findByText('No historical incidents for sparkpost.io on abuseat.org (CBL)').should(
        'be.visible',
      );
    });

    it('deep links to filtered summary report page upon clicking "View Engagement" ', () => {
      cy.visit(PAGE_URL);
      cy.findByText('View Engagement').click({ force: true });

      cy.url().should('include', 'filters=Sending%20Domain%3Asparkpost.io');
    });
  });

  describe('Related Incidents (blocklist)', () => {
    it('displays alternative text when there are no other recent incidents', () => {
      cy.stubRequest({
        url: `${BLOCKLIST_BASE_API_URL}/incidents?blocklists=**`,
        fixture: '/200.get.no-results.json',
        requestAlias: 'recentOtherIncidentsEmpty',
      });
      cy.visit(PAGE_URL);
      cy.wait('@recentOtherIncidentsEmpty');
      cy.findByText('No other recent abuseat.org (CBL) incidents').should('be.visible');
    });

    it("redirects to that incident's detail page when clicking another incident", () => {
      cy.visit(PAGE_URL);

      cy.get('[data-id=related-incidents-blocklist]').within(() => {
        cy.get('a')
          .contains('127.0.0.2')
          .click({ force: true });
      });
      cy.url().should('include', '/signals/blocklist/incidents/9');
    });
  });

  describe('Related Incidents (resource)', () => {
    it('displays alternative text when there are no other recent incidents', () => {
      cy.stubRequest({
        url: `${BLOCKLIST_BASE_API_URL}/incidents?resources=**`,
        fixture: '/200.get.no-results.json',
        requestAlias: 'recentOtherIncidentsEmpty',
      });
      cy.visit(PAGE_URL);
      cy.wait('@recentOtherIncidentsEmpty');
      cy.findByText('No other recent sparkpost.io incidents').should('be.visible');
    });

    it("redirects to that incident's detail page when clicking another incident", () => {
      cy.visit(PAGE_URL);

      cy.get('[data-id=related-incidents-resource]').within(() => {
        cy.get('a')
          .contains('new.spam.dnsbl.sorbs.net')
          .click({ force: true });
      });
      cy.url().should('include', '/signals/blocklist/incidents/8');
    });
  });
});
