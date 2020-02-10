const PAGE_URL = '/signals/engagement/cohorts/sid/102';
const SPAM_HITS_API_URL = '/api/v1/signals/spam-hits/**/*';
const HEALTH_SCORE_API_URL = '/api/v1/signals/health-score/**/*';
const COHORT_ENGAGEMENT_API_URL = '/api/v1/signals/cohort-engagement/**/*';
const STABLE_UNIX_DATE = 1581087062000; // Stable unix timestamp (2/6/2020)

function stubEmptyState() {
  cy.stubRequest({
    url: SPAM_HITS_API_URL,
    fixture: 'signals/spam-hits/200.get.no-results.json',
    requestAlias: 'spamHitsRequest',
  });

  cy.stubRequest({
    url: HEALTH_SCORE_API_URL,
    fixture: 'signals/health-score/200.get.no-results.json',
    requestAlias: 'healthScoreRequest',
  });

  cy.stubRequest({
    url: COHORT_ENGAGEMENT_API_URL,
    fixture: 'signals/cohort-engagement/200.get.no-results.json',
    requestAlias: 'cohortEngagementRequest',
  });
}

describe('The engagement details page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });

    cy.stubRequest({
      url: SPAM_HITS_API_URL,
      fixture: 'signals/spam-hits/200.get.json',
      requestAlias: 'spamHitsRequest',
    });

    cy.stubRequest({
      url: HEALTH_SCORE_API_URL,
      fixture: 'signals/health-score/200.get.json',
      requestAlias: 'healthScoreRequest',
    });

    cy.stubRequest({
      url: COHORT_ENGAGEMENT_API_URL,
      fixture: 'signals/cohort-engagement/200.get.json',
      requestAlias: 'cohortEngagementRequest',
    });
  });

  it('has a relevant page title', () => {
    cy.visit(PAGE_URL);

    cy.title().should('include', 'Engagement Details | Engagement Recency | Signals Analytics');
    cy.get('main').within(() => cy.findByText('Engagement Recency').should('be.visible'));
  });

  it('renders with a link back to the dashboard page', () => {
    cy.visit(PAGE_URL);

    cy.findByText('Back to Engagement Recency Overview').should(
      'have.attr',
      'href',
      '/signals/engagement',
    );
  });

  it('renders tooltip content when hovering over the icon within the page heading', () => {
    cy.visit(PAGE_URL);

    cy.get('main').within(() => {
      cy.findByText('Engagement Recency')
        .closest('h1')
        .find('svg')
        .trigger('mouseover');
    });

    cy.findByText(
      'The share over time of your email that has been sent to recipients who most recently opened messages or clicked links during several defined time periods.',
    ).should('be.visible');
  });

  it('renders the empty state when no results are returned', () => {
    stubEmptyState();

    cy.visit(PAGE_URL);

    cy.queryByText('Recommendations').should('not.be.visible');
    cy.findAllByText('No Data Available').should('have.length', 3);
    cy.findAllByText('Insufficient data to populate this chart').should('have.length', 3);
  });

  it('renders with the current Subaccount ID', () => {
    cy.visit(PAGE_URL);

    cy.findByText('Subaccount 102').should('be.visible');
  });

  it('re-requests data when filtering by date', () => {
    cy.visit(PAGE_URL);

    stubEmptyState();

    cy.findByLabelText('Broad Date Range').select('Last 7 Days');

    cy.findAllByText('No Data Available').should('have.length', 3);
    cy.findAllByText('Insufficient data to populate this chart').should('have.length', 3);
  });

  describe('engagement data breakdown within tabs', () => {
    beforeEach(() => cy.clock(STABLE_UNIX_DATE));

    describe('the "Cohorts" tab', () => {
      const cohortsChartSelector = '[data-id="engagement-recency-cohorts-chart"]';

      it('renders a chart when clicked that renders a tooltip when clicked', () => {
        cy.visit(PAGE_URL);

        cy.findByText('Engagement Rate').click();
        cy.findByText('Cohorts').click();
        cy.url().should('include', '/engagement/cohorts');

        cy.get(cohortsChartSelector).within(() => {
          cy.findByText('New').should('be.visible');
          cy.findByText('Never Engaged').should('be.visible');
          cy.findByText('Not Recently Engaged').should('be.visible');
          cy.findByText('Semi Recently Engaged').should('be.visible');
          cy.findByText('Recently Engaged').should('be.visible');

          cy.get('.recharts-rectangle')
            .last()
            .click();

          // Not checking for *all* data in the tooltip, just checking that it is
          // showing properly. Ideally, unit tests can help check for this behavior
          cy.findByText('Never engaged, first email in last 7 days').should('be.visible');
        });
      });

      it('renders an empty state when no data is available', () => {
        cy.stubRequest({
          url: COHORT_ENGAGEMENT_API_URL,
          fixture: 'signals/cohort-engagement/200.get.no-results.json',
          requestAlias: 'cohortEngagementRequest',
        });

        cy.visit(PAGE_URL);

        cy.get(cohortsChartSelector).within(() => {
          cy.findByText('No Data Available').should('be.visible');
          cy.findByText('Insufficient data to populate this chart').should('be.visible');
        });

        cy.findByText('Recommendations').should('not.be.visible');
      });

      it('renders recommendations based on the returned data', () => {
        cy.visit(PAGE_URL);

        cy.findByText('Recommendations – Feb 6 2020').should('be.visible');
        cy.findByText('A large number of new recipients have yet to engage.').should('be.visible');
        cy.findByText(
          'This lack of engagement will have a negative impact on your reputation with mailbox providers. To reduce this, improve your email content and reevaluate your list acquisition practices.',
        ).should('be.visible');
      });

      it('renders an error when the server returns one', () => {
        cy.stubRequest({
          statusCode: 400,
          url: COHORT_ENGAGEMENT_API_URL,
          fixture: 'signals/cohort-engagement/400.get.json',
        });

        cy.visit(PAGE_URL);

        cy.get(cohortsChartSelector).within(() => {
          cy.findByText('Unable to Load Data').should('be.visible');
          cy.findByText('This is an error').should('be.visible');
        });
      });
    });

    describe('the "Engagement Rate" tab', () => {
      const engagementRateChartSelector = '[data-id="engagement-rate-chart"]';

      it('renders a chart when clicked that renders a tooltip when clicked', () => {
        cy.visit(PAGE_URL);

        cy.stubRequest({
          url: '/api/v1/signals/eng-cohort/**/*',
          fixture: 'signals/eng-cohort/200.get.json',
        });

        cy.findByText('Engagement Rate').click();

        cy.get(engagementRateChartSelector).within(() => {
          // `.findAll` used due to presence of tooltip that isn't properly hidden
          // in the DOM from Cypress. Use of `visibility: hidden;` would be recommended
          // or dynamically rendering the component instead of show/hide
          cy.findAllByText('New').should('be.visible');
          cy.findAllByText('Never Engaged').should('be.visible');
          cy.findAllByText('Not Recently Engaged').should('be.visible');
          cy.findAllByText('Semi Recently Engaged').should('be.visible');
          cy.findAllByText('Recently Engaged').should('be.visible');
          cy.get('.recharts-dot')
            .last()
            .click({ force: true }); // Overlapped by line chart, so `force` is necessary

          // Not checking for *all* data in the tooltip, just checking that it is
          // showing properly. Ideally, unit tests can help check for this behavior
          cy.findByText('Never engaged, first email in last 7 days').should('be.visible');
        });
      });

      it('renders an empty state when no data is available', () => {
        cy.visit(PAGE_URL);

        cy.stubRequest({
          url: '/api/v1/signals/eng-cohort/**/*',
          fixture: 'signals/eng-cohort/200.get.no-results.json',
        });

        cy.findByText('Engagement Rate').click();

        cy.get(engagementRateChartSelector).within(() => {
          cy.findByText('No Data Available').should('be.visible');
          cy.findByText('Insufficient data to populate this chart').should('be.visible');
        });
      });

      it('renders recommendations based on the returned data', () => {
        cy.visit(PAGE_URL);

        cy.stubRequest({
          url: '/api/v1/signals/eng-cohort/**/*',
          fixture: 'signals/eng-cohort/200.get.json',
        });

        cy.findByText('Engagement Rate').click();
        cy.findByText('Recommendations – Feb 4 2020').should('be.visible');
        cy.findByText(
          'An overall low engagement rate may indicate you emails are being sent to the spam folder. Drill into your Health Score to find the issue.',
        ).should('be.visible');
      });

      it('renders an error when the server returns one', () => {
        cy.visit(PAGE_URL);

        cy.stubRequest({
          statusCode: 400,
          url: '/api/v1/signals/eng-cohort/**/*',
          fixture: 'signals/eng-cohort/400.get.json',
        });

        cy.findByText('Engagement Rate').click();

        cy.get(engagementRateChartSelector).within(() => {
          cy.findByText('Unable to Load Data').should('be.visible');
          cy.findByText('This is an error').should('be.visible');
        });
      });
    });

    describe('the "Unsubscribe Rate" tab', () => {
      const unsubscribeRateChartSelector = '[data-id="unsubscribe-rate-chart"]';

      it('renders a chart when clicked that renders a tooltip when clicked', () => {
        cy.visit(PAGE_URL);

        cy.stubRequest({
          url: '/api/v1/signals/unsub-cohort/**/*',
          fixture: 'signals/unsub-cohort/200.get.json',
        });

        cy.findByText('Unsubscribe Rate').click();

        cy.get(unsubscribeRateChartSelector).within(() => {
          cy.findAllByText('New').should('be.visible');
          cy.findAllByText('Never Engaged').should('be.visible');
          cy.findAllByText('Not Recently Engaged').should('be.visible');
          cy.findAllByText('Semi Recently Engaged').should('be.visible');
          cy.findAllByText('Recently Engaged').should('be.visible');

          cy.get('.recharts-dot')
            .last()
            .click({ force: true });

          // Not checking for *all* data in the tooltip, just checking that it is
          // showing properly. Ideally, unit tests can help check for this behavior
          cy.findByText('Never engaged, first email in last 7 days').should('be.visible');
        });
      });

      it('renders an empty state when no data is available', () => {
        cy.visit(PAGE_URL);

        cy.stubRequest({
          url: '/api/v1/signals/unsub-cohort/**/*',
          fixture: 'signals/unsub-cohort/200.get.no-results.json',
        });

        cy.findByText('Unsubscribe Rate').click();

        cy.get(unsubscribeRateChartSelector).within(() => {
          cy.findByText('No Data Available').should('be.visible');
          cy.findByText('Insufficient data to populate this chart').should('be.visible');
        });
      });

      it('renders recommendations based on the returned data', () => {
        cy.visit(PAGE_URL);

        cy.stubRequest({
          url: '/api/v1/signals/unsub-cohort/**/*',
          fixture: 'signals/unsub-cohort/200.get.json',
        });

        cy.findByText('Unsubscribe Rate').click();

        cy.findByText('Recommendations – Feb 4 2020').should('be.visible');
        cy.findByText("Doesn't look like you have any unsubscribe issues. Great job!").should(
          'be.visible',
        );
      });

      it('renders an error when the server returns one', () => {
        cy.visit(PAGE_URL);

        cy.stubRequest({
          statusCode: 400,
          url: '/api/v1/signals/unsub-cohort/**/*',
          fixture: 'signals/unsub-cohort/400.get.json',
        });

        cy.findByText('Unsubscribe Rate').click();

        cy.get(unsubscribeRateChartSelector).within(() => {
          cy.findByText('Unable to Load Data').should('be.visible');
          cy.findByText('This is an error').should('be.visible');
        });
      });
    });

    // Having trouble figuring out where the data is coming from here...
    // describe('the "Complaint Rate" tab', () => {
    //   const complaintRateChartsSelector = '[data-id="complaint-rate-chart"]';

    //   beforeEach(() => cy.clock(STABLE_UNIX_DATE));

    //   it.only('renders a chart when clicked that renders a tooltip when clicked', () => {
    //     cy.visit(PAGE_URL);

    //     cy.stubRequest({
    //       url: '/api/v1/signals/fbl-cohort/**/*',
    //       fixture: 'signals/unsub-cohort/200.get.json',
    //     });

    //     cy.findByText('Complaint Rate').click();
    //   });

    //   it('renders an empty state when no data is available', () => {});

    //   it('renders recommendations based on the returned data', () => {});
    // });
  });

  it('renders with the "Spam Trap Monitoring" chart that links to the spam traps page', () => {
    cy.visit(PAGE_URL);

    cy.get('main').within(() => {
      cy.findByText('Spam Trap Monitoring')
        .should('be.visible')
        .closest('a')
        .should('have.attr', 'href', '/signals/spam-traps/sid/102');
    });
  });

  it('renders with the "Health Score" chart that links to the health score page', () => {
    cy.visit(PAGE_URL);

    cy.get('main').within(() => {
      cy.findByText('Health Score')
        .should('be.visible')
        .closest('a')
        .should('have.attr', 'href', '/signals/health-score/sid/102');
    });
  });
});
