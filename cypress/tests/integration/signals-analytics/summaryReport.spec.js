import { IS_HIBANA_ENABLED } from 'cypress/constants';

const PAGE_URL = '/reports/summary';

describe('Summary Report page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });

    cy.stubRequest({
      method: 'GET',
      url: '/api/v1/metrics/**',
      fixture: 'metrics/200.get.metrics-filters.json',
      requestAlias: 'getMetricsFilterOptions',
    });

    cy.stubRequest({
      method: 'GET',
      url: '/api/v1/metrics/deliverability**/**',
      fixture: 'metrics/deliverability/200.get.json',
      requestAlias: 'dataGetDeliverability',
    });

    cy.stubRequest({
      method: 'GET',
      url: '/api/v1/metrics/deliverability/time-series**/**',
      fixture: 'metrics/deliverability/time-series/200.get.json',
      requestAlias: 'dataGetTimeSeries',
    });

    cy.stubRequest({
      method: 'GET',
      url: '/api/v1/metrics/deliverability/campaign**/**',
      fixture: 'metrics/deliverability/campaign/200.get.json',
      requestAlias: 'getDataCampaign',
    });

    cy.stubRequest({
      url: '/api/v1/subaccounts',
      fixture: 'subaccounts/200.get.json',
      requestAlias: 'getSubaccounts',
    });
  });

  // Skip these tests since the feature is entirely different for Hibana.
  // A separate spec file would probably do the trick for that feature.
  if (!IS_HIBANA_ENABLED) {
    it('handles changing the date range correctly', () => {
      const timestamp = 1580392800000; //01/30/2020 @ 2:00pm (UTC)
      const momentDateTime = Cypress.moment(timestamp);
      const now = momentDateTime.local().format('MMM Do YYYY h:mma');
      const getDatePickerText = startDateTime => `${startDateTime} – ${now}`; //Use this dash: '–' ¯\_(ツ)_/¯
      cy.clock(timestamp);
      cy.visit(PAGE_URL);

      const dayAgo = momentDateTime
        .subtract(1, 'day')
        .local()
        .format('MMM Do YYYY h:mma');
      cy.url().should('not.include', 'range=7days');
      cy.findByDataId('report-options').within(() => {
        cy.findByLabelText('Narrow Date Range').should('have.value', getDatePickerText(dayAgo));
        cy.findByLabelText('Broad Date Range').select('7days');
      });

      const sevenDaysAgo = momentDateTime
        .subtract(6, 'day')
        .local()
        .format('MMM Do YYYY h:mma');
      cy.url().should('include', 'range=7days');
      cy.findByDataId('report-options').within(() => {
        cy.findByLabelText('Narrow Date Range').should(
          'have.value',
          getDatePickerText(sevenDaysAgo),
        );
      });
    });

    it('handles applying filters correctly', () => {
      cy.visit(PAGE_URL);
      cy.findByDataId('report-options').within(() => {
        cy.findAllByLabelText('Reports Filter Typeahead')
          .first()
          .type('sparkpost');
        cy.wait('@getMetricsFilterOptions');
        cy.findByDataId('report-filters-dropdown').within(() => {
          cy.findByText('sparkpost-test')
            .should('be.visible')
            .closest('a')
            .click({ force: true });
        });
        cy.findByText('Campaign: sparkpost-test').should('be.visible');
      });
    });

    it('handles changing metrics correctly', () => {
      cy.visit(PAGE_URL);

      // Selected filters render in different spots based on Hibana vs. OG
      cy.findByDataId('summary-chart').within(() => {
        cy.findByText('Accepted').should('be.visible');
      });

      cy.findByText('Select Metrics').click();

      cy.withinModal(() => {
        cy.findByText('Select up to 5 metrics').should('be.visible');
        cy.findByLabelText('Accepted').uncheck({ force: true });
        cy.findByLabelText('Injected').check({ force: true });
        cy.findByText('Apply Metrics').click();
      });

      cy.findByDataId('summary-chart').within(() => {
        cy.findByText('Accepted').should('not.exist');
        cy.findByText('Injected').should('be.visible');
      });
    });

    it('Opens share modal correctly', () => {
      cy.visit(PAGE_URL);
      cy.findByText('Share').click();
      cy.findByText('Share this report').should('be.visible');
      cy.url().then(url => {
        cy.findByLabelText('Pin dates for this link').should('be.checked');
        //replace the current range with the word custom since the dates are pinned
        const editedUrl = url.replace(/range=.*?&/, 'range=custom&');
        cy.get('[name="copy-field"]').should('have.value', editedUrl);
      });
    });
  }
});
