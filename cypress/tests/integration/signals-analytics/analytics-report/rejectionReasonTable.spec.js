import { PAGE_URL, FILTERS_URL, STABLE_UNIX_DATE } from './constants';
import {
  stubDeliverability,
  stubReports,
  stubTimeSeries,
  applySubaccountComparisons,
  applyRejectionMetrics,
} from './helpers';

describe('Analytics report rejection reason table', () => {
  beforeEach(() => {
    commonBeforeSteps(FILTERS_URL);
    cy.withinDrawer(() => {
      cy.findByLabelText('Targeted').uncheck({ force: true });
      cy.findByLabelText('Accepted').uncheck({ force: true });
      cy.findByLabelText('Bounces').uncheck({ force: true });
      cy.findByLabelText('Rejected').check({ force: true });
      cy.findByLabelText('Generation Rejections').check({ force: true });
      cy.findByLabelText('Generation Failures').check({ force: true });
      cy.findByLabelText('Policy Rejections').check({ force: true });
      cy.findByRole('button', { name: 'Apply Metrics' }).click();

      cy.wait(['@getDeliverability', '@getTimeSeries']);
    });
  });

  it('renders the report chart and rejected reason table depending on the selected tab', () => {
    cy.clock(STABLE_UNIX_DATE);

    cy.findByDataId('summary-chart').within(() => {
      cy.findByRole('tab', { name: 'Rejection Reason' }).click();
    });

    cy.findByDataId('summary-chart').within(() => cy.get('table').should('be.visible'));

    cy.findByDataId('summary-chart').within(() => {
      cy.findByRole('tab', { name: 'Report' }).click();
      cy.get('.recharts-wrapper').should('be.visible');
    });
  });

  it('renders with rejection reason data', () => {
    cy.clock(STABLE_UNIX_DATE);
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/rejection-reason/domain**/*',
      fixture: 'metrics/deliverability/rejection-reason/domain/200.get.json',
      requestAlias: 'getRejectionReasons',
    });
    cy.findByRole('tab', { name: 'Rejection Reason' }).click();

    cy.wait(['@getRejectionReasons', '@getDeliverability']);

    cy.findByLabelText('Filter').should('be.visible');

    cy.get('tbody tr').within(() => {
      cy.get('td')
        .eq(0)
        .should('have.text', '5');

      cy.get('td')
        .eq(1)
        .should('have.text', 'Policy Rejection');

      cy.get('td')
        .eq(2)
        .should('have.text', '550 - Connection frequency limited');

      cy.get('td')
        .eq(3)
        .should('have.text', 'gmail.com');
    });
  });

  it('renders an empty state when no results are returned', () => {
    cy.clock(STABLE_UNIX_DATE);
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/rejection-reason/domain**/*',
      fixture: 'blank.json',
      requestAlias: 'getRejectionReasons',
    });
    cy.findByRole('tab', { name: 'Rejection Reason' }).click();

    cy.wait(['@getRejectionReasons', '@getDeliverability']);

    cy.findByLabelText('Filter').should('not.exist');
    cy.findByText('No rejection reasons to report').should('be.visible');
  });
});

describe('the rejection reason comparison (AKA compare by) tables', () => {
  /**
   * Re-usable function for verifying table UI for this particular tab on the page
   */
  function verifyRejectionReasonsTable() {
    cy.get('table')
      .should('be.visible')
      .within(() => {
        cy.get('tbody tr')
          .eq(0)
          .within(() => {
            cy.get('td')
              .eq(0)
              .should('have.text', '5');
            cy.get('td')
              .eq(1)
              .should('have.text', 'Policy Rejection');
            cy.get('td')
              .eq(2)
              .should('have.text', '550 - Connection frequency limited');
            cy.get('td')
              .eq(3)
              .should('have.text', 'gmail.com');
          });
      });
  }

  it('renders additional tabs when comparisons are made', () => {
    commonBeforeSteps();
    applyRejectionMetrics();
    applySubaccountComparisons();
    cy.wait(['@getDeliverability', '@getTimeSeries']);

    cy.findByRole('tab', { name: 'Rejection Reason Fake Subaccount 1 (ID 101)' }).should(
      'be.visible',
    );
    cy.findByRole('tab', { name: 'Rejection Reason Fake Subaccount 2 (ID 102)' }).should(
      'be.visible',
    );

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/rejection-reason/domain**/*',
      fixture: 'metrics/deliverability/rejection-reason/domain/200.get.json',
      requestAlias: 'getRejectionReasons',
    });
    cy.findByRole('tab', { name: 'Rejection Reason Fake Subaccount 1 (ID 101)' }).click();
    cy.wait('@getRejectionReasons').then(xhr => {
      cy.wrap(xhr.url).should('include', 'subaccounts');
      cy.wrap(xhr.url).should('include', '101');
    });

    verifyRejectionReasonsTable();
  });

  it('merges existing query filters with comparisons when making requests for delay reasons and aggregated metrics', () => {
    commonBeforeSteps();
    applyRejectionMetrics();
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

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/rejection-reason/domain**/*',
      fixture: 'metrics/deliverability/rejection-reason/domain/200.get.json',
      requestAlias: 'getRejectionReasons',
    });
    cy.findByRole('tab', { name: 'Rejection Reason Fake Subaccount 1 (ID 101)' }).click();

    cy.wait('@getRejectionReasons').then(xhr => {
      // Verify the subaccount filters that were already present are in the request
      cy.wrap(xhr.url).should('include', '104');

      // And then verify that the relevant subaccount comparison was converted to a filter and included as well
      cy.wrap(xhr.url).should('include', '101');
    });
  });

  it('renders an error when one or both API requests fail', () => {
    commonBeforeSteps();
    applyRejectionMetrics();
    applySubaccountComparisons();
    cy.wait(['@getDeliverability', '@getTimeSeries']);

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/rejection-reason/domain**/*',
      statusCode: 400,
      fixture: '400.json',
      requestAlias: 'getRejectionReasonsFail',
    });

    cy.findByRole('tab', { name: 'Rejection Reason Fake Subaccount 1 (ID 101)' }).click();
    cy.wait('@getRejectionReasonsFail');
    cy.wait('@getRejectionReasonsFail');
    cy.wait('@getRejectionReasonsFail');
    cy.wait('@getRejectionReasonsFail');

    cy.findByText('An error occurred').should('be.visible');
    cy.findByText('Sorry, there was an issue.').should('be.visible');

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/rejection-reason/domain**/*',
      fixture: 'metrics/deliverability/rejection-reason/domain/200.get.json',
      requestAlias: 'getRejectionReasons',
    });
    cy.findByRole('button', { name: 'Try Again' }).click();
    cy.wait('@getRejectionReasons');

    verifyRejectionReasonsTable();
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
  stubReports();
  stubDeliverability();
  stubTimeSeries();
  cy.visit(path);
  cy.findByRole('button', { name: 'Add Metrics' }).click();
}
