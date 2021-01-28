import { PAGE_URL, FILTERS_URL, QUERY_FILTER, STABLE_UNIX_DATE } from './constants';
import { stubDeliverability, stubTimeSeries } from './helpers';

describe('Analytics Report report tabs', () => {
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
          .should('have.text', '0%');

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

  describe('the rejection reason table', () => {
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
                .should('have.text', '0%');
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
      cy.wait(['@getDeliverability', '@getTimeSeries']);

      cy.findByRole('tab', { name: 'Bounce Reason' }).should('not.exist');
      cy.findByRole('tab', { name: 'Bounce Reason Fake Subaccount 1 (ID 101)' }).should(
        'be.visible',
      );
      cy.findByRole('tab', { name: 'Bounce Reason Fake Subaccount 2 (ID 102)' }).should(
        'be.visible',
      );

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
      cy.wait(['@getDeliverability', '@getTimeSeries']);

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
      cy.wait(['@getDeliverability', '@getTimeSeries']);

      cy.findByRole('tab', { name: 'Delay Reason Fake Subaccount 1 (ID 101)' }).should(
        'be.visible',
      );
      cy.findByRole('tab', { name: 'Delay Reason Fake Subaccount 2 (ID 102)' }).should(
        'be.visible',
      );

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

  describe('the links comparison (AKA compare by) tables', () => {
    it('renders additional tabs when comparisons are enabled', () => {
      commonBeforeSteps();
      applyEngagementMetrics();
      applySubaccountComparisons();
      cy.wait(['@getDeliverability', '@getTimeSeries']);

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
});

/**
 * Applies two subaccount comparisons to the current report
 */
function applySubaccountComparisons() {
  cy.findByRole('button', { name: 'Add Comparison' }).click();
  cy.withinDrawer(() => {
    cy.findByLabelText('Type').select('Subaccount');
    cy.findAllByLabelText('Subaccount')
      .eq(0)
      .type('sub');
    cy.wait('@getSubaccounts');
    cy.findByRole('option', { name: 'Fake Subaccount 1 (ID 101)' }).click();
    cy.findAllByLabelText('Subaccount')
      .eq(1)
      .type('sub');
    cy.wait('@getSubaccounts');
    cy.findByRole('option', { name: 'Fake Subaccount 2 (ID 102)' }).click();
    cy.findByRole('button', { name: 'Compare' }).click();
  });
}

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
  stubTimeSeries();
  cy.visit(path);
  cy.findByRole('button', { name: 'Add Metrics' }).click();
}

/**
 * Applies bounce-related metrics to the current report
 */
function applyBounceMetrics() {
  cy.withinDrawer(() => {
    // Uncheck defaults, and check a metric that renders the "Bounce Reason" table
    cy.findByLabelText('Targeted').uncheck({ force: true });
    cy.findByLabelText('Accepted').uncheck({ force: true });
    cy.findByLabelText('Bounces').uncheck({ force: true });
    cy.findByLabelText('Sent').uncheck({ force: true });

    // Then check bounce-related metrics
    cy.findByLabelText('Bounces').check({ force: true });

    cy.findByRole('button', { name: 'Apply Metrics' }).click();
    cy.wait(['@getDeliverability', '@getTimeSeries']);
  });
}

/**
 * Applies delay-related metrics to the current report
 */
function applyDelayMetrics() {
  cy.withinDrawer(() => {
    // Uncheck defaults, and check a metric that renders the "Rejection Reason" table
    cy.findByLabelText('Targeted').uncheck({ force: true });
    cy.findByLabelText('Accepted').uncheck({ force: true });
    cy.findByLabelText('Bounces').uncheck({ force: true });
    cy.findByLabelText('Sent').uncheck({ force: true });

    // Then check delay-related metrics
    cy.findByLabelText('Accepted').check({ force: true });
    cy.findByLabelText('Delayed').check({ force: true });
    cy.findByLabelText('Delayed 1st Attempt').check({ force: true });

    cy.findByRole('button', { name: 'Apply Metrics' }).click();
    cy.wait(['@getDeliverability', '@getTimeSeries']);
  });
}

/**
 * Applies engagement-related metrics to the current report
 */
function applyEngagementMetrics() {
  cy.withinDrawer(() => {
    // Uncheck defaults, and check a metric that renders the "Links" table
    cy.findByLabelText('Targeted').uncheck({ force: true });
    cy.findByLabelText('Accepted').uncheck({ force: true });
    cy.findByLabelText('Bounces').uncheck({ force: true });
    cy.findByLabelText('Clicks').check({ force: true });
    cy.findByRole('button', { name: 'Apply Metrics' }).click();

    cy.wait(['@getDeliverability', '@getTimeSeries']);
  });
}

/**
 * Applies rejected-related metrics to the current report
 */
function applyRejectionMetrics() {
  cy.withinDrawer(() => {
    // Uncheck defaults, and check a metric that renders the "Rejection Reason" table
    cy.findByLabelText('Targeted').uncheck({ force: true });
    cy.findByLabelText('Accepted').uncheck({ force: true });
    cy.findByLabelText('Bounces').uncheck({ force: true });
    cy.findByLabelText('Sent').uncheck({ force: true });

    // Then check rejection-related metrics
    cy.findByLabelText('Rejected').check({ force: true });
    cy.findByLabelText('Policy Rejections').check({ force: true });
    cy.findByLabelText('Generation Failures').check({ force: true });
    cy.findByLabelText('Generation Rejections').check({ force: true });
    cy.findByLabelText('Rejection Rate').check({ force: true });

    cy.findByRole('button', { name: 'Apply Metrics' }).click();
    cy.wait(['@getDeliverability', '@getTimeSeries']);
  });
}
