import { USERNAME } from 'cypress/constants';
import { LINKS } from 'src/constants';

const PAGE_URL = '/dashboard';

describe('the dashboard page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });

  it('renders the Analytics Report step with "Summary Report" when last usage date is not null', () => {
    stubGrantsRequest({ role: 'admin' });
    stubAlertsReq();
    stubAccountsReq();
    stubUsageReq({ fixture: 'usage/200.get.messaging.json' });
    cy.stubRequest({
      method: 'GET',
      url: '/api/v1/metrics/deliverability/time-series**/**',
      fixture: 'metrics/deliverability/time-series/200.get.json',
      requestAlias: 'dataGetTimeSeries',
    });

    cy.visit(PAGE_URL);
    cy.wait(['@alertsReq', '@accountReq', '@usageReq']);
    cy.findByRole('heading', { name: 'Summary Report' });
    cy.get('.recharts-wrapper').should('be.visible');
    cy.findByText('View Report').click();
    cy.findByRole('heading', { name: 'Analytics Report' });
  });

  it('renders the Analytics Report step with "Change Report" button which open the modal to change pinned report', () => {
    stubGrantsRequest({ role: 'admin' });
    stubAlertsReq();
    stubAccountsReq();
    stubReportsRequest();
    stubUsageReq({ fixture: 'usage/200.get.messaging.json' });
    cy.stubRequest({
      url: '/api/v1/subaccounts',
      fixture: 'subaccounts/200.get.json',
      requestAlias: 'subaccountsReq',
    });
    cy.stubRequest({
      method: 'GET',
      url: '/api/v1/metrics/deliverability**/**',
      fixture: 'metrics/deliverability/200.get.json',
      requestAlias: 'dataGetDeliverability',
    });
    cy.stubRequest({
      method: 'GET',
      url: '/api/v1/metrics/deliverability/time-series**/**',
      fixture: 'metrics/deliverability/time-series/200.get.json',
      requestAlias: 'dataGetTimeSeries',
    });

    cy.visit(PAGE_URL);
    cy.wait(['@alertsReq', '@accountReq', '@usageReq', '@getReports']);
    cy.findByRole('heading', { name: 'Summary Report' });
    cy.get('.recharts-wrapper').should('be.visible');
    cy.findByText('Change Report').click();
    cy.stubRequest({
      url: 'api/v1/users/mockuser',
      method: 'PUT',
      fixture: 'users/200.put.update-ui-options.json',
      requestAlias: 'updateUIOptions',
    });
    cy.withinModal(() => {
      // arbitary wait was added because of this issue https://sparkpost.atlassian.net/browse/FE-1284
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(0);
      cy.get('[type="radio"]').check('d50d8475-d4e8-4df0-950f-b142f77df0bf', { force: true });

      cy.findByRole('button', { name: 'Change Report' }).click();
    });
    cy.wait('@updateUIOptions').then(xhr => {
      expect(xhr.request.body).to.deep.equal({
        options: { ui: { pinned_report_id: 'd50d8475-d4e8-4df0-950f-b142f77df0bf' } },
      });
    });
    cy.findByText('Pinned Report updated').should('be.visible');
  });

  // TODO: I believe this test is catching a bug - the `AggregatedMetrics` component does not make a request for the summary chart data
  // If it's already available in the Redux store, it will be present, however.
  it('renders the Analytics Report step with pinned report when last usage date is not null and a pinned report is present in account ui options', () => {
    stubGrantsRequest({ role: 'admin' });
    stubAlertsReq();
    stubAccountsReq();
    stubUsageReq({ fixture: 'usage/200.get.messaging.json' });
    stubReportsRequest();
    cy.stubRequest({
      url: `/api/v1/users/${USERNAME}`,
      fixture: `users/200.get.has-pinned-report.json`,
      requestAlias: 'userWithPinnedReport',
    });

    cy.stubRequest({
      method: 'GET',
      url: '/api/v1/metrics/deliverability**/**',
      fixture: 'metrics/deliverability/200.get.pinned-report.json',
      requestAlias: 'dataGetDeliverability',
    });

    cy.stubRequest({
      method: 'GET',
      url: '/api/v1/metrics/deliverability/time-series**/**',
      fixture: 'metrics/deliverability/time-series/200.get.json',
      requestAlias: 'dataGetTimeSeries',
    });
    cy.stubRequest({
      url: '/api/v1/subaccounts',
      fixture: 'subaccounts/200.get.json',
      requestAlias: 'getSubaccounts',
    });

    cy.visit(PAGE_URL);
    cy.wait([
      '@alertsReq',
      '@accountReq',
      '@usageReq',
      '@getReports',
      '@userWithPinnedReport',
      // '@dataGetDeliverability',
      '@dataGetTimeSeries',
      '@getSubaccounts',
    ]);

    cy.findByText('My new report').should('be.visible');
    cy.findByText('Bounces').should('be.visible');
    cy.findByText('325K').should('be.visible');
    cy.findByRole('button', { name: 'View Filters' }).should('be.visible');

    cy.findByRole('button', { name: 'View Filters' }).click();
    cy.withinModal(() => {
      cy.findByRole('heading', { name: 'My new report Filters' }).should('be.visible');
      cy.findByRole('button', { name: 'View Report' }).should('be.visible');
      cy.findByRole('button', { name: 'Cancel' }).should('be.visible');
      cy.findByText('Campaign').should('be.visible');
      cy.findByRole('button', { name: 'View Report' }).click();
    });
    cy.findByRole('heading', { name: 'Analytics Report' }).should('be.visible');
  });

  it('Shows Helpful Shortcuts "invite team members" when admin', () => {
    stubGrantsRequest({ role: 'admin' });
    stubAlertsReq();
    stubAccountsReq();
    stubUsageReq({ fixture: 'usage/200.get.messaging.no-last-sent.json' });

    cy.visit(PAGE_URL);
    cy.wait(['@alertsReq', '@accountReq', '@usageReq']);

    cy.findByRole('heading', { name: 'Helpful Shortcuts' }).should('be.visible');

    cy.findByDataId('dashboard-helpful-shortcuts').within(() => {
      cy.verifyLink({
        content: 'Invite a Team Member',
        href: '/account/users/create',
      });
      cy.findByText(
        'Need help integrating? Want to share an Analytics Report? Invite your team!',
      ).should('be.visible');

      cy.verifyLink({
        content: 'Events',
        href: '/reports/message-events',
      });
      cy.findByText(
        'Robust searching capabilities with ready access to the raw event data from your emails.',
      ).should('be.visible');

      cy.verifyLink({
        content: 'Inbox Tracker',
        href: 'https://www.sparkpost.com/inbox-tracker/',
      });
      cy.findByText(
        'Examine every element of deliverability with precision using Inbox Tracker.',
      ).should('be.visible');
    });
  });

  it('Shows Helpful Shortcuts "templates" when not admin', () => {
    stubGrantsRequest({ role: 'developer' });
    stubAlertsReq();
    stubAccountsReq();
    stubUsageReq({ fixture: 'usage/200.get.messaging.no-last-sent.json' });
    stubUsersRequest({ access_level: 'reporting' });

    cy.visit(PAGE_URL);

    cy.wait(['@alertsReq', '@accountReq', '@usageReq', '@stubbedUsersRequest']);

    cy.findByRole('heading', { name: 'Helpful Shortcuts' }).should('be.visible');

    cy.findByDataId('dashboard-helpful-shortcuts').within(() => {
      cy.verifyLink({
        content: 'Templates',
        href: '/templates',
      });
      cy.findByText(
        'Programmatically tailor each message with SparkPost’s flexible templates.',
      ).should('be.visible');

      cy.verifyLink({
        content: 'Events',
        href: '/reports/message-events',
      });
      cy.findByText(
        'Robust searching capabilities with ready access to the raw event data from your emails.',
      ).should('be.visible');

      cy.verifyLink({
        content: 'Inbox Tracker',
        href: 'https://www.sparkpost.com/inbox-tracker/',
      });

      cy.findByText(
        'Examine every element of deliverability with precision using Inbox Tracker.',
      ).should('be.visible');
    });
  });

  it('Shows add sending domain onboarding step when the user has no sending domains on their account.', () => {
    stubGrantsRequest({ role: 'developer' });
    stubAlertsReq();
    stubAccountsReq();
    stubUsageReq({ fixture: 'usage/200.get.messaging.no-last-sent.json' }); // would normally give them the first onboarding step, but this person doesnt have the manage grant
    stubSendingDomains({ fixture: '/200.get.no-results.json' });

    cy.visit(PAGE_URL);
    cy.wait(['@getGrants', '@alertsReq', '@accountReq', '@usageReq', '@sendingDomainsReq']);

    cy.findByRole('heading', { name: 'Get Started!' }).should('be.visible');

    cy.get('p').contains(
      'At least one verified sending domain is required in order to start or enable analytics.',
    );

    cy.verifyLink({
      content: 'Add Sending Domain',
      href: '/domains/list/sending',
    });

    // step 2 text...
    cy.findAllByText('Once a sending domain has been added, it needs to be').should('not.exist');

    // step 3 text...
    cy.findAllByText('Create an API key in order to start sending via API or SMTP.').should(
      'not.exist',
    );

    // step 4 text
    cy.findByText(
      'Follow the Getting Started documentation to set up sending via API or SMTP.',
    ).should('not.exist');
  });

  it('Shows verify sending domain onboarding step when the user has no verified sending domains on their account. Links to the domain details page with one domain.', () => {
    stubGrantsRequest({ role: 'developer' });
    stubAlertsReq();
    stubAccountsReq();
    stubUsageReq({ fixture: 'usage/200.get.messaging.no-last-sent.json' });
    stubSendingDomains({ fixture: 'sending-domains/200.get.unverified-sending.json' });

    cy.visit(PAGE_URL);
    cy.wait(['@getGrants', '@alertsReq', '@accountReq', '@usageReq', '@sendingDomainsReq']);

    cy.findByRole('heading', { name: 'Get Started!' }).should('be.visible');

    cy.get('p').contains(
      'Once a sending domain has been added, it needs to be verified. Follow the instructions on the domain details page to configure your DNS settings.',
    );

    cy.verifyLink({
      content: 'Verify Sending Domain',
      href: '/domains/details/sending-bounce/sparkspam.com',
    });

    // step 1 text...
    cy.findAllByText('is required in order to start or enable analytics.').should('not.exist');

    // step 3 text...
    cy.findAllByText('Create an API key in order to start sending via API or SMTP.').should(
      'not.exist',
    );

    // step 4 text
    cy.findByText(
      'Follow the Getting Started documentation to set up sending via API or SMTP.',
    ).should('not.exist');
  });

  it('Shows verify sending domain onboarding step when the user has no verified sending domains on their account. Links to the list page with more than one domain.', () => {
    stubGrantsRequest({ role: 'developer' });
    stubAlertsReq();
    stubAccountsReq();
    stubUsageReq({ fixture: 'usage/200.get.messaging.no-last-sent.json' });
    stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-unverified-sending.json' });

    cy.visit(PAGE_URL);
    cy.wait(['@getGrants', '@alertsReq', '@accountReq', '@usageReq', '@sendingDomainsReq']);

    cy.findByRole('heading', { name: 'Get Started!' }).should('be.visible');

    cy.get('p').contains(
      'Once a sending domain has been added, it needs to be verified. Follow the instructions on the domain details page to configure your DNS settings.',
    );

    cy.verifyLink({
      content: 'Verify Sending Domain',
      href: '/domains/list/sending',
    });

    // step 1 text...
    cy.findAllByText('is required in order to start or enable analytics.').should('not.exist');

    // step 3 text...
    cy.findAllByText('Create an API key in order to start sending via API or SMTP.').should(
      'not.exist',
    );

    // step 4 text
    cy.findByText(
      'Follow the Getting Started documentation to set up sending via API or SMTP.',
    ).should('not.exist');
  });

  it('Shows the create api key onboarding step when the user has no api keys on their account.', () => {
    stubGrantsRequest({ role: 'developer' });
    stubAlertsReq();
    stubAccountsReq();
    stubUsageReq({ fixture: 'usage/200.get.messaging.no-last-sent.json' });
    stubSendingDomains({ fixture: 'sending-domains/200.get.json' });
    stubApiKeyReq({ fixture: '/200.get.no-results.json' });

    cy.visit(PAGE_URL);
    cy.wait([
      '@getGrants',
      '@alertsReq',
      '@accountReq',
      '@usageReq',
      '@sendingDomainsReq',
      '@apiKeysReq',
    ]);

    cy.findByRole('heading', { name: 'Start Sending!' }).should('be.visible');

    cy.get('p').contains('Create an API key in order to start sending via API or SMTP.');

    cy.verifyLink({
      content: 'Create API Key',
      href: '/account/api-keys/create',
    });

    // step 1 text...
    cy.findAllByText('is required in order to start or enable analytics.').should('not.exist');

    // step 2 text...
    cy.findAllByText('Once a sending domain has been added, it needs to be').should('not.exist');

    // step 4 text
    cy.findByText(
      'Follow the Getting Started documentation to set up sending via API or SMTP.',
    ).should('not.exist');
  });

  it('Shows the start sending onboarding step when the user has at least one verified sending domain and at least one api key but no last usage date.', () => {
    stubGrantsRequest({ role: 'developer' });
    stubAlertsReq();
    stubAccountsReq();
    stubUsageReq({ fixture: 'usage/200.get.messaging.no-last-sent.json' });
    stubSendingDomains({ fixture: 'sending-domains/200.get.json' });
    stubApiKeyReq({ fixture: 'api-keys/200.get.transmissions-modify.json' });

    cy.visit(PAGE_URL);
    cy.wait([
      '@getGrants',
      '@alertsReq',
      '@accountReq',
      '@usageReq',
      '@sendingDomainsReq',
      '@apiKeysReq',
    ]);

    cy.findByRole('heading', { name: 'Start Sending!' }).should('be.visible');

    cy.get('p').contains(
      'Follow the Getting Started documentation to set up sending via API or SMTP.',
    );

    cy.verifyLink({
      content: 'Getting Started Documentation',
      href: LINKS.ONBOARDING_SENDING_EMAIL,
    });

    // step 1 text...
    cy.findAllByText('is required in order to start or enable analytics.').should('not.exist');

    // step 2 text...
    cy.findAllByText('Once a sending domain has been added, it needs to be').should('not.exist');

    // step 3 text...
    cy.findAllByText('Create an API key in order to start sending via API or SMTP.').should(
      'not.exist',
    );
  });

  it('Shows the default "Go To Analytics Report" onboarding step for reporting users with no last usage date.', () => {
    stubGrantsRequest({ role: 'reporting' });
    stubAlertsReq();
    stubAccountsReq();
    stubUsageReq({ fixture: 'usage/200.get.messaging.no-last-sent.json' });
    // Force not admin here - Our mocked cypress state always has the user as admin
    stubUsersRequest({ access_level: 'reporting' });

    cy.visit(PAGE_URL);
    cy.wait(['@alertsReq', '@accountReq', '@stubbedUsersRequest', '@usageReq']);

    cy.findByRole('heading', { name: 'Analytics Report' }).should('be.visible');

    cy.findByText('Build custom analytics, track engagement, diagnose errors, and more.').should(
      'be.visible',
    );

    cy.verifyLink({
      content: 'Go To Analytics Report',
      href: '/signals/analytics',
    });

    // step 1 text...
    cy.findAllByText('is required in order to start or enable analytics.').should('not.exist');

    // step 2 text...
    cy.findAllByText('Once a sending domain has been added, it needs to be').should('not.exist');

    // step 3 text...
    cy.findAllByText('Create an API key in order to start sending via API or SMTP.').should(
      'not.exist',
    );

    // step 4 text...
    cy.findByRole('heading', { name: 'Start Sending!' }).should('not.exist');

    //text from default Analytics report step...
    cy.findByText(
      'Follow the Getting Started documentation to set up sending via API or SMTP.',
    ).should('not.exist');
  });

  it('Shows the Pinned Report onboarding step for templates users with last usage date', () => {
    stubGrantsRequest({ role: 'templates' });
    stubAlertsReq();
    stubAccountsReq();
    stubUsageReq({ fixture: 'usage/200.get.messaging.json' });
    // Force not admin here - Our mocked cypress state always has the user as admin
    stubUsersRequest({ access_level: 'templates' });

    cy.visit(PAGE_URL);
    cy.wait(['@alertsReq', '@accountReq', '@stubbedUsersRequest', '@usageReq']);

    cy.findByRole('heading', { name: 'Summary Report' }).should('be.visible');

    cy.findByText('Build custom analytics, track engagement, diagnose errors, and more.').should(
      'not.exist',
    );

    // step 1 text...
    cy.findAllByText('is required in order to start or enable analytics.').should('not.exist');

    // step 2 text...
    cy.findAllByText('Once a sending domain has been added, it needs to be').should('not.exist');

    // step 3 text...
    cy.findAllByText('Create an API key in order to start sending via API or SMTP.').should(
      'not.exist',
    );

    // step 4 text...
    cy.findByRole('heading', { name: 'Start Sending!' }).should('not.exist');
    cy.findByText(
      'Follow the Getting Started documentation to set up sending via API or SMTP.',
    ).should('not.exist');
  });

  it('Shows the default "Go To Analytics Report" onboarding step for templates users without last usage date', () => {
    stubGrantsRequest({ role: 'templates' });
    stubAlertsReq();
    stubAccountsReq();
    stubUsageReq({ fixture: 'usage/200.get.messaging.no-last-sent.json' });
    // Force not admin here - Our mocked cypress state always has the user as admin
    stubUsersRequest({ access_level: 'templates' });

    cy.visit(PAGE_URL);
    cy.wait(['@alertsReq', '@accountReq', '@stubbedUsersRequest', '@usageReq']);

    cy.findByRole('heading', { name: 'Analytics Report' }).should('be.visible');

    cy.findByText('Build custom analytics, track engagement, diagnose errors, and more.').should(
      'be.visible',
    );

    cy.verifyLink({
      content: 'Go To Analytics Report',
      href: '/signals/analytics',
    });

    // step 1 text...
    cy.findAllByText('is required in order to start or enable analytics.').should('not.exist');

    // step 2 text...
    cy.findAllByText('Once a sending domain has been added, it needs to be').should('not.exist');

    // step 3 text...
    cy.findAllByText('Create an API key in order to start sending via API or SMTP.').should(
      'not.exist',
    );

    // step 4 text...
    cy.findByRole('heading', { name: 'Start Sending!' }).should('not.exist');
    cy.findByText(
      'Follow the Getting Started documentation to set up sending via API or SMTP.',
    ).should('not.exist');
  });

  it('renders with a relevant page title, relevant headings, and links', () => {
    commonBeforeSteps();
    cy.title().should('include', 'Dashboard');
    cy.findByRole('heading', { name: 'Welcome, Ulysses!' }).should('be.visible');
    cy.findByRole('heading', { name: 'Setup Documentation' }).should('be.visible');
    cy.verifyLink({
      content: 'Integration Documentation',
      href: 'https://www.sparkpost.com/docs/getting-started/getting-started-sparkpost/',
    });

    cy.findByRole('heading', { name: 'Need Help?' }).should('be.visible');
    cy.findByRole('button', { name: 'Contact our Support Team' }).click();
    cy.withinModal(() => cy.findByRole('button', { name: 'Close' }).click());
  });

  it('does not render the "Setup Documentation" or the usage section panel when the user is not an admin, developer, or super user', () => {
    stubAlertsReq();
    stubAccountsReq();
    stubUsageReq({ fixture: 'usage/200.get.messaging.json' });
    stubSendingDomains({ fixture: 'sending-domains/200.get.json' });
    stubApiKeyReq({ fixture: 'api-keys/200.get.json' });
    stubUsersRequest({ access_level: 'reporting' });
    cy.visit(PAGE_URL);
    cy.wait([
      '@accountReq',
      '@alertsReq',
      '@stubbedUsersRequest',
      '@usageReq',
      '@sendingDomainsReq',
      '@apiKeysReq',
    ]);

    cy.findByRole('heading', { name: 'Setup Documentation' }).should('not.exist');
    cy.findByRole('heading', { name: 'Need Help?' }).should('be.visible');
    cy.findByDataId('transmissions-usage-section').should('not.exist');
    cy.findByDataId('validations-usage-section').should('not.exist');
  });

  it('does not render the "Upgrade" link for manually billed customers', () => {
    stubAccountsReq();
    stubAlertsReq();
    stubUsageReq({ fixture: 'usage/200.get.messaging.json' });
    stubReportsRequest();
    stubSubscription({ fixture: 'billing/subscription/200.get.manually-billed.json' });
    cy.stubRequest({
      url: '/api/v1/subaccounts',
      fixture: 'subaccounts/200.get.json',
      requestAlias: 'subaccountsReq',
    });
    cy.stubRequest({
      method: 'GET',
      url: '/api/v1/metrics/deliverability**/**',
      fixture: 'metrics/deliverability/200.get.json',
      requestAlias: 'dataGetDeliverability',
    });
    cy.stubRequest({
      method: 'GET',
      url: '/api/v1/metrics/deliverability/time-series**/**',
      fixture: 'metrics/deliverability/time-series/200.get.json',
      requestAlias: 'dataGetTimeSeries',
    });
    cy.visit(PAGE_URL);
    cy.wait([
      '@accountReq',
      '@alertsReq',
      '@usageReq',
      '@getReports',
      '@getSubscription',
      '@subaccountsReq',
      '@dataGetTimeSeries',
      '@dataGetDeliverability',
    ]);
    cy.get('a')
      .contains('Upgrade')
      .should('not.exist');
  });

  describe('sidebar', () => {
    it("renders the user's email address and role  in the account details section", () => {
      commonBeforeSteps();

      cy.findByDataId('sidebar-account-details').within(() => {
        cy.findByRole('heading', { name: 'Profile' }).should('be.visible');
        cy.findByText('mockuser@example.com').should('be.visible');
        cy.findByText('Admin').should('be.visible');
      });
    });

    it("renders the user's billing data within the billing and usage section", () => {
      commonBeforeSteps();

      cy.findByDataId('sidebar-billing-usage-detail').within(() => {
        cy.findByRole('heading', { name: 'Billing/Usage Detail' }).should('be.visible');
        cy.findByRole('heading', { name: 'Sending Plan' }).should('be.visible');
        cy.findByText('Custom Monthly Starter Plan').should('be.visible');
        cy.findByDataId('sidebar-transmissions-this-month').should('contain', '7,968,145');
        cy.findByDataId('sidebar-transmissions-in-plan').should('contain', '15,000,000');
        cy.findByDataId('sidebar-validations-this-month').should('contain', '50');
        cy.verifyLink({
          content: 'Upgrade',
          href: '/account/billing/plan',
        });
        cy.findByDataId('sidebar-validations-end-of-billing-period').should(
          'contain',
          'Aug 11, 2020',
        );
        cy.verifyLink({
          content: 'View Usage Numbers',
          href: '/usage',
        });
      });
    });

    it('renders recent, non-muted alerts', () => {
      commonBeforeSteps();

      cy.findByDataId('sidebar-recent-alerts').within(() => {
        cy.verifyLink({
          content: 'Alert 2',
          href: '/alerts/details/2',
        });
        cy.findByText('Jul 10, 2019').should('be.visible');
        cy.findByText('Soft Bounce Rate').should('be.visible');

        cy.verifyLink({
          content: 'Alert 3',
          href: '/alerts/details/3',
        });
        cy.findByText('Jul 9, 2019').should('be.visible');
        cy.findByText('Block Bounce Rate').should('be.visible');
      });
    });

    it('does not render the billing period if the user is on an annual plan', () => {
      stubAccountsReq({ fixture: 'account/200.get.annual-plan.json' });
      stubUsageReq();
      stubAlertsReq();

      cy.visit(PAGE_URL);

      cy.wait(['@accountReq', '@usageReq', '@alertsReq']);

      cy.findByText('Your billing period ends').should('not.exist');
    });

    it('does not render subsections when no data are returned', () => {
      stubAccountsReq();
      stubUsageReq({ fixture: '200.get.no-results.json' });
      stubAlertsReq({ fixture: '200.get.no-results.json' });

      cy.visit(PAGE_URL);

      cy.wait(['@accountReq', '@usageReq', '@alertsReq']);

      cy.findByRole('heading', { name: 'Recipient Validation' }).should('not.exist');
      cy.findByRole('heading', { name: 'Recent Alerts' }).should('not.exist');
    });
  });
});

function commonBeforeSteps() {
  stubAccountsReq();
  stubUsageReq();
  stubAlertsReq();

  cy.visit(PAGE_URL);
  cy.wait(['@accountReq', '@usageReq', '@alertsReq']);
}

function stubSubscription({
  fixture = 'billing/subscription/200.get.json',
  requestAlias = 'getSubscription',
}) {
  cy.stubRequest({
    url: '/api/v1/billing/subscription',
    fixture,
    requestAlias,
  });
}

function stubAccountsReq({ fixture = 'account/200.get.dashboard-v2.json' } = {}) {
  cy.stubRequest({
    url: '/api/v1/account**',
    fixture: fixture,
    requestAlias: 'accountReq',
  });
}

function stubUsageReq({ fixture = 'usage/200.get.json' } = {}) {
  cy.stubRequest({
    url: '/api/v1/usage',
    fixture: fixture,
    requestAlias: 'usageReq',
  });
}

function stubAlertsReq({ fixture = 'alerts/200.get.json' } = {}) {
  cy.stubRequest({
    url: '/api/v1/alerts',
    fixture: fixture,
    requestAlias: 'alertsReq',
  });
}

function stubApiKeyReq({ fixture = 'api-keys/200.get.json' } = {}) {
  cy.stubRequest({
    url: '/api/v1/api-keys**',
    fixture: fixture,
    requestAlias: 'apiKeysReq',
  });
}

function stubSendingDomains({ fixture = 'sending-domains/200.get.json' } = {}) {
  cy.stubRequest({
    url: '/api/v1/sending-domains**',
    fixture: fixture,
    requestAlias: 'sendingDomainsReq',
  });
}

function stubGrantsRequest({ role }) {
  cy.stubRequest({
    url: '/api/v1/authenticate/grants*',
    fixture: `authenticate/grants/200.get.${role}.json`,
    requestAlias: 'getGrants',
  });
}

// this is an override of the stub set by stubAuth
function stubUsersRequest({ access_level }) {
  cy.stubRequest({
    url: `/api/v1/users/${USERNAME}`,
    fixture: `users/200.get.${access_level}.json`,
    requestAlias: 'stubbedUsersRequest',
  });
}

function stubReportsRequest({ fixture = 'reports/200.get.json' } = {}) {
  cy.stubRequest({
    url: '/api/v1/reports',
    fixture: fixture,
    requestAlias: 'getReports',
  });
}
