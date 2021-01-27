describe('Alerts Page - Create', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });

    cy.stubRequest({
      url: '/api/v1/sending-domains',
      fixture: 'sending-domains/200.get.json',
    });
    cy.stubRequest({
      url: '/api/v1/ip-pools',
      fixture: 'ip-pools/200.get.json',
    });
    cy.stubRequest({
      url: '/api/v1/sending-ips',
      fixture: 'sending-ips/200.get.json',
    });
    cy.stubRequest({
      url: '/api/v1/subaccounts',
      fixture: 'subaccounts/200.get.json',
    });

    cy.visit('/alerts/create');
  });

  it('Monthly Sending Limit metric has limit value and no filters', () => {
    cy.get('[name="metric"]').select('monthly_sending_limit');
    cy.findByText('Percent Used').should('be.visible');
    cy.findByLabelText('Percent Used').should('have.value', '80');
    cy.findByText('Filtered by').should('not.exist');
  });

  it('Health Score metric has evaluator, comparison, subaccount filter, & single facet filter', () => {
    cy.get('[name="metric"]').select('health_score');
    cy.findByText('Evaluated').should('be.visible');
    cy.findByText('Comparison').should('be.visible');
    cy.findByLabelText('Score').should('have.value', '80');
    cy.get('[data-id="alert-filters"]').within(() => {
      cy.findByText('Filtered by').should('be.visible');
      cy.findByText('Subaccounts').should('be.visible');
      cy.findByText('Facet').should('be.visible');
      cy.findByLabelText('Facet')
        .select('mailbox_provider')
        .should('have.value', 'mailbox_provider');
    });
  });

  it('Bounce Rate metric has subaccount filter, & multiple filters', () => {
    cy.get('[name="metric"]').select('block_bounce_rate');
    cy.findByLabelText('Bounce Percentage Above').should('have.value', '20');

    cy.get('[data-id="alert-filters"]').within(() => {
      cy.findByText('Filtered by').should('be.visible');
      cy.findByText('Subaccounts').should('be.visible');
      cy.findByText('Sending IP').should('be.visible');
      cy.findByText('Mailbox Provider').should('be.visible');
      cy.findByText('Sending Domain').should('be.visible');
    });
  });

  it('Injection count metric has evaluated value, & no filters', () => {
    cy.get('[name="metric"]').select('injection_count');
    cy.findByLabelText('Falls Below').should('have.value', '100000');
    cy.findByText('Filtered by').should('not.exist');
  });

  it('Blocklist metric has filters by blocklist and domains/IP', () => {
    cy.get('[name="metric"]').select('blocklist');

    cy.get('[data-id="alert-filters"]').within(() => {
      cy.findByText('Filtered by').should('be.visible');
      cy.findByText('Blocklists').should('be.visible');
      cy.findByText('Domains or IPs').should('be.visible');
    });
  });

  it('Subaccount Filters stops accepting more subaccounts when primary & all or any subaccount is selected', () => {
    cy.get('[name="metric"]').select('block_bounce_rate');

    cy.get('[data-id="alert-filters"]').within(() => {
      cy.findByLabelText('Subaccounts').type('subaccount');
      cy.findByText('Primary and all subaccounts').click({ force: true });
      cy.findByLabelText('Subaccounts').should('have.attr', 'readonly');
    });
  });

  it('Subaccount Filters stops accepting primary & all or any subaccount when another subaccount is selected', () => {
    cy.get('[name="metric"]').select('block_bounce_rate');

    cy.get('[data-id="alert-filters"]').within(() => {
      cy.findByLabelText('Subaccounts').type('subaccount');
      cy.findByText('Primary and all subaccounts').should('be.visible');

      cy.findByText('Fake Subaccount 1 (101)').click({ force: true });
      cy.findByText('Primary and all subaccounts').should('not.exist');
      cy.findByText('Primary account').should('be.visible');
    });
  });

  describe('New Alert Submission', () => {
    it('should validate that all required fields are present', () => {
      cy.get('[name="metric"]').select('block_bounce_rate');
      cy.get('button')
        .contains('Create Alert')
        .click();

      cy.findByText('Required').should('be.visible');
      cy.findByText('At least one notification channel must be not empty').should('be.visible');
    });

    it('should show error message when alert creation fails', () => {
      cy.stubRequest({
        method: 'POST',
        statusCode: 400,
        url: '/api/v1/alerts',
        fixture: 'alerts/400.post.json',
        requestAlias: 'postNewAlert',
      });

      cy.get('[name="metric"]').select('block_bounce_rate');
      cy.get('[name="name"]').type('My Alert');
      cy.get('[name="emails"]').type('sparkky@sparkpost.io', { force: true });
      cy.get('button')
        .contains('Create Alert')
        .click();

      cy.wait('@postNewAlert');
      cy.findAllByText('Something went wrong.').should('be.visible');
    });

    // 🥐 This test times out frequently and breaks our build
    // see, https://travis-ci.org/github/SparkPost/2web2ui/jobs/664865807
    /* eslint-disable jest/no-disabled-tests */
    it.skip('handles alert creation successfully and redirect to details afterwards', () => {
      cy.stubRequest({
        method: 'POST',
        url: '/api/v1/alerts',
        fixture: 'alerts/200.post.json',
        requestAlias: 'postNewAlert',
      });
      cy.stubRequest({
        url: '/api/v1/alerts/101',
        fixture: 'alerts/single/200.get.json',
        requestAlias: 'getNewAlert',
      });

      cy.stubRequest({
        url: '/api/v1/alerts/**/incidents',
        fixture: 'alerts/incidents/200.get.empty.json',
        requestAlias: 'getAlertIncidents',
      });

      cy.get('[name="metric"]').select('block_bounce_rate');
      cy.get('[name="name"]').type('My Alert');
      cy.get('[name="emails"]').type('sparkky@sparkpost.io', { force: true });
      cy.get('[data-id="alert-filters"]').within(() => {
        cy.findByLabelText('Subaccounts').type('subaccount');
        cy.findByText('Fake Subaccount 1 (101)').click({ force: true });
        cy.findByLabelText('Mailbox Provider').type('Gmail');
        cy.findByText('Gmail').click({ force: true });
        cy.findByText('Apple').click({ force: true });
      });

      cy.get('button')
        .contains('Create Alert')
        .click();

      cy.wait(['@postNewAlert', '@getNewAlert', '@getAlertIncidents']).then(xhrs => {
        const [postRequest] = xhrs;
        const { requestBody } = postRequest;

        const expectedRequestBody = {
          name: 'My Alert',
          metric: 'block_bounce_rate',
          subaccounts: [101],
          muted: false,
          filters: [{ filter_type: 'mailbox_provider', filter_values: ['gmail', 'apple'] }],
          threshold_evaluator: { operator: 'gt', source: 'raw', value: 20 },
          channels: { emails: ['sparkky@sparkpost.io'] },
        };

        cy.wrap(JSON.stringify(requestBody)).should('equal', JSON.stringify(expectedRequestBody));
      });
      cy.url().should('include', '/alerts/details/101');
      cy.findByText('Alert created').should('be.visible');
    });
    /* eslint-enable jest/no-disabled-tests */
  });
});
