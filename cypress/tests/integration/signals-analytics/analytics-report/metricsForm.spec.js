import { PAGE_URL, INBOX_METRICS } from './constants';
import { commonBeforeSteps } from './helpers';

describe('Metrics form', () => {
  describe('without d12y product', () => {
    beforeEach(() => {
      commonBeforeSteps();
    });

    it('should not render components related to deliverability without the feature flag', () => {
      cy.visit(PAGE_URL);
      cy.wait('@getSubscription');
      cy.findByLabelText('Break Down By')
        .scrollIntoView()
        .select('Recipient Domain', { force: true });
      cy.findByRole('button', { name: 'Data Sources' }).should('not.exist');
      openMetricsDrawer();
      cy.findByText('Deliverability Metrics').should('not.exist');
    });
  });

  describe('with d12y product', () => {
    beforeEach(() => {
      commonBeforeSteps();
      cy.stubRequest({
        url: '/api/v1/account',
        fixture: 'account/200.get.has-deliverability.json',
        requestAlias: 'getAccount',
      });
    });

    it('loads metrics form with banner', () => {
      cy.visit(PAGE_URL);
      cy.wait(['@getSubaccounts', '@getSubscription']);

      cy.findByLabelText('Break Down By')
        .scrollIntoView()
        .select('Recipient Domain', { force: true });
      cy.findByRole('button', { name: 'Data Sources' }).click();
      cy.findByRole('checkbox', { name: 'Panel' }).should('be.disabled');
      cy.findByRole('checkbox', { name: 'Seed List' }).should('be.disabled');
      cy.findByRole('checkbox', { name: 'Sending' }).should('not.be.disabled');
      cy.findByDataId('popover-content').within(() => {
        cy.findAllByRole('link', { name: 'Upgrade' })
          .should('have.length', 2)
          .should('be.visible');
      });

      openMetricsDrawer();
      cy.findByDataId('deliverability-metrics-banner').should('be.visible');

      cy.withinDrawer(() => {
        INBOX_METRICS.forEach(metric => {
          cy.findByLabelText(metric.name)
            .scrollIntoView()
            .should('be.disabled');
        });
      });
    });

    it('does not load banner if included in product', () => {
      cy.stubRequest({
        url: '/api/v1/billing/subscription',
        fixture: 'billing/subscription/200.get.include-deliverability.json',
        requestAlias: 'getBillingSubscription',
      });
      cy.visit(PAGE_URL);
      cy.wait(['@getSubaccounts', '@getBillingSubscription']);

      openMetricsDrawer();
      cy.findByDataId('deliverability-metrics-banner').should('not.exist');
      cy.withinDrawer(() => {
        INBOX_METRICS.forEach(metric => {
          cy.findByLabelText(metric.name)
            .scrollIntoView()
            .should('not.be.disabled');
        });
      });
    });

    it('allows the user to select data sources after adding deliverability metrics', () => {
      cy.stubRequest({
        url: '/api/v1/billing/subscription',
        fixture: 'billing/subscription/200.get.include-deliverability.json',
        requestAlias: 'getBillingSubscription',
      });
      cy.visit(PAGE_URL);
      cy.wait(['@getSubaccounts', '@getBillingSubscription']);

      openMetricsDrawer();
      cy.findByDataId('deliverability-metrics-banner').should('not.exist');
      cy.withinDrawer(() => {
        cy.findByLabelText('Inbox Folder Count')
          .scrollIntoView()
          .should('not.be.disabled')
          .check({ force: true });

        cy.findByRole('button', { name: 'Apply Metrics' }).click();
      });

      cy.wait(['@getTimeSeries', '@getDeliverability']);

      cy.stubRequest({
        url: '/api/v1/metrics/deliverability/watched-domain**/*',
        fixture: 'metrics/deliverability/watched-domain/200.get.json',
        requestAlias: 'getWatchedDomains',
      });

      cy.findByLabelText('Break Down By')
        .scrollIntoView()
        .select('Recipient Domain', { force: true });

      cy.wait('@getWatchedDomains');
      cy.findByRole('button', { name: 'Data Sources' }).click();
      cy.findByRole('checkbox', { name: 'Panel' }).click({ force: true });
      cy.wait('@getWatchedDomains').then(xhr => {
        cy.wrap(xhr.url)
          .should('include', 'count_inbox_panel')
          .should('not.include', 'count_inbox_seed');
      });
    });
  });
});

function openMetricsDrawer() {
  cy.findByRole('button', { name: 'Add Metrics' }).click();
}
