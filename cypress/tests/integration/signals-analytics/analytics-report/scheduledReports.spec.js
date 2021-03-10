import { commonBeforeSteps } from './helpers';

//Copied from src/pages/reportBuilder/helpers/scheduledReports
//Can't directly import from file due to some babel/webpack error.
const recipientUserToString = user => (user ? `${user.name} <${user.email}>` : '');

describe('Analytics Report scheduled reports feature', () => {
  beforeEach(() => {
    commonBeforeSteps();

    cy.stubRequest({
      url: `/api/v1/users`,
      fixture: 'users/200.get.list-multiple',
    });

    cy.stubRequest({
      url: '/api/v1/reports',
      fixture: '200.get.no-results',
    });

    cy.stubRequest({
      url: '/api/v1/reports/*',
      fixture: 'reports/single/200.get',
    });

    cy.stubRequest({
      url: '/api/v1/billing/subscription',
      fixture: 'billing/subscription/200.get',
    });

    cy.stubRequest({
      method: 'POST',
      url: 'api/v1/reports/**/schedules',
      fixture: 'blank',
      requestAlias: 'createNewScheduledReport',
      //This could cause CI tests to fail.
      //If this is flaky, delete this and the check for submit button being disabled after submit
      delay: 500,
    });

    cy.stubRequest({
      method: 'GET',
      url: 'api/v1/reports/**/schedules/**',
      fixture: 'reports/single/200.get.scheduled-report',
      requestAlias: 'getScheduledReport',
    });

    cy.stubRequest({
      method: 'PUT',
      url: 'api/v1/reports/**/schedules/**',
      fixture: 'blank',
      requestAlias: 'updateScheduledReport',
      //This could cause CI tests to fail.
      //If this is flaky, delete this and the check for submit button being disabled after submit
      delay: 500,
    });

    cy.stubRequest({
      method: 'DELETE',
      url: 'api/v1/reports/**/schedules/**',
      fixture: 'blank',
      requestAlias: 'deleteScheduledReport',
    });

    cy.stubRequest({
      method: 'POST',
      url: 'api/v1/reports/**/schedules/test',
      fixture: 'blank',
      requestAlias: 'testSendScheduledReport',
    });
  });

  it('Handles field validation on create correctly', () => {
    cy.visit('/signals/schedule/foo');

    cy.findByRole('button', { name: 'Schedule Report' }).should('be.disabled');

    cy.findByLabelText('Scheduled Report Name')
      .focus()
      .blur();
    cy.findAllByText('Required').should('have.length', 1);
    cy.findByLabelText('Scheduled Report Name').type('My First Report');

    cy.findByLabelText('Email Subject')
      .focus()
      .blur();
    cy.findByLabelText('Email Subject').type('Free Macbook');
    cy.findAllByText('Required').should('have.length', 1);

    //Selects a recipient, then erases that recipient using backspace, then blurs to trigger validation
    cy.findByLabelText('Send To').focus();
    cy.findByText(
      recipientUserToString({
        name: 'mockuser',
        email: 'mockuser@example.com',
      }),
    ).click();
    cy.findByLabelText('Send To').type('{backspace}');
    cy.findByLabelText('Send To').blur();
    cy.findByText('At least 1 recipient must be selected').should('be.visible');
    cy.findByLabelText('Send To').focus();
    cy.findByText(
      recipientUserToString({
        name: 'mockuser',
        email: 'mockuser@example.com',
      }),
    ).click();

    cy.findByLabelText('Time')
      .focus()
      .blur();
    cy.findAllByText('Required').should('have.length', 1);
    cy.findByLabelText('Time')
      .type('Lunchtime')
      .blur();
    cy.findByText('Invalid time format, should be hh:mm 12 hour format').should('be.visible');
    cy.findByLabelText('Time')
      .focus()
      .clear()
      .type('12:00')
      .blur();

    cy.findByRole('button', { name: 'Schedule Report' }).should('not.be.disabled');
  });

  it('Populates fields properly to edit scheduled report', () => {
    cy.visit('/signals/schedule/foo/bar');
    cy.wait('@getScheduledReport');

    cy.findByLabelText('Scheduled Report Name').should('have.value', 'My Scheduled Report');
    cy.findByLabelText('Email Subject').should('have.value', 'This is a subject line');
    cy.findByText(
      recipientUserToString({
        name: 'mockuser',
        email: 'mockuser@example.com',
      }),
    ).should('be.visible');
    cy.findByLabelText('Weekly').should('be.checked');
    cy.findByLabelText('Week').should('be.disabled');
    cy.findByLabelText('Day').should('have.value', 'fri');
    cy.findByLabelText('Time Zone').should('contain.value', 'America/New York');
  });

  it('Only allows updating details when relevant fields have been updated', () => {
    cy.visit('/signals/schedule/foo/bar');
    cy.wait('@getScheduledReport');

    cy.findByRole('button', { name: 'Update Details' }).should('be.disabled');

    cy.findByLabelText('Monthly').check({ force: true });
    cy.findByRole('button', { name: 'Update Details' }).should('be.disabled');

    cy.findByLabelText('Scheduled Report Name').type('foo');
    cy.findByRole('button', { name: 'Update Details' }).should('not.be.disabled');
  });

  it('Only allows updating timing when relevant fields have been updated', () => {
    cy.visit('/signals/schedule/foo/bar');
    cy.wait('@getScheduledReport');

    cy.findByRole('button', { name: 'Update Timing' }).should('be.disabled');

    cy.findByLabelText('Scheduled Report Name').type('foo');
    cy.findByRole('button', { name: 'Update Timing' }).should('be.disabled');

    cy.findByLabelText('Monthly').check({ force: true });
    cy.findByRole('button', { name: 'Update Timing' }).should('not.be.disabled');
  });

  it('Can send a test report', () => {
    cy.visit('/signals/schedule/foo');

    //Needs .first() because there is also a send test button within the modal
    cy.findAllByRole('button', { name: 'Send Test' })
      .first()
      .click();
    cy.withinModal(() => {
      cy.findByLabelText('Send To').focus();
      cy.findByText(
        recipientUserToString({
          name: 'mockuser',
          email: 'mockuser@example.com',
        }),
      ).click();
      cy.findByRole('button', { name: 'Send Test' }).click();
    });
    //Checks that test report does not send when name and subject fields are not populated
    cy.findByText(
      'Please fill out "Scheduled Report Name" and "Email Subject" before sending test',
    ).should('be.visible');
    cy.findAllByText('Required').should('have.length', 2);

    cy.findByLabelText('Scheduled Report Name').type('My Scheduled Report');
    cy.findByLabelText('Email Subject').type('This is a subject line');
    cy.findAllByRole('button', { name: 'Send Test' })
      .first()
      .click();
    cy.withinModal(() => {
      cy.findByRole('button', { name: 'Send Test' }).click();
    });
    cy.wait('@testSendScheduledReport')
      .its('requestBody')
      .should('deep.equal', {
        name: 'My Scheduled Report',
        recipients: ['mockuser'],
        subject: 'This is a subject line',
      });
    cy.findByText('Successfully sent test report').should('be.visible');
  });

  it('Submits form properly for creating a scheduled report', () => {
    cy.visit('/signals/schedule/foo');
    cy.stubRequest({
      url: 'https://api.analytics.sparkpost.com/v1/t',
      method: 'POST',
      requestAlias: 'analyticsPost',
      fixture: 'blank.json',
    });

    cy.findByLabelText('Scheduled Report Name').type('My First Report');
    cy.findByLabelText('Email Subject').type('Free Macbook');
    cy.findByLabelText('Send To').focus();
    cy.findByText(
      recipientUserToString({
        name: 'mockuser',
        email: 'mockuser@example.com',
      }),
    ).click();
    cy.findByLabelText('Time')
      .focus()
      .clear()
      .type('12:00');
    cy.findByLabelText('Time Zone')
      .focus()
      .clear()
      .type('UTC');
    cy.findByRole('option', { name: 'UTC' }).click({ force: true });
    cy.findByRole('button', { name: 'Schedule Report' }).click();
    cy.findByRole('button', { name: 'Schedule Report' }).should('be.disabled');
    cy.findByRole('button', { name: 'Cancel' }).should('be.disabled');
    cy.wait('@createNewScheduledReport');
    cy.wait('@analyticsPost').then(xhr => {
      const { event, properties } = xhr.request.body;
      cy.wrap(event).should('eq', 'Created Scheduled Report');
      cy.wrap(properties).should('deep.equal', {
        metrics: 'count_bounce',
        recipients: 1,
        schedule_type: 'daily',
      });
    });
    cy.get('@createNewScheduledReport')
      .its('requestBody')
      .should('deep.equal', {
        name: 'My First Report',
        recipients: ['mockuser'],
        schedule: {
          day_of_month: '?',
          day_of_week: '*',
          hour: 0,
          minute: 0,
          month: '*',
          second: 0,
        },
        schedule_type: 'daily',
        subject: 'Free Macbook',
        timezone: 'UTC',
      });
    cy.url().should('include', '/signals/analytics');
    cy.findByText('Successfully scheduled My First Report for report: My Bounce Report').should(
      'be.visible',
    );
  });

  const fillOutForm = () => {
    cy.findByLabelText('Scheduled Report Name')
      .clear()
      .type('My Second Report');
    cy.findByLabelText('Email Subject')
      .clear()
      .type('Free Macbook Offer Expired');
    cy.findByLabelText('Send To').click();

    cy.findByText(
      recipientUserToString({
        name: 'whoami',
        email: 'fakeuser@example.com',
      }),
    ).click();
    cy.findByLabelText('Monthly').check({ force: true });
    cy.findByLabelText('Time')
      .focus()
      .clear()
      .type('8:15');
    cy.findByLabelText('Week').select('l');
    cy.findByLabelText('Day').select('mon');
    cy.findByLabelText('Time Zone')
      .focus()
      .clear()
      .type('UTC');
    cy.findByRole('option', { name: 'UTC' }).click({ force: true });
  };

  it('Updates details section properly', () => {
    cy.visit('/signals/schedule/foo/bar');
    cy.wait('@getScheduledReport');

    fillOutForm();
    cy.findByRole('button', { name: 'Update Details' }).click();
    cy.findByRole('button', { name: 'Update Details' }).should('be.disabled');
    //This checks a previous bug where the default values were getting set on submit
    cy.findByLabelText('Scheduled Report Name').should('not.have.value', 'My Scheduled Report');

    cy.findAllByRole('button', { name: 'Cancel' })
      .first()
      .should('be.disabled');
    //Check that schedule and timezone does not change.
    cy.wait('@updateScheduledReport')
      .its('requestBody')
      .should('deep.equal', {
        name: 'My Second Report',
        recipients: ['mockuser', 'fakeuser'],
        schedule: {
          hour: 0,
          month: '*',
          day_of_month: '?',
          minute: 0,
          second: 0,
          day_of_week: 'fri',
        },
        schedule_type: 'weekly',
        subject: 'Free Macbook Offer Expired',
        timezone: 'America/New_York',
      });
    cy.url().should('include', '/signals/analytics');
    cy.findByText('Successfully updated My Second Report for report: My Bounce Report').should(
      'be.visible',
    );
  });

  it('Updates timing section properly', () => {
    cy.visit('/signals/schedule/foo/bar');
    cy.wait('@getScheduledReport');

    fillOutForm();
    cy.findByRole('button', { name: 'Update Timing' }).click();
    cy.findByRole('button', { name: 'Update Timing' }).should('be.disabled');
    cy.findAllByRole('button', { name: 'Cancel' })
      .last()
      .should('be.disabled');
    //Check that name, recipients and timezone subject not change.
    cy.wait('@updateScheduledReport')
      .its('requestBody')
      .should('deep.equal', {
        name: 'My Scheduled Report',
        recipients: ['mockuser'],
        schedule: {
          hour: 8,
          month: '*',
          day_of_month: '?',
          minute: 15,
          second: 0,
          day_of_week: 'monl',
        },
        schedule_type: 'monthly',
        subject: 'This is a subject line',
        timezone: 'UTC',
      });
    cy.url().should('include', '/signals/analytics');
    cy.findByText('Successfully updated My Scheduled Report for report: My Bounce Report').should(
      'be.visible',
    );
  });

  it('Deletes existing scheduled report', () => {
    cy.visit('/signals/schedule/foo/bar');
    cy.wait('@getScheduledReport');
    cy.findByRole('button', { name: 'Delete Item' }).click();
    cy.withinModal(() => {
      cy.findByRole('button', { name: 'Delete' }).click();
      cy.wait('@deleteScheduledReport');
    });
    cy.url().should('include', '/signals/analytics');
    cy.findByText('Successfully deleted My Scheduled Report').should('be.visible');
  });

  it('Redirects when the report is not found (Create Page)', () => {
    cy.stubRequest({
      method: 'GET',
      statusCode: 404,
      url: '/api/v1/reports/*',
      fixture: '404.json',
      requestAlias: 'getReport404',
    });
    cy.visit('/signals/schedule/foo');
    cy.wait('@getReport404');
    cy.url().should('include', '/signals/analytics');
    cy.findByText('Resource could not be found').should('be.visible');
  });

  it('Redirects when the report/scheduled report is not found (Edit Page)', () => {
    cy.stubRequest({
      method: 'GET',
      statusCode: 404,
      url: 'api/v1/reports/**/schedules/**',
      fixture: '404.json',
      requestAlias: 'getScheduledReport404',
    });
    cy.visit('/signals/schedule/foo/bar');
    cy.wait('@getScheduledReport404');
    cy.url().should('include', '/signals/analytics');
    cy.findByText('Resource could not be found').should('be.visible');

    cy.stubRequest({
      method: 'GET',
      statusCode: 404,
      url: '/api/v1/reports/*',
      fixture: '404.json',
      requestAlias: 'getReport404',
    });
    cy.visit('/signals/schedule/foo/bar');
    cy.wait('@getReport404');
    cy.url().should('include', '/signals/analytics');
  });
});
