import { PAGE_URL, FILTERS_URL, QUERY_FILTER, STABLE_UNIX_DATE } from './constants';
import {
  stubDeliverability,
  stubReports,
  stubTimeSeries,
  applySubaccountComparisons,
  applyDelayMetrics,
} from './helpers';

describe('the delay reason table', () => {
  beforeEach(() => {
    commonBeforeSteps(FILTERS_URL);
    cy.withinDrawer(() => {
      cy.findByLabelText('Targeted').uncheck({ force: true });
      cy.findByLabelText('Accepted').uncheck({ force: true });
      cy.findByLabelText('Bounces').uncheck({ force: true });
      cy.findByLabelText('Delayed').check({ force: true });
      cy.findByLabelText('Delivered 1st Attempt').check({ force: true });
      cy.findByLabelText('Delivered 2+ Attempts').check({ force: true });

      cy.findByRole('button', { name: 'Apply Metrics' }).click();
      cy.wait(['@getDeliverability', '@getTimeSeries']);
    });
  });

  it('renders the report chart and delay reason table depending on the selected tab', () => {
    cy.clock(STABLE_UNIX_DATE);
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/delay-reason/domain**/*',
      fixture: 'metrics/deliverability/delay-reason/domain/200.get.json',
      requestAlias: 'getDelayReasons',
    });

    cy.findByDataId('summary-chart').within(() => {
      cy.findByText('Delay Reason').click();
    });

    cy.findByDataId('summary-chart').within(() => cy.get('table').should('be.visible'));
    cy.wait(['@getDelayReasons', '@getDeliverability']).then(xhrs => {
      const [delayReasons, deliverabilityReq] = xhrs;
      cy.wrap(delayReasons.url).should('contain', `${QUERY_FILTER}`);
      cy.wrap(deliverabilityReq.url).should('contain', `${QUERY_FILTER}`);
    });

    cy.findByDataId('summary-chart').within(() => {
      cy.findByText('Report').click();
      cy.get('.recharts-wrapper').should('be.visible');
    });
  });

  it('renders with delay reason data', () => {
    cy.clock(STABLE_UNIX_DATE);
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/delay-reason/domain**/*',
      fixture: 'metrics/deliverability/delay-reason/domain/200.get.json',
      requestAlias: 'getDelayReasons',
    });
    cy.findByText('Delay Reason').click();

    cy.wait(['@getDelayReasons', '@getDeliverability']);

    cy.findByLabelText('Filter').should('be.visible');
    cy.get('tbody tr').within(() => {
      cy.get('td')
        .eq(0)
        .should('have.text', '10');

      cy.get('td')
        .eq(1)
        .should('have.text', '5 (< 0.01%)');

      cy.get('td')
        .eq(2)
        .should('have.text', 'A delay reason reason.');

      cy.get('td')
        .eq(3)
        .should('have.text', 'gmail.com');
    });
  });

  it('renders an empty state when no results are returned', () => {
    cy.clock(STABLE_UNIX_DATE);
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/delay-reason/domain**/*',
      fixture: 'blank.json',
      requestAlias: 'getDelayReasons',
    });
    cy.findByText('Delay Reason').click();

    cy.wait(['@getDelayReasons', '@getDeliverability']);

    cy.findByText('No delay reasons to report').should('be.visible');
  });
});

describe('the delay reason comparison (AKA compare by) tables', () => {
  /**
   * Re-usable function for verifying table UI for this particular tab on the page
   */
  function verifyDelayReasonsTable() {
    cy.get('table')
      .should('be.visible')
      .within(() => {
        cy.get('tbody tr')
          .eq(0)
          .within(() => {
            cy.get('td')
              .eq(0)
              .should('have.text', '10');
            cy.get('td')
              .eq(1)
              .should('have.text', '5 (0%)');
            cy.get('td')
              .eq(2)
              .should('have.text', 'A delay reason reason.');
            cy.get('td')
              .eq(3)
              .should('have.text', 'gmail.com');
          });
      });
  }

  it('renders additional tabs when comparisons are made', () => {
    commonBeforeSteps();
    applyDelayMetrics();
    applySubaccountComparisons();
    cy.wait(['@getDeliverability', '@getDeliverability', '@getTimeSeries', '@getTimeSeries']);

    cy.findByRole('tab', { name: 'Delay Reason Fake Subaccount 1 (ID 101)' }).should('be.visible');
    cy.findByRole('tab', { name: 'Delay Reason Fake Subaccount 2 (ID 102)' }).should('be.visible');

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/delay-reason/domain**/*',
      fixture: 'metrics/deliverability/delay-reason/domain/200.get.json',
      requestAlias: 'getDelayReasons',
    });
    cy.findByRole('tab', { name: 'Delay Reason Fake Subaccount 1 (ID 101)' }).click();
    cy.wait(['@getDeliverability', '@getDelayReasons']).then(xhrs => {
      const [deliverabilityReq, delayReasonsReq] = xhrs;

      cy.wrap(deliverabilityReq.url).should('include', 'subaccounts');
      cy.wrap(deliverabilityReq.url).should('include', '101');
      cy.wrap(delayReasonsReq.url).should('include', 'subaccounts');
      cy.wrap(delayReasonsReq.url).should('include', '101');
    });

    verifyDelayReasonsTable();
  });

  it('merges existing query filters with comparisons when making requests for delay reasons and aggregated metrics', () => {
    commonBeforeSteps();
    applyDelayMetrics();
    applySubaccountComparisons();
    cy.wait(['@getDeliverability', '@getTimeSeries']);

    // Apply an additional account filter
    cy.findByRole('button', { name: 'Add Filters' }).click();
    cy.findByLabelText('Type').select('Subaccount');
    cy.findByLabelText('Compare By').select('is equal to');
    cy.findByLabelText('Subaccount').type('Fake Subaccount 4');
    cy.wait('@getSubaccounts');
    cy.findByRole('option', { name: 'Fake Subaccount 4 (ID 104)' }).click();
    cy.findByRole('button', { name: 'Apply Filters' }).click();

    // Select the delay reason tab and verify the network request
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability**/*',
      fixture: 'metrics/deliverability/200.get.json',
      requestAlias: 'getDeliverabilityAgain',
    });
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/delay-reason/domain**/*',
      fixture: 'metrics/deliverability/delay-reason/domain/200.get.json',
      requestAlias: 'getDelayReasons',
    });
    cy.findByRole('tab', { name: 'Delay Reason Fake Subaccount 1 (ID 101)' }).click();

    cy.wait(['@getDelayReasons', '@getDeliverabilityAgain']).then(xhrs => {
      const [delayReasonsReq, deliverabilityReq] = xhrs;

      // Verify the subaccount filters that were already present are in the request
      cy.wrap(delayReasonsReq.url).should('include', '104');
      cy.wrap(deliverabilityReq.url).should('include', '104');

      // And then verify that the relevant subaccount comparison was converted to a filter and included as well
      cy.wrap(delayReasonsReq.url).should('include', '101');
      cy.wrap(deliverabilityReq.url).should('include', '101');
    });
  });

  it('renders an error when one or both API requests fail', () => {
    commonBeforeSteps();
    applyDelayMetrics();
    applySubaccountComparisons();
    cy.wait(['@getDeliverability', '@getTimeSeries']);

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability**/*',
      fixture: '400.json',
      statusCode: 400,
      requestAlias: 'getDeliverabilityFail',
    });

    cy.findByRole('tab', { name: 'Delay Reason Fake Subaccount 1 (ID 101)' }).click();
    cy.wait('@getDeliverabilityFail');
    cy.wait('@getDeliverabilityFail');
    cy.wait('@getDeliverabilityFail');
    cy.wait('@getDeliverabilityFail');

    cy.findByText('An error occurred').should('be.visible');
    cy.findByText('Sorry, there was an issue.').should('be.visible');

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/delay-reason/domain**/*',
      fixture: 'metrics/deliverability/delay-reason/domain/200.get.json',
      requestAlias: 'getDelayReasons',
    });
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability**/*',
      fixture: 'metrics/deliverability/200.get.json',
      requestAlias: 'getDeliverability',
    });
    cy.findByRole('button', { name: 'Try Again' }).click();
    cy.wait(['@getDelayReasons', '@getDeliverability']);

    verifyDelayReasonsTable();
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
  cy.wait(['@getDeliverability', '@getTimeSeries']);
  cy.findByRole('button', { name: 'Add Metrics' }).click();
}
