const PAGE_BASE_URL = '/signals/blocklist/incidents';

describe('The blocklist incidents page', () => {
  beforeEach(() => {
    cy.clock(Date.UTC(2019, 8, 11)); // freeze time

    cy.stubAuth();
    cy.login({ isStubbed: true });

    cy.stubRequest({
      url: 'api/v1/blocklist-monitors',
      fixture: 'blocklists/incident/200.get.search.json',
      requestAlias: 'getMonitors',
    });

    cy.stubRequest({
      url: 'api/v1/blocklist-monitors/incidents*',
      fixture: 'blocklists/incident/200.get.json',
      requestAlias: 'getIncidents',
    });
  });

  it('loads incidents page', () => {
    cy.visit(PAGE_BASE_URL);
    cy.url().should('include', PAGE_BASE_URL);
    cy.title().should('include', 'Blocklist Incidents');
  });

  it('filters incidents', () => {
    cy.visit(PAGE_BASE_URL);

    cy.wait(['@getMonitors', '@getIncidents']);

    cy.findByLabelText('Filter Results')
      .type('2.2.8')
      .blur();

    cy.tick(300); // ugh, run off for table collection debounce

    cy.url().should('include', 'search=2.2.8');

    cy.get('tbody > tr').should('have.length', 1);

    cy.get('tbody tr')
      .eq(0)
      .within(() => {
        cy.get('td')
          .eq(0)
          .should('contain', '2.2.8');
        cy.get('td')
          .eq(1)
          .should('contain', 'new.spam.dnsbl.sorbs.net');
        cy.get('td')
          .eq(2)
          .should('contain', 'Sep 8 2019');
        cy.get('td')
          .eq(3)
          .should('contain', 'Active');
      });
  });

  it('searches through url param', () => {
    cy.visit(`${PAGE_BASE_URL}?search=2.2.8`);

    cy.wait(['@getMonitors', '@getIncidents']);

    cy.get('tbody > tr').should('have.length', 1);
    cy.get('tbody tr')
      .eq(0)
      .within(() => {
        cy.get('td')
          .eq(0)
          .should('contain', '2.2.8');
      });
  });

  it('filters by last 30 days by default', () => {
    cy.visit(PAGE_BASE_URL);

    cy.wait('@getIncidents').then(({ url }) => {
      cy.wrap(url).should('include', 'from=2019-08-12');
      cy.wrap(url).should('include', 'to=2019-09-11');
    });
  });

  it('filter by last 24 hours', () => {
    cy.visit(PAGE_BASE_URL);
    cy.wait(['@getMonitors', '@getIncidents']);

    cy.findByLabelText('Date Range').click({ force: true });
    cy.tick(300); // ugh, run off for popover animation
    cy.findByText('Last 24 Hours').click({ force: true });
    cy.findByText('Apply').click();

    cy.wait('@getIncidents').then(({ url }) => {
      cy.wrap(url).should('include', 'from=2019-09-10');
      cy.wrap(url).should('include', 'to=2019-09-11');
    });
  });

  it('filter by last 7 days', () => {
    cy.visit(PAGE_BASE_URL);
    cy.wait(['@getMonitors', '@getIncidents']);

    cy.findByLabelText('Date Range').click({ force: true });
    cy.tick(300); // ugh, run off for popover animation
    cy.findByText('Last 7 Days').click({ force: true });
    cy.findByText('Apply').click();

    cy.wait('@getIncidents').then(({ url }) => {
      cy.wrap(url).should('include', 'from=2019-09-04');
      cy.wrap(url).should('include', 'to=2019-09-11');
    });
  });

  it('filter by last 90 days', () => {
    cy.visit(PAGE_BASE_URL);
    cy.wait(['@getMonitors', '@getIncidents']);

    cy.findByLabelText('Date Range').click({ force: true });
    cy.tick(300); // ugh, run off for popover animation
    cy.findByText('Last 90 Days').click({ force: true });
    cy.findByText('Apply').click();

    cy.wait('@getIncidents').then(({ url }) => {
      cy.wrap(url).should('include', 'from=2019-06-12');
      cy.wrap(url).should('include', 'to=2019-09-11');
    });
  });

  it('sorted descending by resource by default', () => {
    cy.visit(PAGE_BASE_URL);
    cy.wait(['@getMonitors', '@getIncidents']);

    cy.get('tbody > tr')
      .first()
      .within(() => {
        cy.findAllByText('127.0.0.2').should('be.visible');
        cy.findAllByText('blocklist.lashback.com').should('be.visible');
        cy.findAllByText('2 months from now').should('be.visible');
        cy.findAllByText('Active').should('be.visible');
      });

    cy.get('tbody > tr')
      .last()
      .within(() => {
        cy.findAllByText('2.2.8').should('be.visible');
        cy.findAllByText('new.spam.dnsbl.sorbs.net').should('be.visible');
        cy.findAllByText('Sep 8 2019, 8:00pm').should('be.visible');
        cy.findAllByText('Active').should('be.visible');
      });
  });

  it('sorted descending by date listed', () => {
    cy.visit(PAGE_BASE_URL);

    cy.wait(['@getMonitors', '@getIncidents']);

    cy.findByText('Date Listed').click();

    cy.get('tbody > tr')
      .first()
      .within(() => {
        cy.findAllByText('2.2.8').should('be.visible');
        cy.findAllByText('new.spam.dnsbl.sorbs.net').should('be.visible');
        cy.findAllByText('Sep 8 2019, 8:00pm').should('be.visible');
        cy.findAllByText('Active').should('be.visible');
      });

    cy.get('tbody > tr')
      .last()
      .within(() => {
        cy.findAllByText('127.0.0.2').should('be.visible');
        cy.findAllByText('blocklist.lashback.com').should('be.visible');
        cy.findAllByText('2 months from now').should('be.visible');
        cy.findAllByText('Active').should('be.visible');
      });
  });

  it('sorted descending by date resolved', () => {
    cy.visit(PAGE_BASE_URL);

    cy.wait(['@getMonitors', '@getIncidents']);

    cy.findByText('Date Resolved').click();

    cy.get('tbody > tr')
      .first()
      .within(() => {
        cy.findAllByText('127.0.0.2').should('be.visible');
        cy.findAllByText('blocklist.lashback.com').should('be.visible');
        cy.findAllByText('2 months from now').should('be.visible');
        cy.findAllByText('Active').should('be.visible');
      });

    cy.get('tbody > tr')
      .last()
      .within(() => {
        cy.findAllByText('2.2.8').should('be.visible');
        cy.findAllByText('new.spam.dnsbl.sorbs.net').should('be.visible');
        cy.findAllByText('Sep 8 2019, 8:00pm').should('be.visible');
        cy.findAllByText('Active').should('be.visible');
      });
  });

  it('sorted ascending by date resolved', () => {
    cy.visit(PAGE_BASE_URL);

    cy.wait(['@getMonitors', '@getIncidents']);

    cy.findByText('Date Resolved').click();
    cy.findByText('Date Resolved').click();

    cy.get('tbody > tr')
      .first()
      .within(() => {
        cy.findAllByText('127.0.0.2').should('be.visible');
        cy.findAllByText('blocklist.lashback.com').should('be.visible');
        cy.findAllByText('2 months from now').should('be.visible');
        cy.findAllByText('Active').should('be.visible');
      });

    cy.get('tbody > tr')
      .last()
      .within(() => {
        cy.findAllByText('2.2.8').should('be.visible');
        cy.findAllByText('new.spam.dnsbl.sorbs.net').should('be.visible');
        cy.findAllByText('Sep 8 2019, 8:00pm').should('be.visible');
        cy.findAllByText('Active').should('be.visible');
      });
  });

  describe('with no monitors or incidents', () => {
    beforeEach(() => {
      cy.stubRequest({
        url: 'api/v1/blocklist-monitors',
        fixture: '200.get.no-results.json',
        requestAlias: 'getMonitors',
      });

      cy.stubRequest({
        url: 'api/v1/blocklist-monitors/incidents*',
        fixture: '200.get.no-results.json',
        requestAlias: 'getIncidents',
      });

      cy.visit(PAGE_BASE_URL);

      cy.wait(['@getMonitors', '@getIncidents']);
    });

    it('loads empty state page', () => {
      cy.url().should('include', PAGE_BASE_URL);
      cy.title().should('include', 'Blocklist Incidents');
      cy.findByText(
        'Keep an eye on your Domains and IPs and maintain a healthy sender reputation and improve your deliverability',
      ).should('be.visible');
    });

    it('loads add to watchlist form when call to action is clicked', () => {
      cy.findByText('Add to Monitored List').click();
      cy.url().should('include', '/signals/blocklist/monitors/add');
    });
  });
});
