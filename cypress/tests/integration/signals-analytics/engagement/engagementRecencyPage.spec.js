const PAGE_URL = '/signals/engagement';
const STABLE_UNIX_DATE = 1581087062000; // Stable unix timestamp (2/6/2020)

describe('The engagement recency page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });

    cy.stubRequest({
      url: '/api/v1/subaccounts',
      fixture: 'subaccounts/200.get.json',
    });

    cy.stubRequest({
      url: '/api/v1/signals/cohort-engagement/**/*',
      fixture: 'signals/cohort-engagement/200.get.json',
      requestAlias: 'getEngagementData',
    });
  });

  it('renders with a relevant page title', () => {
    cy.visit(PAGE_URL);

    cy.title().should('include', 'Engagement Recency | Signals Analytics');
    cy.get('main').within(() => cy.findByText('Engagement Recency').should('be.visible')); // Avoids grabbing the same content within the nav
  });

  it('renders an empty state when no data is returned', () => {
    cy.stubRequest({
      url: '/api/v1/signals/cohort-engagement/**/*',
      fixture: 'signals/cohort-engagement/200.get.no-results.json',
    });

    cy.visit(PAGE_URL);

    cy.findByText('No Data Available').should('be.visible');
  });

  it('renders an error when the server returns a bad response', () => {
    cy.stubRequest({
      statusCode: 400,
      url: '/api/v1/signals/cohort-engagement/**/*',
      fixture: 'signals/cohort-engagement/400.get.json',
    });

    cy.visit(PAGE_URL);

    cy.findByText('Unable to Load Data').should('be.visible');
  });

  it('re-requests data when filtering by "Broad Date Range"', () => {
    cy.clock(STABLE_UNIX_DATE);

    cy.visit(PAGE_URL);

    cy.wait('@getEngagementData');

    cy.clock(STABLE_UNIX_DATE);

    cy.stubRequest({
      url: '/api/v1/signals/cohort-engagement/**/*',
      fixture: 'signals/cohort-engagement/200.get.no-results.json',
      requestAlias: 'nextRequest',
    });

    cy.findByLabelText('Broad Date Range').select('Last 7 Days');

    cy.wait('@nextRequest')
      .its('url')
      .should('include', 'from=2020-01-30')
      .should('include', 'to=2020-02-06');

    cy.findByText('No Data Available').should('be.visible');
  });

  it('re-requests data when filtering by "Narrow Date Range"', () => {
    cy.visit(PAGE_URL);

    cy.wait('@getEngagementData')
      .its('url')
      .as('initialRequestURL');

    cy.stubRequest({
      url: '/api/v1/signals/cohort-engagement/**/*',
      fixture: 'signals/cohort-engagement/200.get.no-results.json',
      requestAlias: 'nextRequest',
    });

    cy.findByLabelText('Narrow Date Range').click();
    cy.findAllByRole('grid') // The datepicker UI uses the `grid` ARIA role
      .first()
      .within(() => {
        cy.findAllByText('1')
          .first()
          .click({ force: true });
        cy.findAllByText('8')
          .first()
          .click({ force: true });
      });
    cy.findByText('Apply').click();

    // See: https://docs.cypress.io/guides/core-concepts/variables-and-aliases.html#Closures
    cy.get('@initialRequestURL').then(initialValue => {
      cy.wait('@nextRequest')
        .its('url')
        .should('not.equal', initialValue);
    });

    cy.findByText('No Data Available').should('be.visible');
  });

  describe('the engagement recency table', () => {
    beforeEach(() => {
      cy.clock(STABLE_UNIX_DATE);
    });

    it('renders engagements in the table', () => {
      cy.visit(PAGE_URL);

      cy.wait('@getEngagementData');

      // First table row
      cy.findByText('Count').click();

      cy.get('tbody tr')
        .first()
        .within(() => {
          cy.findByText('Primary Account').should('be.visible');
          cy.get('.recharts-wrapper').should('be.visible');
          cy.findByText('-50%').should('be.visible');
          cy.findByText('5').should('be.visible');
          cy.findByText('12').should('be.visible');
        });

      cy.findByText('Ratio').click();

      cy.get('tbody tr')
        .first()
        .within(() => {
          // Value is calculated by dividing `"c_14d"` by the `"c_total"` for the latest entry in the data - a little tough to figure out!
          cy.findByText('50%').should('be.visible');
        });

      // Second table row
      cy.findByText('Count').click();

      cy.get('tbody tr')
        .last()
        .within(() => {
          cy.findByText('6257').should('be.visible');
          cy.findByText('No Data').should('be.visible');
          cy.findByText('- - -').should('be.visible');
          cy.findByText('50%').should('be.visible');
          cy.findByText('34').should('be.visible');
        });
    });

    it('updates the table by engagement count vs. engagement ratio when using the "Count" and "Ratio" buttons', () => {
      cy.visit(PAGE_URL);

      cy.findByText('Count').click();
      cy.get('table').within(() => cy.findByText('Current Count').should('be.visible'));

      cy.findByText('Ratio').click();
      cy.get('table').within(() => cy.findByText('Current Ratio').should('be.visible'));
    });

    describe('sorting behavior', () => {
      function clickTableHeaderCell(cellContent) {
        cy.get('table').within(() => cy.findByText(cellContent).click());
      }

      beforeEach(() => {
        cy.visit(PAGE_URL);

        cy.wait('@getEngagementData');

        cy.stubRequest({
          url: '/api/v1/signals/cohort-engagement/**/*',
          fixture: 'signals/cohort-engagement/200.get.no-results.json',
          requestAlias: 'nextCohortRequest',
        });
      });

      it('re-requests data when sorting by "Subaccount"', () => {
        clickTableHeaderCell('Subaccount');

        cy.wait('@nextCohortRequest').then(({ url }) => {
          cy.wrap(url).should('include', 'order=desc');
        });

        cy.findByText('No Data Available').should('be.visible');

        clickTableHeaderCell('Subaccount');

        cy.wait('@nextCohortRequest').then(({ url }) => {
          cy.wrap(url)
            .should('not.include', 'order=asc')
            .should('not.include', 'order=desc');
        });

        cy.findByText('No Data Available').should('be.visible');

        clickTableHeaderCell('Subaccount');

        cy.wait('@nextCohortRequest').then(({ url }) => {
          cy.wrap(url).should('include', 'order=asc');
        });

        cy.findByText('No Data Available').should('be.visible');
      });

      it('re-requests data when sorting by "Current Ratio"', () => {
        clickTableHeaderCell('Current Ratio');

        cy.wait('@nextCohortRequest').then(({ url }) => {
          cy.wrap(url)
            .should('include', 'order_by=perc')
            .should('include', 'order=asc');
        });

        cy.findByText('No Data Available').should('be.visible');

        clickTableHeaderCell('Current Ratio');

        cy.wait('@nextCohortRequest').then(({ url }) => {
          cy.wrap(url)
            .should('include', 'order_by=perc')
            .should('include', 'order=desc');
        });

        cy.findByText('No Data Available').should('be.visible');

        clickTableHeaderCell('Current Ratio');

        cy.wait('@nextCohortRequest').then(({ url }) => {
          cy.wrap(url)
            .should('not.include', 'order_by=perc')
            .should('not.include', 'order=desc')
            .should('not.include', 'order=asc');
        });
      });

      it('re-requests data when sorting by "Current Injections"', () => {
        clickTableHeaderCell('Current Injections');

        cy.wait('@nextCohortRequest').then(({ url }) => {
          cy.wrap(url)
            .should('include', 'order_by=c_total')
            .should('include', 'order=asc');
        });

        cy.findByText('No Data Available').should('be.visible');

        clickTableHeaderCell('Current Injections');

        cy.wait('@nextCohortRequest').then(({ url }) => {
          cy.wrap(url)
            .should('include', 'order_by=c_total')
            .should('include', 'order=desc');
        });

        cy.findByText('No Data Available').should('be.visible');

        clickTableHeaderCell('Current Injections');

        cy.wait('@nextCohortRequest').then(({ url }) => {
          cy.wrap(url)
            .should('not.include', 'order_by=c_total')
            .should('not.include', 'order=desc')
            .should('not.include', 'order=asc');
        });
      });
    });
  });
});
