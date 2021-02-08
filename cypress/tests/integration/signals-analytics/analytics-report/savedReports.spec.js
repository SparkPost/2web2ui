import { USERNAME } from 'cypress/constants';
import { PAGE_URL } from './constants';
import { commonBeforeSteps } from './helpers';

describe('Analytics Report Saved Reports', () => {
  beforeEach(() => {
    commonBeforeSteps();

    cy.stubRequest({
      url: `/api/v1/users/${USERNAME}`,
      fixture: 'users/200.get.metrics-rollup.json',
      requestAlias: 'userReq',
    });

    cy.stubRequest({
      url: '/api/v1/reports',
      fixture: '200.get.no-results',
      requestAlias: 'reportsReq',
    });

    cy.stubRequest({
      url: '/api/v1/billing/subscription',
      fixture: 'billing/subscription/200.get',
      requestAlias: 'billingSubscriptionReq',
    });
  });

  it('loads a preset report in addition to relevant query params', () => {
    cy.visit(`${PAGE_URL}&report=engagement`);
    cy.wait([
      '@userReq',
      '@reportsReq',
      '@billingSubscriptionReq',
      '@getTimeSeries',
      '@getDeliverability',
    ]);
    cy.findByLabelText('Report').should('have.value', 'Engagement Report');
    cy.findAllByText('Sent').should('be.visible');
    cy.findAllByText('Accepted').should('be.visible');
    cy.findAllByText('Clicks').should('be.visible');
    cy.findAllByText('Opens').should('be.visible');

    cy.visit(`${PAGE_URL}&report=engagement&filters=Campaign:Christmas`);
    cy.wait(['@userReq', '@reportsReq', '@billingSubscriptionReq']);
    cy.findAllByText('Sent').should('be.visible');
    cy.findAllByText('Accepted').should('be.visible');
    cy.findAllByText('Clicks').should('be.visible');
    cy.findAllByText('Opens').should('be.visible');
    // Additional params
    cy.findAllByText('Christmas').should('be.visible');

    cy.visit(
      `${PAGE_URL}&report=engagement&metrics%5B0%5D=count_policy_rejection&filters=Campaign:Christmas`,
    );
    cy.wait(['@userReq', '@reportsReq', '@billingSubscriptionReq']);
    // Additional params
    cy.findAllByText('Christmas').should('be.visible');
    cy.findAllByText('Policy Rejections').should('be.visible');
  });

  it('Selecting a preset report works correctly', () => {
    cy.visit(PAGE_URL);
    cy.wait('@reportsReq');

    cy.withinMainContent(() => {
      cy.findByLabelText('Report').type('engagement');
      cy.findByText('Engagement Report').should('be.visible');
      cy.findByText('Engagement Report').click({ force: true });
      cy.wait(['@getTimeSeries', '@getDeliverability']);

      cy.findAllByText('Sent').should('be.visible');
      cy.findAllByText('Accepted').should('be.visible');
      cy.findAllByText('Clicks').should('be.visible');
      cy.findAllByText('Opens').should('be.visible');
    });
  });

  it('Changing from a preset/initial report to a preset report keeps existing time range and filters', () => {
    cy.visit(PAGE_URL);
    const assertions = () => {
      cy.findByDataId('report-options').within(() => {
        cy.findByLabelText('Precision').should('have.value', 'day');
        cy.findByText('Filters').should('be.visible');
        cy.findByText('Campaign').should('be.visible');
        cy.findByText('is equal to').should('be.visible');
        cy.findByText('test-campaign').should('be.visible');
      });
      cy.url().should('include', 'range=7days');
    };

    //Add filters and change time range
    cy.findByRole('button', { name: 'Add Filters' }).click();

    cy.withinDrawer(() => {
      cy.stubRequest({
        url: '/api/v1/metrics/campaigns*',
        fixture: 'metrics/campaigns/200.get.json',
        requestAlias: 'getCampaigns',
      });
      cy.findByLabelText('Type').select('Campaign');
      cy.findByLabelText('Campaign').type('test');
      cy.wait('@getCampaigns');
      cy.findByText('test-campaign')
        .should('be.visible')
        .click();
      cy.findByText('Apply Filters').click();
    });

    cy.findByLabelText('Date Range').click();
    cy.findByText('Last 7 Days').click();
    cy.findByText('Apply').click();
    cy.findByLabelText('Precision').select('Day');

    cy.withinMainContent(() => {
      cy.wait(['@getUTCTimeSeries', '@getUTCDeliverability']);
      assertions();

      //Change to engagement report
      cy.findByLabelText('Report').type('Engagement');
      cy.findByText('Engagement Report').click({ force: true });
      assertions();
      cy.findAllByText('Sent').should('be.visible');

      //Change to summary report
      cy.findByLabelText('Report')
        .clear()
        .type('Summary');
      cy.findByText('Summary Report').click({ force: true });
      cy.wait(['@getUTCTimeSeries', '@getUTCDeliverability']);
      assertions();
      cy.findAllByText('Targeted').should('be.visible');
    });
  });

  it('saves a new report', () => {
    cy.stubRequest({
      method: 'POST',
      url: '/api/v1/reports',
      fixture: 'reports/200.post.json',
      requestAlias: 'saveNewReport',
    });

    cy.visit(PAGE_URL);

    cy.findByRole('button', { name: 'Save New Report' }).click();

    cy.withinModal(() => {
      cy.findByText('Save New Report').should('be.visible');

      // Check validation
      cy.findByRole('button', { name: 'Save Report' }).click();
      cy.findAllByText('Required').should('have.length', 1);

      cy.stubRequest({
        url: '/api/v1/reports',
        fixture: 'reports/200.get.new-report',
        requestAlias: 'newGetSavedReports',
      });

      // Check submission
      cy.findByLabelText('Name').type('Hello There');
      cy.findByLabelText('Description').type('General Kenobi');
      cy.findByLabelText('Allow others to edit report').check({ force: true });
      cy.findByRole('button', { name: 'Save Report' }).click();
    });
    cy.wait('@saveNewReport');
    cy.wait('@newGetSavedReports');
    cy.wait('@billingSubscriptionReq');

    cy.findByLabelText('Report').should('have.value', 'Hello There');

    cy.findByText('You have successfully saved Hello There').click();
  });

  it('removes report id if saving a new report using an existing report', () => {
    cy.visit(`${PAGE_URL}&report=d50d8475-d4e8-4df0-950f-b142f77df0bf`);
    cy.wait([
      '@userReq',
      '@reportsReq',
      '@billingSubscriptionReq',
      '@getTimeSeries',
      '@getDeliverability',
    ]);

    cy.findByRole('button', { name: 'Save New Report' }).click();

    cy.withinModal(() => {
      cy.findByText('Save New Report').should('be.visible');

      // Check validation
      cy.findByRole('button', { name: 'Save Report' }).click();

      cy.stubRequest({
        url: '/api/v1/reports',
        fixture: 'reports/200.get.new-report',
        requestAlias: 'newGetSavedReports',
      });

      cy.stubRequest({
        method: 'POST',
        url: '/api/v1/reports',
        fixture: 'reports/200.post.json',
        requestAlias: 'saveNewReport',
      });

      // Check submission
      cy.findByLabelText('Name').type('Hello There');
      cy.findByLabelText('Description').type('General Kenobi');
      cy.findByLabelText('Allow others to edit report').check({ force: true });
      cy.findByRole('button', { name: 'Save Report' }).click();
    });

    cy.wait('@saveNewReport').then(xhr => {
      cy.wrap(xhr.url).should('not.include', 'report=d50d8475-d4e8-4df0-950f-b142f77df0bf');
    });
  });

  describe('with saved reports', () => {
    beforeEach(() => {
      cy.stubRequest({
        url: '/api/v1/reports',
        fixture: 'reports/200.get',
        requestAlias: 'getSavedReports',
      });
    });

    it('loads saved reports', () => {
      cy.visit(PAGE_URL);
      cy.wait('@getSavedReports');
      cy.findByLabelText('Report').focus();

      cy.findListBoxByLabelText('Report').within(() => {
        cy.findByRole('option', { name: /My Bounce Report/g }).should('exist');
        cy.findByRole('option', { name: /My Other Bounce Report/g }).should('exist');
        cy.findByRole('option', { name: /Your Sending Report/g }).should('exist');
        cy.findByRole('option', { name: /My new report/g }).should('exist');
      });
    });

    it('loads a saved report', () => {
      const todaysDate = new Date();
      cy.visit(PAGE_URL);
      cy.wait('@getSavedReports');
      cy.findByLabelText('Report').focus(); // open typeahead

      cy.findListBoxByLabelText('Report').within(() => {
        cy.findByRole('option', { name: 'My Bounce Report mockuser' }).click();
      });

      cy.findByLabelText('Report').should('have.value', 'My Bounce Report');
      cy.findByLabelText('Time Zone').should(
        'have.value',
        `(UTC-0${todaysDate.getTimezoneOffset() / 60}:00) America/New York`, //calculation here is to adjust for the day light saving
      );
      cy.findByLabelText('Precision').should('have.value', 'hour');

      cy.get('[data-id="metric-tag"]').should('have.contain', 'Bounces');
    });

    it('should edit details of a saved report', () => {
      cy.visit(PAGE_URL);
      cy.wait('@getSavedReports');
      cy.findByLabelText('Report').focus(); // open typeahead

      cy.findByRole('button', { name: 'Edit Details' }).should('be.disabled');

      cy.findListBoxByLabelText('Report').within(() => {
        cy.findByRole('option', { name: 'My Bounce Report mockuser' }).click();
      });

      cy.findByRole('button', { name: 'Edit Details' }).click();
      cy.findByLabelText('Name').should('have.value', 'My Bounce Report');
      cy.findByLabelText('Description').should('have.value', 'Here is a description');
    });

    it('should save changes of a saved report', () => {
      cy.visit(PAGE_URL);
      cy.wait('@getSavedReports');
      cy.findByLabelText('Report').focus(); // open typeahead

      cy.findByRole('button', { name: 'Save Changes' }).should('be.disabled');

      cy.findListBoxByLabelText('Report').within(() => {
        cy.findByRole('option', { name: 'Comparison Report mockuser' }).click();
      });

      cy.findByRole('button', { name: 'Save Changes' }).click();
      cy.findByLabelText('Name').should('have.value', 'Comparison Report');
      cy.findByLabelText('Description').should('have.value', 'Here is a description');

      cy.withinModal(() => {
        cy.findByText('Bounces').should('be.visible');
        cy.findByText('Last 7 Days').should('be.visible');
        cy.findByText('Fake Subaccount 3 (ID 103)').should('be.visible');
        cy.findByText('Fake Subaccount 1 (ID 101)').should('be.visible');
      });
    });

    it('opens saved reports modal', () => {
      cy.visit(PAGE_URL);
      cy.wait('@getSavedReports');
      cy.findByRole('button', { name: 'View All Reports' }).click();

      cy.withinModal(() => {
        //Check that it only shows my reports
        cy.findByText('My Bounce Report').should('be.visible');
        cy.findByText('Your Sending Report').should('not.exist');
        //Check that it shows all reports
        cy.findByRole('tab', { name: 'All Reports' }).click();
        cy.findAllByText('My Bounce Report').should('have.length', 1); //For both tabs
        cy.findAllByText('My Bounce Report')
          .last()
          .should('be.visible');
        cy.findByText('Your Sending Report').should('be.visible');
        //Check preset reports
        cy.findByRole('cell', { name: 'Summary Report' })
          .scrollIntoView()
          .should('be.visible');
        cy.findByRole('cell', { name: 'Bounce Report' }).should('be.visible');
        cy.findByRole('cell', { name: 'Engagement Report' }).should('be.visible');
        cy.findByRole('cell', { name: 'Delayed Report' }).should('be.visible');
        cy.findByRole('cell', { name: 'Rejections Report' }).should('be.visible');
        cy.findByRole('cell', { name: 'Accepted Report' }).should('be.visible');
      });
    });

    it('opens scheduled reports modal', () => {
      cy.visit(PAGE_URL);
      cy.wait('@getSavedReports');
      cy.withinMainContent(() => {
        cy.findByLabelText('Report').type('engagement');
        cy.findByText('Engagement Report').click({ force: true });
      });

      cy.stubRequest({
        method: 'GET',
        url: '/api/v1/reports/engagement/schedules',
        fixture: 'reports/200.get.scheduled-reports',
      });

      cy.findByRole('button', { name: 'Schedule Report' }).click();
      cy.withinModal(() => {
        cy.findByText('Schedules For Reports').should('be.visible');
        cy.findByText('Engagement Report').should('be.visible');
        cy.findByText('My Scheduled Report').should('be.visible');
      });
    });

    it('pins a saved report with unique verbiage for first time save vs overriding save', () => {
      cy.visit(PAGE_URL);
      cy.findByRole('button', { name: 'View All Reports' }).click();

      // https://sparkpost.atlassian.net/browse/FE-1284
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(250);

      cy.withinModal(() => {
        cy.findByLabelText('pinned-to-dashboard').should('not.exist');

        cy.findByRole('tab', { name: 'All Reports' }).click();

        cy.findByLabelText('pinned-to-dashboard').should('not.exist');

        cy.get('table').within(() => {
          cy.findByText('My Bounce Report')
            .closest('tr')
            .within(() => {
              cy.get('td').should('have.length', 6);
              cy.findAllByText('Open Menu')
                .scrollIntoView()
                .click({ force: true });
              cy.findAllByText('Pin to Dashboard').should('be.visible');
            });
        });

        cy.findByRole('tab', { name: 'My Reports' }).click();

        cy.get('table').within(() => {
          cy.findByText('My Bounce Report')
            .closest('tr')
            .within(() => {
              cy.findAllByText('Open Menu').click({ force: true });
              cy.findAllByText('Pin to Dashboard')
                .scrollIntoView()
                .should('be.visible');
              cy.findAllByText('Pin to Dashboard').click({ force: true });
            });
        });
      });

      cy.withinModal(() => {
        cy.get('p').contains('My Bounce Report will be pinned to the Dashboard.');
        cy.findAllByText('Pin to Dashboard').should('be.visible');
      });

      cy.stubRequest({
        method: 'PUT',
        url: '/api/v1/users/mockuser',
        fixture: 'users/200.put.update-ui-options.json',
        requestAlias: 'updateUiOption',
      });

      cy.findByRole('button', { name: 'Pin to Dashboard' }).click();
      cy.wait('@updateUiOption');

      cy.withinSnackbar(() => {
        cy.findAllByText('Successfully pinned My Bounce Report to the Dashboard.').should(
          'be.visible',
        );
      });

      cy.findByRole('button', { name: 'View All Reports' }).click();

      // https://sparkpost.atlassian.net/browse/FE-1284
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(250);

      cy.withinModal(() => {
        cy.get('table').within(() => {
          cy.findByText('My Bounce Report')
            .closest('tr')
            .within(() => {
              cy.findByLabelText('pinned-to-dashboard').should('be.visible');

              cy.findByText('Open Menu').click({ force: true });
              cy.findByText('Pin to Dashboard')
                .scrollIntoView()
                .closest('button')
                .should('be.disabled');
            });

          cy.findByText('My Other Bounce Report')
            .closest('tr')
            .within(() => {
              cy.findAllByText('Open Menu').click({ force: true });
              cy.findAllByText('Pin to Dashboard')
                .scrollIntoView()
                .click({ force: true });
            });
        });
      });

      cy.withinModal(() => {
        cy.get('p').contains(
          'My Other Bounce Report will now replace My Bounce Report on the Dashboard.',
        );
      });
    });

    it('deletes a scheduled report', () => {
      cy.visit(PAGE_URL);
      cy.wait('@getSavedReports');
      cy.withinMainContent(() => {
        cy.findByLabelText('Report').type('engagement');
        cy.findByText('Engagement Report').click({ force: true });
      });

      cy.stubRequest({
        method: 'GET',
        url: '/api/v1/reports/**/schedules',
        fixture: 'reports/200.get.scheduled-reports',
      });
      cy.stubRequest({
        method: 'DELETE',
        url: '/api/v1/reports/**/schedules/**',
        fixture: 'blank.json',
        requestAlias: 'deleteScheduledReport',
      });

      cy.findByRole('button', { name: 'Schedule Report' }).click();
      cy.withinModal(() => {
        cy.findByText('My Scheduled Report').should('be.visible');
        // Wait required due to rendering bug with `TableCollection`
        // Should be removable once https://sparkpost.atlassian.net/browse/FE-1284 is resolved
        // eslint-disable-next-line
        cy.wait(500);
        cy.findByRole('button', { name: 'Open Menu' }).click({ force: true });

        cy.findByRole('button', { name: 'Delete' }).click({ force: true });
      });
      cy.withinModal(() => {
        cy.findByText('Are you sure you want to delete this scheduled report?').should(
          'be.visible',
        );
        cy.findByRole('button', { name: 'Delete' }).click({ force: true });
      });
      cy.wait('@billingSubscriptionReq');
      cy.wait('@deleteScheduledReport')
        .its('url')
        .should('include', '6d183f8b-8ea9-45e2-91de-235c30704bf9')
        .should('include', '854c22f4-ad01-43f9-8ef9-5c5cdba0a6ae');
    });

    it('deletes a saved report', () => {
      cy.visit(PAGE_URL);
      cy.wait('@getSavedReports');

      cy.findByLabelText('Report').focus(); // open typeahead

      cy.findListBoxByLabelText('Report').within(() => {
        cy.findByRole('option', { name: /My Bounce Report/g }).click();
      });

      cy.stubRequest({
        url: '/api/v1/reports',
        fixture: 'reports/200.get.deleted-report',
        requestAlias: 'newGetSavedReports',
      });

      cy.findByRole('button', { name: 'View All Reports' }).click();

      // https://sparkpost.atlassian.net/browse/FE-1284
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(250);

      cy.withinModal(() => {
        cy.get('table').within(() => {
          cy.findByText('My Bounce Report')
            .closest('tr')
            .within(() => {
              cy.findByRole('button', { name: 'Open Menu' }).click({ force: true }); // The content is visually hidden (intentionally!), so `force: true` is needed here
              cy.findByRole('button', { name: 'Delete' }).click({ force: true });
            });
        });
      });

      // https://sparkpost.atlassian.net/browse/FE-1284
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(250);

      cy.stubRequest({
        method: 'DELETE',
        url: '/api/v1/reports/d50d8475-d4e8-4df0-950f-b142f77df0bf',
        fixture: 'blank.json',
        requestAlias: 'deleteReport',
      });

      cy.withinModal(() => {
        cy.findByText('Delete').click({ force: true });
      });

      cy.wait('@deleteReport');
      cy.wait('@newGetSavedReports');

      cy.withinSnackbar(() => {
        cy.findByText('Successfully deleted My Bounce Report.').should('be.visible');
      });

      cy.findByLabelText('Report').focus(); // open typeahead

      cy.findByLabelText('Report').should('not.have.value', 'My Bounce Report');
      cy.findListBoxByLabelText('Report').within(() => {
        cy.findByRole('option', { name: /My Bounce Report/g }).should('not.exist');
      });
    });

    it('disabled creating new reports when limit is reached', () => {
      cy.stubRequest({
        method: 'POST',
        url: '/api/v1/reports',
        fixture: 'reports/200.post.json',
        requestAlias: 'saveNewReport',
      });

      cy.visit(PAGE_URL);
      cy.wait('@getSavedReports');
      cy.wait('@billingSubscriptionReq');

      cy.stubRequest({
        url: '/api/v1/billing/subscription',
        fixture: 'billing/subscription/200.get.reports-limited',
        requestAlias: 'getLimitedSubscription',
      });

      cy.findByRole('button', { name: 'Save New Report' })
        .should('not.be.disabled')
        .click();

      cy.withinModal(() => {
        cy.findByText('Save New Report').should('be.visible');

        // Check validation
        cy.findByRole('button', { name: 'Save Report' }).click();
        cy.findAllByText('Required').should('have.length', 1);

        cy.stubRequest({
          url: '/api/v1/reports',
          fixture: 'reports/200.get.new-report',
          requestAlias: 'newGetSavedReports',
        });

        // Check submission
        cy.findByLabelText('Name').type('Hello There');
        cy.findByLabelText('Description').type('General Kenobi');
        cy.findByLabelText('Allow others to edit report').check({ force: true });
        cy.findByRole('button', { name: 'Save Report' }).click();
      });

      cy.wait('@getLimitedSubscription');

      cy.findByRole('button', { name: 'Save New Report' }).should('be.disabled');
      cy.findByDataId('reports-limit-tooltip-icon').should('exist');

      cy.stubRequest({
        url: '/api/v1/billing/subscription',
        fixture: 'billing/subscription/200.get',
        requestAlias: 'newGetSubscription',
      });

      cy.stubRequest({
        url: '/api/v1/reports',
        fixture: 'reports/200.get.deleted-report',
        requestAlias: 'newGetSavedReports',
      });

      cy.findByRole('button', { name: 'View All Reports' }).click();

      // https://sparkpost.atlassian.net/browse/FE-1284
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(250);

      cy.withinModal(() => {
        cy.get('table').within(() => {
          cy.findByText('My Bounce Report')
            .closest('tr')
            .within(() => {
              cy.findByRole('button', { name: 'Open Menu' }).click({ force: true }); // The content is visually hidden (intentionally!), so `force: true` is needed here
              cy.findByRole('button', { name: 'Delete' }).click({ force: true });
            });
        });
      });
      cy.stubRequest({
        method: 'DELETE',
        url: '/api/v1/reports/d50d8475-d4e8-4df0-950f-b142f77df0bf',
        fixture: 'blank.json',
        requestAlias: 'deleteReport',
      });
      cy.withinModal(() => {
        cy.findByText('Delete').click({ force: true });
      });

      cy.wait('@newGetSubscription');
      cy.findByRole('button', { name: 'Save New Report' }).should('not.be.disabled');
      cy.findByDataId('reports-limit-tooltip-icon').should('not.exist');
    });
  });
});
