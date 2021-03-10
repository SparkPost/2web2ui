import { PAGE_URL, FILTERS_URL, QUERY_FILTER, STABLE_UNIX_DATE } from './constants';
import {
  stubDeliverability,
  stubReports,
  stubTimeSeries,
  applySubaccountComparisons,
  applyBounceMetrics,
} from './helpers';

describe('the bounce reason table', () => {
  beforeEach(() => {
    commonBeforeSteps(FILTERS_URL);
    cy.withinDrawer(() => {
      // Uncheck defaults, and check a metric that renders the "Rejection Reason" table
      cy.findByLabelText('Targeted').uncheck({ force: true });
      cy.findByLabelText('Accepted').uncheck({ force: true });
      cy.findByLabelText('Bounces').uncheck({ force: true });
      cy.findByLabelText('Bounces').check({ force: true });
      cy.findByRole('button', { name: 'Apply Metrics' }).click();

      cy.wait(['@getDeliverability', '@getTimeSeries']);
    });
  });

  it('renders the report chart and bounce table depending on the selected tab', () => {
    cy.clock(STABLE_UNIX_DATE);

    cy.findByDataId('summary-chart').within(() => {
      cy.findByRole('tab', { name: 'Bounce Reason' }).click();
      cy.findByText('No bounce reasons to report').should('be.visible');
      cy.findByRole('tab', { name: 'Report' }).click();
      cy.get('.recharts-wrapper').should('be.visible');
    });
  });

  it('renders with bounce reason data', () => {
    cy.clock(STABLE_UNIX_DATE);
    stubDeliverability();
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/bounce-classification**/*',
      fixture: 'metrics/deliverability/bounce-classification/200.get.json',
      requestAlias: 'getBounceClassification',
    });
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/bounce-reason/domain**/*',
      fixture: 'metrics/deliverability/bounce-reason/domain/200.get.json',
      requestAlias: 'getBounceReason',
    });

    cy.findByRole('tab', { name: 'Bounce Reason' }).click();

    cy.wait(['@getDeliverability', '@getBounceClassification', '@getBounceReason']).then(xhrs => {
      const [deliverabilityReq, bounceClassReq, bounceReasonReq] = xhrs;
      cy.wrap(deliverabilityReq.url).should('contain', `${QUERY_FILTER}`);
      cy.wrap(bounceClassReq.url).should('contain', `${QUERY_FILTER}`);
      cy.wrap(bounceReasonReq.url).should('contain', `${QUERY_FILTER}`);
    });
    cy.get('tbody tr').within(() => {
      cy.get('td')
        .eq(0)
        .should('have.text', '17 (0%)');

      cy.get('td')
        .eq(1)
        .should('have.text', 'Mail Block');

      cy.get('td')
        .eq(2)
        .should('have.text', 'Block');

      cy.get('td')
        .eq(3)
        .should('have.text', 'This is the bounce reason. For real.');

      cy.get('td')
        .eq(4)
        .should('have.text', 'gmail.com');
    });
  });

  it('renders an empty state when no results are returned', () => {
    cy.findByRole('tab', { name: 'Bounce Reason' }).click();

    cy.findByLabelText('Filter').should('not.exist');
    cy.findByText('No bounce reasons to report').should('be.visible');
  });
});

describe('the bounce reason comparison (AKA compare by) tables', () => {
  /**
   * Re-usable function for verifying table UI for this particular tab on the page
   */
  function verifyBounceReasonsTable() {
    cy.get('table')
      .should('be.visible')
      .within(() => {
        cy.get('tbody tr')
          .eq(0)
          .within(() => {
            cy.get('td')
              .eq(0)
              .should('have.text', '17 (0%)');
            cy.get('td')
              .eq(1)
              .should('have.text', 'Mail Block');
            cy.get('td')
              .eq(2)
              .should('have.text', 'Block');
            cy.get('td')
              .eq(3)
              .should('have.text', 'This is the bounce reason. For real.');
            cy.get('td')
              .eq(4)
              .should('have.text', 'gmail.com');
          });
      });
  }

  it('renders additional tabs when comparisons are made', () => {
    commonBeforeSteps();
    applyBounceMetrics();
    applySubaccountComparisons();
    cy.wait(['@getDeliverability', '@getDeliverability', '@getTimeSeries', '@getTimeSeries']);

    cy.findByRole('tab', { name: 'Bounce Reason' }).should('not.exist');
    cy.findByRole('tab', { name: 'Bounce Reason Fake Subaccount 1 (ID 101)' }).should('be.visible');
    cy.findByRole('tab', { name: 'Bounce Reason Fake Subaccount 2 (ID 102)' }).should('be.visible');

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/bounce-reason/domain**/*',
      fixture: 'metrics/deliverability/bounce-reason/domain/200.get.json',
      requestAlias: 'getBounceReasons',
    });
    cy.findByRole('tab', { name: 'Bounce Reason Fake Subaccount 1 (ID 101)' }).click();
    cy.wait(['@getDeliverability', '@getBounceReasons']).then(xhrs => {
      const [deliverabilityReq, bounceReasonsReq] = xhrs;

      cy.wrap(deliverabilityReq.url).should('include', '101');
      cy.wrap(bounceReasonsReq.url).should('include', '101');
    });

    verifyBounceReasonsTable();
  });

  it('merges existing query filters with comparisons when making requests for bounce reasons and aggregated metrics', () => {
    commonBeforeSteps();
    applyBounceMetrics();
    applySubaccountComparisons();

    // Apply an additional subaccount filter
    cy.findByRole('button', { name: 'Add Filters' }).click();
    cy.findByLabelText('Type').select('Subaccount');
    cy.findByLabelText('Compare By').select('is equal to');
    cy.findByLabelText('Subaccount').type('Fake Subaccount 4');
    cy.wait('@getSubaccounts');
    cy.findByRole('option', { name: 'Fake Subaccount 4 (ID 104)' }).click();
    cy.findByRole('button', { name: 'Apply Filters' }).click();

    // Select the bounce reason tab and verify the network request
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability**/*',
      fixture: 'metrics/deliverability/200.get.json',
      requestAlias: 'getDeliverabilityAgain',
    });
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/bounce-reason/domain**/*',
      fixture: 'metrics/deliverability/bounce-reason/domain/200.get.json',
      requestAlias: 'getBounceReasons',
    });
    cy.findByRole('tab', { name: 'Bounce Reason Fake Subaccount 1 (ID 101)' }).click();

    cy.wait(['@getBounceReasons', '@getDeliverabilityAgain']).then(xhrs => {
      const [bounceReasonsReq, deliverabilityReq] = xhrs;

      // Verify the subaccount filters that were already present are in the request
      cy.wrap(bounceReasonsReq.url).should('include', '104');
      cy.wrap(deliverabilityReq.url).should('include', '104');

      // And then verify that the relevant subaccount comparison was converted to a filter and included as well
      cy.wrap(bounceReasonsReq.url).should('include', '101');
      cy.wrap(deliverabilityReq.url).should('include', '101');
    });
  });

  it('renders an error when one or both API requests fail', () => {
    commonBeforeSteps();
    applyBounceMetrics();
    applySubaccountComparisons();
    cy.wait(['@getDeliverability', '@getTimeSeries']);

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability**/*',
      fixture: '400.json',
      statusCode: 400,
      requestAlias: 'getDeliverabilityFail',
    });

    cy.findByRole('tab', { name: 'Bounce Reason Fake Subaccount 1 (ID 101)' }).click();
    cy.wait('@getDeliverabilityFail');
    cy.wait('@getDeliverabilityFail');
    cy.wait('@getDeliverabilityFail');
    cy.wait('@getDeliverabilityFail');

    cy.findByText('An error occurred').should('be.visible');
    cy.findByText('Sorry, there was an issue.').should('be.visible');

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/bounce-reason/domain**/*',
      fixture: 'metrics/deliverability/bounce-reason/domain/200.get.json',
      requestAlias: 'getBounceReasons',
    });
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability**/*',
      fixture: 'metrics/deliverability/200.get.json',
      requestAlias: 'getDeliverability',
    });
    cy.findByRole('button', { name: 'Try Again' }).click();
    cy.wait(['@getBounceReasons', '@getDeliverability']);

    verifyBounceReasonsTable();
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
