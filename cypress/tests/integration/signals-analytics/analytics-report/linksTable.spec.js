import { PAGE_URL, FILTERS_URL, QUERY_FILTER, STABLE_UNIX_DATE } from './constants';
import {
  stubDeliverability,
  stubReports,
  stubTimeSeries,
  applySubaccountComparisons,
  applyEngagementMetrics,
} from './helpers';

describe('the links table', () => {
  beforeEach(() => {
    commonBeforeSteps(FILTERS_URL);
    cy.withinDrawer(() => {
      cy.findByLabelText('Targeted').uncheck({ force: true });
      cy.findByLabelText('Accepted').uncheck({ force: true });
      cy.findByLabelText('Bounces').uncheck({ force: true });
      cy.findByLabelText('Clicks').check({ force: true });
      cy.findByLabelText('Unique Clicks').check({ force: true });
      cy.findByLabelText('Click-through Rate').check({ force: true });

      cy.findByRole('button', { name: 'Apply Metrics' }).click();
      cy.wait(['@getDeliverability', '@getTimeSeries']);
    });
  });

  it('renders the report chart and links table depending on the selected tab', () => {
    cy.clock(STABLE_UNIX_DATE);

    cy.findByDataId('summary-chart').within(() => {
      cy.findByRole('tab', { name: 'Links' }).click();
    });

    cy.findByDataId('summary-chart').within(() => cy.get('table').should('be.visible'));

    cy.findByDataId('summary-chart').within(() => {
      cy.findByRole('tab', { name: 'Report' }).click();
      cy.get('.recharts-wrapper').should('be.visible');
    });
  });

  it('renders with the links table data', () => {
    cy.clock(STABLE_UNIX_DATE);
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/link-name**/*',
      fixture: 'metrics/deliverability/link-name/200.get.json',
      requestAlias: 'getLinks',
    });
    cy.findByRole('tab', { name: 'Links' }).click();

    cy.wait(['@getLinks', '@getDeliverability']).then(xhrs => {
      const [linksReq, deliverabilityReq] = xhrs;
      cy.wrap(linksReq.url).should('contain', `${QUERY_FILTER}`);
      cy.wrap(deliverabilityReq.url).should('contain', `${QUERY_FILTER}`);
    });
    cy.findByLabelText('Filter').should('be.visible');
    cy.get('tbody tr')
      .eq(0)
      .within(() => {
        cy.get('td')
          .eq(0)
          .should('have.text', 'Mock Link 1');

        cy.get('td')
          .eq(1)
          .should('have.text', '10');

        cy.get('td')
          .eq(2)
          .should('have.text', '10');

        cy.get('td')
          .eq(3)
          .should('have.text', '0%');
      });

    cy.get('tbody tr')
      .eq(1)
      .within(() => {
        cy.get('td')
          .eq(0)
          .should('have.text', 'Mock Link 2');

        cy.get('td')
          .eq(1)
          .should('have.text', '20');

        cy.get('td')
          .eq(2)
          .should('have.text', '20');

        cy.get('td')
          .eq(3)
          .should('have.text', '0%');
      });

    cy.get('tbody tr')
      .eq(2)
      .within(() => {
        cy.get('td')
          .eq(0)
          .should('have.text', 'Mock Link 3');

        cy.get('td')
          .eq(1)
          .should('have.text', '30');

        cy.get('td')
          .eq(2)
          .should('have.text', '30');

        cy.get('td')
          .eq(3)
          .should('have.text', '0%');
      });

    cy.get('tbody tr')
      .eq(3)
      .within(() => {
        cy.get('td')
          .eq(0)
          .should('have.text', 'Mock Link 4');

        cy.get('td')
          .eq(1)
          .should('have.text', '40');

        cy.get('td')
          .eq(2)
          .should('have.text', '40');

        cy.get('td')
          .eq(3)
          .should('have.text', '0%');
      });
  });

  it('renders an empty state when no results are returned', () => {
    cy.clock(STABLE_UNIX_DATE);
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/link-name**/*',
      fixture: 'blank.json',
      requestAlias: 'getLinks',
    });
    cy.findByRole('tab', { name: 'Links' }).click();

    cy.wait(['@getLinks', '@getDeliverability']);

    cy.findByText('No links to report').should('be.visible');
  });
});

describe('the links comparison (AKA compare by) tables', () => {
  it('renders additional tabs when comparisons are enabled', () => {
    commonBeforeSteps();
    cy.wait(['@getDeliverability', '@getTimeSeries']);
    applyEngagementMetrics();
    applySubaccountComparisons();
    cy.wait(['@getDeliverability', '@getDeliverability', '@getTimeSeries', '@getTimeSeries']);

    cy.findByRole('tab', { name: 'Links' }).should('not.exist');
    cy.findByRole('tab', { name: 'Links Fake Subaccount 1 (ID 101)' }).should('be.visible');
    cy.findByRole('tab', { name: 'Links Fake Subaccount 2 (ID 102)' }).should('be.visible');

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/link-name**/*',
      fixture: 'metrics/deliverability/link-name/200.get.json',
      requestAlias: 'getEngagement',
    });
    cy.findByRole('tab', { name: 'Links Fake Subaccount 1 (ID 101)' }).click();
    cy.wait(['@getDeliverability', '@getEngagement']).then(xhrs => {
      const [deliverabilityReq, engagementReq] = xhrs;

      cy.wrap(deliverabilityReq.url).should('include', '101');
      cy.wrap(engagementReq.url).should('include', '101');
    });

    cy.get('table')
      .should('be.visible')
      .within(() => {
        cy.get('tbody tr')
          .eq(0)
          .within(() => {
            cy.get('td')
              .eq(0)
              .should('have.text', 'Mock Link 1');
            cy.get('td')
              .eq(1)
              .should('have.text', '10');
            cy.get('td')
              .eq(2)
              .should('have.text', '10');
            cy.get('td')
              .eq(3)
              .should('have.text', '0%');
          });
      });
  });

  it('merges existing query filters with comparisons when making requests for bounce reasons and aggregated metrics', () => {
    commonBeforeSteps();
    applyEngagementMetrics();
    applySubaccountComparisons();

    // Apply an additional subaccount filter
    cy.findByRole('button', { name: 'Add Filters' }).click();
    cy.findByLabelText('Type').select('Subaccount');
    cy.findByLabelText('Compare By').select('is equal to');
    cy.findByLabelText('Subaccount').type('Fake Subaccount 4');
    cy.wait('@getSubaccounts');
    cy.findByRole('option', { name: 'Fake Subaccount 4 (ID 104)' }).click();
    cy.findByRole('button', { name: 'Apply Filters' }).click();

    // Select the links tab and verify the network request
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability**/*',
      fixture: 'metrics/deliverability/200.get.json',
      requestAlias: 'getDeliverabilityAgain',
    });
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/link-name**/*',
      fixture: 'metrics/deliverability/link-name/200.get.json',
      requestAlias: 'getEngagement',
    });
    cy.findByRole('tab', { name: 'Links Fake Subaccount 1 (ID 101)' }).click();

    cy.wait(['@getDeliverabilityAgain', '@getEngagement']).then(xhrs => {
      const [deliverabilityReq, engagementReq] = xhrs;

      // Verify the subaccount filters that were already present are in the request
      cy.wrap(deliverabilityReq.url).should('include', '104');
      cy.wrap(engagementReq.url).should('include', '104');

      // And then verify that the relevant subaccount comparison was converted to a filter and included as well
      cy.wrap(deliverabilityReq.url).should('include', '101');
      cy.wrap(engagementReq.url).should('include', '101');
    });
  });

  it('renders an error when one or both API requests fail', () => {
    commonBeforeSteps();
    applyEngagementMetrics();
    applySubaccountComparisons();

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability**/*',
      fixture: '400.json',
      statusCode: 400,
      requestAlias: 'getDeliverabilityFail',
    });

    cy.findByRole('tab', { name: 'Links Fake Subaccount 1 (ID 101)' }).click();
    cy.wait('@getDeliverabilityFail');
    cy.wait('@getDeliverabilityFail');
    cy.wait('@getDeliverabilityFail');
    cy.wait('@getDeliverabilityFail');

    cy.findByText('An error occurred').should('be.visible');
    cy.findByText('Sorry, there was an issue.').should('be.visible');

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/link-name**/*',
      fixture: 'metrics/deliverability/link-name/200.get.json',
      requestAlias: 'getEngagement',
    });
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability**/*',
      fixture: 'metrics/deliverability/200.get.json',
      requestAlias: 'getDeliverability',
    });
    cy.findByRole('button', { name: 'Try Again' }).click();
    cy.wait(['@getEngagement', '@getDeliverability']);

    cy.get('table')
      .should('be.visible')
      .within(() => {
        cy.get('tbody tr')
          .eq(0)
          .within(() => {
            cy.get('td')
              .eq(0)
              .should('have.text', 'Mock Link 1');
            cy.get('td')
              .eq(1)
              .should('have.text', '10');
            cy.get('td')
              .eq(2)
              .should('have.text', '10');
            cy.get('td')
              .eq(3)
              .should('have.text', '0%');
          });
      });
  });
});

/**
 * A common series of actions that occur at the beginning of each test in the suite
 */
function commonBeforeSteps(path = PAGE_URL) {
  cy.stubAuth();
  cy.login({ isStubbed: true });
  cy.stubRequest({
    url: '/api/v1/subaccounts',
    fixture: '/subaccounts/200.get.json',
    requestAlias: 'getSubaccounts',
  });
  stubDeliverability();
  stubReports();
  stubTimeSeries();
  cy.visit(path);
  cy.findByRole('button', { name: 'Add Metrics' }).click();
}
