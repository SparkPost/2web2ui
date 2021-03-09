import { USERNAME } from 'cypress/constants';
const PAGE_URL = '/reports/message-events'; // Just trying to pick a page without many network requests, avoiding the dashboard as a result
const desktopNavSelector = '[data-id="desktop-navigation"]';
const secondaryNavSelector = '[data-id="secondary-navigation"]';
const mobileNavSelector = '[data-id="mobile-navigation"]';
const accountActionlistSelector = '[data-id="desktop-navigation-account-actionlist"]';
const accountPopoverTriggerSelector = '[data-id="desktop-navigation-account-popover-trigger"]';

function toggleMobileMenu() {
  // `force` required as element is exposed only to screen readers
  cy.get(mobileNavSelector).within(() =>
    cy.findByRole('button', { name: 'Menu' }).click({ force: true }),
  );
}

describe('The navigation', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });

  describe('desktop navigation', () => {
    it('all nav links renders correctly for admin', () => {
      stubGrantsRequest({ role: 'admin' });
      cy.visit(PAGE_URL);
      cy.wait('@stubbedGrantsRequest');

      cy.get(desktopNavSelector).within(() => {
        cy.verifyLink({ content: 'Signals Analytics', href: '/signals/analytics' });
        cy.verifyLink({ content: 'Events', href: '/reports/message-events' });
        cy.verifyLink({ content: 'Content', href: '/templates' });
        cy.verifyLink({ content: 'Recipients', href: '/recipient-validation/list' });
        cy.verifyLink({ content: 'Configuration', href: '/domains' });
      });

      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Signals Analytics' }).click();
      });
      cy.url().should('include', '/signals/analytics');

      cy.get(secondaryNavSelector).within(() => {
        cy.verifyLink({ content: 'Analytics Report', href: '/signals/analytics' });
        cy.verifyLink({ content: 'Health Score', href: '/signals/health-score' });
        cy.verifyLink({ content: 'Spam Traps', href: '/signals/spam-traps' });
        cy.verifyLink({ content: 'Engagement Recency', href: '/signals/engagement' });
        cy.verifyLink({ content: 'Blocklist', href: '/signals/blocklist/incidents' });
      });
      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Events' }).click();
      });
      cy.url().should('include', '/reports/message-events');
      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Content' }).click();
      });

      cy.url().should('include', '/templates');

      cy.get(secondaryNavSelector).within(() => {
        cy.verifyLink({ content: 'Templates', href: '/templates' });
        cy.verifyLink({ content: 'A/B Testing', href: '/ab-testing' });
        cy.verifyLink({ content: 'Snippets', href: '/snippets' });
      });

      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Recipients' }).click();
      });

      cy.url().should('include', '/recipient-validation/list');

      cy.get(secondaryNavSelector).within(() => {
        cy.verifyLink({ content: 'Recipient Validation', href: '/recipient-validation/list' });
        cy.verifyLink({ content: 'Recipient Lists', href: '/lists/recipient-lists' });
        cy.verifyLink({ content: 'Suppressions', href: '/lists/suppressions' });
      });

      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Configuration' }).click();
      });

      cy.url().should('include', '/domains');

      cy.get(secondaryNavSelector).within(() => {
        cy.verifyLink({ content: 'Domains', href: '/domains' });
        cy.verifyLink({ content: 'Webhooks', href: '/webhooks' });
        cy.verifyLink({ content: 'IP Pools', href: '/account/ip-pools' });
        cy.verifyLink({ content: 'API Keys', href: '/account/api-keys' });
        cy.verifyLink({ content: 'SMTP Settings', href: '/account/smtp' });
        cy.verifyLink({ content: 'Seedlist', href: '/inbox-placement/seedlist' });
      });
    });

    it('all nav links renders correctly for developer', () => {
      stubGrantsRequest({ role: 'developer' });
      cy.visit(PAGE_URL);
      cy.wait('@stubbedGrantsRequest');

      cy.get(desktopNavSelector).within(() => {
        cy.verifyLink({ content: 'Signals Analytics', href: '/signals/analytics' });
        cy.verifyLink({ content: 'Events', href: '/reports/message-events' });
        cy.verifyLink({ content: 'Content', href: '/templates' });
        cy.verifyLink({ content: 'Recipients', href: '/lists/recipient-lists' });
        cy.verifyLink({ content: 'Configuration', href: '/domains' });
      });

      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Signals Analytics' }).click();
      });
      cy.url().should('include', '/signals/analytics');

      cy.get(secondaryNavSelector).within(() => {
        cy.verifyLink({ content: 'Analytics Report', href: '/signals/analytics' });
        cy.verifyLink({ content: 'Health Score', href: '/signals/health-score' });
        cy.verifyLink({ content: 'Spam Traps', href: '/signals/spam-traps' });
        cy.verifyLink({ content: 'Engagement Recency', href: '/signals/engagement' });
        cy.verifyLink({ content: 'Blocklist', href: '/signals/blocklist/incidents' });
      });
      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Events' }).click();
      });
      cy.url().should('include', '/reports/message-events');
      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Content' }).click();
      });

      cy.url().should('include', '/templates');

      cy.get(secondaryNavSelector).within(() => {
        cy.verifyLink({ content: 'Templates', href: '/templates' });
        cy.verifyLink({ content: 'A/B Testing', href: '/ab-testing' });
        cy.verifyLink({ content: 'Snippets', href: '/snippets' });
      });

      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Recipients' }).click();
      });

      cy.url().should('include', '/lists/recipient-lists');

      cy.get(secondaryNavSelector).within(() => {
        cy.verifyLink({ content: 'Recipient Lists', href: '/lists/recipient-lists' });
        cy.verifyLink({ content: 'Suppressions', href: '/lists/suppressions' });
      });

      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Configuration' }).click();
      });

      cy.url().should('include', '/domains');

      cy.get(secondaryNavSelector).within(() => {
        cy.verifyLink({ content: 'Domains', href: '/domains' });
        cy.verifyLink({ content: 'Webhooks', href: '/webhooks' });
        cy.verifyLink({ content: 'IP Pools', href: '/account/ip-pools' });
        cy.verifyLink({ content: 'API Keys', href: '/account/api-keys' });
        cy.verifyLink({ content: 'SMTP Settings', href: '/account/smtp' });
      });
    });

    it('all nav links renders correctly for templates', () => {
      stubGrantsRequest({ role: 'templates' });
      cy.visit(PAGE_URL);
      cy.wait('@stubbedGrantsRequest');

      cy.get(desktopNavSelector).within(() => {
        cy.verifyLink({ content: 'Signals Analytics', href: '/signals/analytics' });
        cy.verifyLink({ content: 'Events', href: '/reports/message-events' });
        cy.verifyLink({ content: 'Content', href: '/templates' });
        cy.verifyLink({ content: 'Recipients', href: '/lists/recipient-lists' });
        cy.findByRole('link', { name: 'Configuration' }).should('not.exist');
      });

      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Signals Analytics' }).click();
      });
      cy.url().should('include', '/signals/analytics');

      cy.get(secondaryNavSelector).within(() => {
        cy.verifyLink({ content: 'Analytics Report', href: '/signals/analytics' });
        cy.verifyLink({ content: 'Health Score', href: '/signals/health-score' });
        cy.verifyLink({ content: 'Spam Traps', href: '/signals/spam-traps' });
        cy.verifyLink({ content: 'Engagement Recency', href: '/signals/engagement' });
        cy.verifyLink({ content: 'Blocklist', href: '/signals/blocklist/incidents' });
      });
      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Events' }).click();
      });
      cy.url().should('include', '/reports/message-events');
      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Content' }).click();
      });

      cy.url().should('include', '/templates');

      cy.get(secondaryNavSelector).within(() => {
        cy.verifyLink({ content: 'Templates', href: '/templates' });
        cy.verifyLink({ content: 'A/B Testing', href: '/ab-testing' });
        cy.verifyLink({ content: 'Snippets', href: '/snippets' });
      });

      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Recipients' }).click();
      });

      cy.url().should('include', '/lists/recipient-list');

      cy.get(secondaryNavSelector).within(() => {
        cy.findByRole('link', { name: 'Recipient Validation' }).should('not.exist');
        cy.verifyLink({ content: 'Recipient Lists', href: '/lists/recipient-lists' });
        cy.verifyLink({ content: 'Suppressions', href: '/lists/suppressions' });
      });
    });

    it('all nav links renders correctly for reporting user', () => {
      stubGrantsRequest({ role: 'reporting' });
      cy.visit(PAGE_URL);
      cy.wait('@stubbedGrantsRequest');

      cy.get(desktopNavSelector).within(() => {
        cy.verifyLink({ content: 'Signals Analytics', href: '/signals/analytics' });
        cy.verifyLink({ content: 'Events', href: '/reports/message-events' });
        cy.verifyLink({ content: 'Content', href: '/templates' });
        cy.findByRole('link', { name: 'Recipients' }).should('not.exist');
        cy.findByRole('link', { name: 'Configuration' }).should('not.exist');
      });

      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Signals Analytics' }).click();
      });
      cy.url().should('include', '/signals/analytics');

      cy.get(secondaryNavSelector).within(() => {
        cy.verifyLink({ content: 'Analytics Report', href: '/signals/analytics' });
        cy.verifyLink({ content: 'Health Score', href: '/signals/health-score' });
        cy.verifyLink({ content: 'Spam Traps', href: '/signals/spam-traps' });
        cy.verifyLink({ content: 'Engagement Recency', href: '/signals/engagement' });
        cy.verifyLink({ content: 'Blocklist', href: '/signals/blocklist/incidents' });
      });
      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Events' }).click();
      });
      cy.url().should('include', '/reports/message-events');
      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Content' }).click();
      });

      cy.url().should('include', '/templates');

      cy.get(secondaryNavSelector).within(() => {
        cy.verifyLink({ content: 'Templates', href: '/templates' });
        cy.findByRole('link', { name: 'A/B Testing' }).should('not.exist');
        cy.verifyLink({ content: 'Snippets', href: '/snippets' });
      });
    });

    it('does not render the mobile navigation at 960px viewport width and above', () => {
      cy.get(mobileNavSelector).should('not.be.visible');
      cy.get(desktopNavSelector).should('be.visible');
    });

    it('routes to the summary page and renders relevant subnav links when "Signals Analytics" is active', () => {
      stubGrantsRequest({ role: 'admin' });
      cy.visit(PAGE_URL);
      cy.wait('@stubbedGrantsRequest');

      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Signals Analytics' }).click();
      });

      cy.url().should('include', '/signals/analytics');

      cy.get(secondaryNavSelector).within(() => {
        cy.verifyLink({ content: 'Analytics Report', href: '/signals/analytics' });
        cy.verifyLink({ content: 'Health Score', href: '/signals/health-score' });
        cy.verifyLink({ content: 'Spam Traps', href: '/signals/spam-traps' });
        cy.verifyLink({ content: 'Engagement Recency', href: '/signals/engagement' });
        cy.verifyLink({ content: 'Blocklist', href: '/signals/blocklist/incidents' });
      });
    });

    it('does not render the subnav when "Events" is active', () => {
      stubGrantsRequest({ role: 'admin' });
      cy.visit(PAGE_URL);
      cy.wait('@stubbedGrantsRequest');

      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Events' }).click();
      });

      cy.url().should('include', '/reports/message-events');

      cy.get(secondaryNavSelector).should('not.exist');
    });

    it('routes to the templates page and renders relevant subnav links when "Content" is active', () => {
      stubGrantsRequest({ role: 'admin' });
      cy.visit(PAGE_URL);
      cy.wait('@stubbedGrantsRequest');

      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Content' }).click();
      });

      cy.url().should('include', '/templates');

      cy.get(secondaryNavSelector).within(() => {
        cy.verifyLink({ content: 'Templates', href: '/templates' });
        cy.verifyLink({ content: 'A/B Testing', href: '/ab-testing' });
        cy.verifyLink({ content: 'Snippets', href: '/snippets' });
      });
    });

    it('routes to the recipient validation page and renders relevant subnav links when "Recipients" is active', () => {
      stubGrantsRequest({ role: 'admin' });
      cy.visit(PAGE_URL);
      cy.wait('@stubbedGrantsRequest');

      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Recipients' }).click();
      });

      cy.url().should('include', '/recipient-validation/list');

      cy.get(secondaryNavSelector).within(() => {
        cy.verifyLink({ content: 'Recipient Validation', href: '/recipient-validation/list' });
        cy.verifyLink({ content: 'Recipient Lists', href: '/lists/recipient-lists' });
        cy.verifyLink({ content: 'Suppressions', href: '/lists/suppressions' });
      });
    });

    it('routes to the recipient list page when the user does not have Recipient Validation grants when navigating using the "Recipients" nav item', () => {
      cy.stubRequest({
        url: '/api/v1/authenticate/grants*',
        fixture: 'authenticate/grants/200.get.templates.json',
        requestAlias: 'grantsReq',
      });
      cy.visit(PAGE_URL);
      cy.wait('@grantsReq');

      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Recipients' }).click();
      });

      cy.url().should('not.include', '/recipient-validation/list');
      cy.url().should('include', '/lists/recipient-lists');
    });

    it('renders the subnav links when subsections within the "Recipient Validation" category when a subroute is visited', () => {
      cy.stubRequest({
        url: '/api/v1/recipient-validation/list',
        fixture: 'recipient-validation/list/200.get.json',
        requestAlias: 'recipientValidationReq',
      });
      cy.visit('/recipient-validation/list');
      cy.wait('@recipientValidationReq');

      cy.findByRole('tab', { name: 'Single Address' }).click();

      cy.get(secondaryNavSelector).within(() => {
        cy.verifyLink({ content: 'Recipient Validation', href: '/recipient-validation/list' });
        cy.verifyLink({ content: 'Recipient Lists', href: '/lists/recipient-lists' });
        cy.verifyLink({ content: 'Suppressions', href: '/lists/suppressions' });
      });
    });

    it('renders the subnav and routes to the sending domains when "Configuration" is active', () => {
      stubGrantsRequest({ role: 'admin' });
      cy.visit(PAGE_URL);
      cy.wait('@stubbedGrantsRequest');

      cy.get(desktopNavSelector).within(() => {
        cy.findByRole('link', { name: 'Configuration' }).click();
      });

      cy.url().should('include', '/domains');

      cy.get(secondaryNavSelector).within(() => {
        cy.verifyLink({ content: 'Domains', href: '/domains' });
        cy.verifyLink({ content: 'Webhooks', href: '/webhooks' });
        cy.verifyLink({ content: 'IP Pools', href: '/account/ip-pools' });
        cy.verifyLink({ content: 'API Keys', href: '/account/api-keys' });
        cy.verifyLink({ content: 'SMTP Settings', href: '/account/smtp' });
        cy.verifyLink({ content: 'Seedlist', href: '/inbox-placement/seedlist' });
      });
    });

    it("renders the pending cancellation banner when the user's account is pending cancellation", () => {
      cy.stubAuth();
      cy.stubRequest({
        url: '/api/v1/account*',
        fixture: 'account/200.get.pending-cancellation.json',
        requestAlias: 'getAccount',
      });
      cy.login({ isStubbed: true });
      cy.visit('/account/settings'); // Re-routing to this page successfully renders the banner

      cy.stubRequest({
        method: 'DELETE',
        url: '/api/v1/account/cancellation-request',
        fixture: 'account/cancellation-request/200.delete.json',
        requestAlias: 'deleteCancellation',
      });

      cy.findByRole('button', { name: 'Don’t Cancel' }).click();
      cy.wait('@deleteCancellation');
      cy.findByText('Your account will not be cancelled.').should('be.visible');
    });

    it("renders the upgrade banner when the user's account is on a free plan", () => {
      cy.stubAuth();
      cy.stubRequest({
        url: '/api/v1/account*',
        fixture: 'account/200.get.free-plan.json',
        requestAlias: 'accountRequest',
      });
      cy.visit(PAGE_URL);
      cy.wait('@accountRequest');

      cy.findByText(
        'Gain access to all of the features we have to offer and increase your sending limits!',
      ).should('be.visible');
      cy.verifyLink({
        href: '/account/billing/plan',
        content: 'Upgrade Now',
      });
    });
  });

  describe('mobile navigation', () => {
    beforeEach(() => {
      cy.viewport(959, 1024);
    });

    it('does not render the desktop navigation below the 960px viewport width', () => {
      stubGrantsRequest({ role: 'admin' });
      cy.visit(PAGE_URL);
      cy.wait('@stubbedGrantsRequest');
      cy.get(desktopNavSelector).should('not.be.visible');

      // Can't just check for mobile nav visiblity - effective height is 0px due to use of `react-focus-lock`
      cy.get(mobileNavSelector).within(() =>
        cy.findByRole('button', { name: 'Menu' }).should('be.visible'),
      );
    });

    it('renders default nav items and child items', () => {
      stubGrantsRequest({ role: 'admin' });
      cy.visit(PAGE_URL);
      cy.wait('@stubbedGrantsRequest');
      toggleMobileMenu();
      // eslint-disable-next-line
      cy.wait(2000);

      cy.get(mobileNavSelector).within(() => {
        cy.findByText('mockuser@example.com');
        cy.findByText('107'); // The user's Customer ID
        cy.findByRole('button', { name: 'Signals Analytics' })
          .scrollIntoView()
          .click();
        cy.verifyLink({ content: 'Analytics Report', href: '/signals/analytics' });
        cy.verifyLink({ content: 'Health Score', href: '/signals/health-score' });
        cy.verifyLink({ content: 'Spam Traps', href: '/signals/spam-traps' });
        cy.verifyLink({ content: 'Engagement Recency', href: '/signals/engagement' });
        cy.verifyLink({ content: 'Blocklist', href: '/signals/blocklist/incidents' });
        cy.findByRole('button', { name: 'Signals Analytics' }).click();

        cy.verifyLink({ content: 'Events', href: '/reports/message-events' });

        cy.findByRole('button', { name: 'Content' }).click();
        cy.verifyLink({ content: 'Templates', href: '/templates' });
        cy.verifyLink({ content: 'A/B Testing', href: '/ab-testing' });
        cy.verifyLink({ content: 'Snippets', href: '/snippets' });
        cy.findByRole('button', { name: 'Content' }).click();

        cy.findByRole('button', { name: 'Recipients' }).click();
        cy.verifyLink({ content: 'Recipient Validation', href: '/recipient-validation/list' });
        cy.verifyLink({ content: 'Recipient Lists', href: '/lists/recipient-lists' });
        cy.verifyLink({ content: 'Suppressions', href: '/lists/suppressions' });
        cy.findByRole('button', { name: 'Recipients' }).click();

        cy.findByRole('button', { name: 'Configuration' }).click();
        cy.verifyLink({ content: 'Webhooks', href: '/webhooks' });
        cy.verifyLink({ content: 'IP Pools', href: '/account/ip-pools' });
        cy.verifyLink({ content: 'API Keys', href: '/account/api-keys' });
        cy.verifyLink({ content: 'SMTP Settings', href: '/account/smtp' });
        cy.verifyLink({ content: 'Seedlist', href: '/inbox-placement/seedlist' });
        cy.verifyLink({ content: 'Domains', href: '/domains' });
        cy.findByRole('button', { name: 'Configuration' }).click();

        cy.verifyLink({ content: 'Profile', href: '/account/profile' });
        cy.verifyLink({ content: 'Alerts', href: '/alerts' });
        cy.verifyLink({ content: 'API Docs', href: 'https://developers.sparkpost.com/api' });
        cy.verifyLink({ content: 'Log Out', href: '/logout' });
      });
    });

    it('opens the help modal and closes the navigation when clicking "Help"', () => {
      stubGrantsRequest({ role: 'admin' });
      cy.visit(PAGE_URL);
      cy.wait('@stubbedGrantsRequest');
      toggleMobileMenu();

      cy.get(mobileNavSelector).within(() => {
        cy.findByRole('button', { name: 'Help' }).click();
      });

      cy.get(mobileNavSelector).should('not.be.visible');

      cy.withinModal(() => {
        cy.findByRole('tab', { name: 'Search Help' }).should('be.visible');
        cy.findByRole('tab', { name: 'Submit A Ticket' }).should('be.visible');
        cy.findByRole('tab', { name: 'Contact Us' }).should('be.visible');
      });
    });

    it('moves focus to the menu when opened', () => {
      stubGrantsRequest({ role: 'admin' });
      cy.visit(PAGE_URL);
      cy.wait('@stubbedGrantsRequest');
      toggleMobileMenu();

      // Grabs the `<nav>` element associated with a label via `aria-labelledby`
      cy.get(mobileNavSelector).within(() =>
        cy.findByRole('navigation', { name: 'Main' }).should('have.focus'),
      );
    });

    it('closes when hitting the escape key', () => {
      stubGrantsRequest({ role: 'admin' });
      cy.visit(PAGE_URL);
      cy.wait('@stubbedGrantsRequest');
      toggleMobileMenu();

      cy.get('body').type('{esc}');

      cy.get(mobileNavSelector).within(() => {
        cy.findByLabelText('Main').should('not.be.visible');
        cy.findByRole('button', { name: 'Menu' }).should('have.focus');
      });
    });
  });

  describe('account settings dropdown', () => {
    function toggleAccountMenu() {
      cy.findByRole('button', { name: 'Account Menu' }).click({ force: true });
    }

    it("renders the user's initials inside the account popover trigger", () => {
      cy.visit(PAGE_URL);

      cy.get(accountPopoverTriggerSelector).should('contain', 'UT');
    });

    it('renders an icon if no user first name and last name are returned for the current user', () => {
      cy.stubRequest({
        url: `/api/v1/users/${USERNAME}`,
        fixture: 'users/200.get.no-first-or-last-names.json',
        requestAlias: 'userRequest',
      });
      cy.visit(PAGE_URL);
      cy.wait('@userRequest');

      cy.get(accountPopoverTriggerSelector).should('not.contain', 'UT');
      cy.get(accountPopoverTriggerSelector).within(() => cy.get('svg').should('be.visible'));
    });

    it('renders an icon if a first name is missing from the current user', () => {
      cy.stubRequest({
        url: `/api/v1/users/${USERNAME}`,
        fixture: 'users/200.get.no-first-name.json',
        requestAlias: 'userRequest',
      });
      cy.visit(PAGE_URL);
      cy.wait('@userRequest');

      cy.get(accountPopoverTriggerSelector).should('not.contain', 'UT');
      cy.get(accountPopoverTriggerSelector).within(() => cy.get('svg').should('be.visible'));
    });

    it('renders an icon if a last name is missing from the current user', () => {
      cy.stubRequest({
        url: `/api/v1/users/${USERNAME}`,
        fixture: 'users/200.get.no-last-name.json',
        requestAlias: 'userRequest',
      });
      cy.visit(PAGE_URL);
      cy.wait('@userRequest');

      cy.get(accountPopoverTriggerSelector).should('not.contain', 'UT');
      cy.get(accountPopoverTriggerSelector).within(() => cy.get('svg').should('be.visible'));
    });

    it('renders relevant account settings links when opened', () => {
      cy.visit(PAGE_URL);
      toggleAccountMenu();

      cy.get(accountActionlistSelector).within(() => {
        cy.verifyLink({ content: 'Profile', href: '/account/profile' });
        cy.verifyLink({ content: 'Account Settings', href: '/account/settings' });
        cy.verifyLink({ content: 'Billing', href: '/account/billing' });
        cy.verifyLink({ content: 'Users', href: '/account/users' });
        cy.verifyLink({ content: 'Subaccounts', href: '/account/subaccounts' });
        cy.verifyLink({ content: 'Alerts', href: '/alerts' });
        cy.verifyLink({ content: 'API Docs', href: 'https://developers.sparkpost.com/api' });
      });
    });

    it('closes the action list when a link or button within the list is clicked', () => {
      cy.visit(PAGE_URL);
      toggleAccountMenu();

      cy.get(accountActionlistSelector).within(() => {
        cy.findByRole('link', { name: 'Profile' }).click();
      });
      cy.get(accountActionlistSelector).should('not.exist');

      toggleAccountMenu();
      cy.get(accountActionlistSelector).within(() => {
        cy.findByRole('button', { name: 'Help' }).click();
      });

      cy.get(accountActionlistSelector).should('not.exist');
    });

    it('renders with relevant items as a templates user', () => {
      stubGrantsRequest({ role: 'templates' });
      cy.visit(PAGE_URL);
      cy.wait('@stubbedGrantsRequest');
      toggleAccountMenu();

      cy.findByDataId('popover-content').within(() => {
        cy.findByText('mockuser@example.com').should('be.visible');
        cy.findByText('107').should('be.visible'); // The user's Customer ID
      });

      cy.get(accountActionlistSelector).within(() => {
        cy.verifyLink({ content: 'Profile', href: '/account/profile' });
        cy.verifyLink({ content: 'Alerts', href: '/alerts' });
        cy.findByRole('button', { name: 'Help' }).should('be.visible');
        cy.verifyLink({ content: 'API Docs', href: 'https://developers.sparkpost.com/api' });
        cy.verifyLink({ content: 'Log Out', href: '/logout' });
      });
    });

    it('renders with relevant items as a reporting user', () => {
      stubGrantsRequest({ role: 'reporting' });
      cy.visit(PAGE_URL);
      cy.wait('@stubbedGrantsRequest');
      toggleAccountMenu();

      cy.findByDataId('popover-content').within(() => {
        cy.findByText('mockuser@example.com').should('be.visible');
        cy.findByText('107').should('be.visible'); // The user's Customer ID
      });

      cy.get(accountActionlistSelector).within(() => {
        cy.verifyLink({ content: 'Profile', href: '/account/profile' });
        cy.verifyLink({ content: 'Alerts', href: '/alerts' });
        cy.findByRole('button', { name: 'Help' }).should('be.visible');
        cy.verifyLink({ content: 'API Docs', href: 'https://developers.sparkpost.com/api' });
        cy.verifyLink({ content: 'Log Out', href: '/logout' });
      });
    });

    it('renders with a relevant items as a developer user', () => {
      stubGrantsRequest({ role: 'developer' });
      cy.visit(PAGE_URL);
      cy.wait('@stubbedGrantsRequest');
      toggleAccountMenu();

      cy.findByDataId('popover-content').within(() => {
        cy.findByText('mockuser@example.com').should('be.visible');
        cy.findByText('107').should('be.visible'); // The user's Customer ID
      });

      cy.get(accountActionlistSelector).within(() => {
        cy.verifyLink({ content: 'Profile', href: '/account/profile' });
        cy.verifyLink({ content: 'Subaccounts', href: '/account/subaccounts' });
        cy.verifyLink({ content: 'Alerts', href: '/alerts' });
        cy.findByRole('button', { name: 'Help' }).should('be.visible');
        cy.verifyLink({ content: 'API Docs', href: 'https://developers.sparkpost.com/api' });
        cy.verifyLink({ content: 'Log Out', href: '/logout' });
        cy.verifyLink({ content: 'Log Out', href: '/logout' });
      });
    });

    it('renders with the "Upgrade" link when the user is on a free plan', () => {
      stubGrantsRequest({ role: 'admin' });
      cy.stubRequest({
        url: '/api/v1/account*',
        fixture: 'account/200.get.free-plan.json',
        requestAlias: 'stubbedAccountsRequest',
      });
      cy.visit(PAGE_URL);
      cy.wait(['@stubbedAccountsRequest', '@stubbedGrantsRequest']);
      toggleAccountMenu();

      cy.get(accountActionlistSelector).within(() => {
        cy.findByRole('link', { name: 'Billing / Upgrade' }).should('be.visible');
      });
    });
  });
});

function stubGrantsRequest({ role }) {
  cy.stubRequest({
    url: '/api/v1/authenticate/grants*',
    fixture: `authenticate/grants/200.get.${role}.json`,
    requestAlias: 'stubbedGrantsRequest',
  });
}
