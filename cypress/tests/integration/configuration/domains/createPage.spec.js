import { IS_HIBANA_ENABLED, USERNAME } from 'cypress/constants';
import { LINKS } from 'src/constants';

const PAGE_URL = '/domains/create';

describe('The domains create page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });

  if (IS_HIBANA_ENABLED) {
    it('renders with a relevant page title and content', () => {
      commonBeforeSteps();

      cy.title().should('include', 'Add a Domain');
      cy.findByRole('heading', { name: 'Add a Domain' }).should('be.visible');
      cy.verifyLink({ content: 'All Domains', href: '/domains' });
      cy.findByRole('heading', { name: 'Domain Type' }).should('be.visible');
      cy.findByLabelText(/Sending Domain/g)
        .should('be.visible')
        .should('be.checked');
      cy.findByLabelText(/Tracking Domain/g).should('be.visible');
      cy.findByLabelText(/Bounce Domain/g).should('be.visible');
      cy.verifyLink({ href: LINKS.SENDING_REQS, content: 'Domains Documentation' });
      cy.findByRole('heading', { name: 'Domain and Assignment' }).should('be.visible');
      cy.findByLabelText('Domain').should('be.visible');
      cy.findByLabelText('Share with all Subaccounts')
        .should('be.visible')
        .should('be.checked');
      cy.findByLabelText('Assign to Master Account').should('be.visible');
      cy.findByLabelText('Assign to Subaccount').should('be.visible');
    });

    it('creates a new sending domain assigned to all subaccounts', () => {
      commonBeforeSteps();
      stubSendingDomainsPostReq();
      cy.stubRequest({
        url: '/api/v1/sending-domains/example.com',
        fixture: 'sending-domains/200.get.unverified-dkim.json',
        requestAlias: 'unverifieddkimSendingDomains',
      });

      cy.findByLabelText(/Sending Domain/g).check();
      cy.findByLabelText('Domain').type('example.com');
      cy.findByLabelText('Share with all Subaccounts').should('be.checked');
      cy.findByRole('button', { name: 'Save and Continue' }).click();

      cy.withinModal(() => {
        cy.findByText('Domain Alignment').should('be.visible');
        cy.findByLabelText('Yes').should('be.checked');
        cy.findByRole('button', { name: 'Save and Continue' }).click();
      });

      cy.wait('@sendingDomainsReq').then(xhr => {
        const { domain, shared_with_subaccounts } = xhr.request.body;

        cy.wrap(domain).should('be.eq', 'example.com');
        cy.wrap(shared_with_subaccounts).should('be.eq', true);
      });

      cy.wait('@unverifieddkimSendingDomains');

      cy.findByText('Sending Domain example.com created').should('be.visible');
      cy.url().should('include', '/domains/details/example.com/verify-sending');
      cy.title().should('include', 'Verify Sending/Bounce Domain | Domains');
      cy.findByRole('heading', { name: 'Verify Sending/Bounce Domain' }).should('be.visible');
    });

    it('creates a new sending domain for the Assign to Master Account', () => {
      commonBeforeSteps();
      stubSendingDomainsPostReq();
      cy.stubRequest({
        url: '/api/v1/sending-domains/example.com',
        fixture: 'sending-domains/200.get.unverified-dkim.json',
        requestAlias: 'unverifieddkimSendingDomains',
      });

      cy.findByLabelText(/Sending Domain/g).check();
      cy.findByLabelText('Domain').type('example.com');
      cy.findByLabelText('Assign to Master Account').check({ force: true }); // `force` required to workaround Matchbox CSS implementation
      cy.findByRole('button', { name: 'Save and Continue' }).click();

      cy.withinModal(() => {
        cy.findByText('Domain Alignment').should('be.visible');
        cy.findByLabelText('No').check({ force: true });
        cy.findByRole('button', { name: 'Save and Continue' }).click();
      });

      cy.wait('@sendingDomainsReq').then(xhr => {
        const { domain, shared_with_subaccounts } = xhr.request.body;

        cy.wrap(domain).should('be.eq', 'example.com');
        cy.wrap(shared_with_subaccounts).should('be.eq', false);
      });
      cy.wait('@unverifieddkimSendingDomains');

      cy.findByText('Sending Domain example.com created').should('be.visible');
      cy.url().should('include', '/domains/details/example.com/verify-sending');
      cy.title().should('include', 'Verify Sending Domain | Domains');
      cy.findByRole('heading', { name: 'Verify Sending Domain' }).should('be.visible');
    });

    it('creates a new sending domain for the assigned subaccount', () => {
      commonBeforeSteps();
      stubSendingDomainsPostReq();
      stubSubaccountsReq();
      cy.stubRequest({
        url: '/api/v1/sending-domains/example.com',
        fixture: 'sending-domains/200.get.unverified-dkim.json',
        requestAlias: 'unverifieddkimSendingDomains',
      });

      cy.findByLabelText(/Sending Domain/g).check();
      cy.findByLabelText('Domain').type('example.com');
      cy.findByLabelText('Assign to Subaccount').check({ force: true }); // `force` required to workaround Matchbox CSS implementation
      cy.wait('@subaccountsReq');
      cy.findByLabelText('Subaccount').click();
      cy.findByRole('option', { name: /Fake Subaccount 1/g }).click();
      cy.findByRole('button', { name: 'Save and Continue' }).click();

      cy.withinModal(() => {
        cy.findByText('Domain Alignment').should('be.visible');
        cy.findByLabelText('Yes').should('be.checked');
        cy.findByRole('button', { name: 'Save and Continue' }).click();
      });

      cy.wait('@sendingDomainsReq').then(xhr => {
        const { domain, shared_with_subaccounts } = xhr.request.body;

        cy.wrap(domain).should('be.eq', 'example.com');
        cy.wrap(shared_with_subaccounts).should('be.eq', false);
        cy.wrap(xhr.request.headers['x-msys-subaccount']).should('be.eq', 101);
      });
      cy.wait('@unverifieddkimSendingDomains');
      cy.findByText('Sending Domain example.com created').should('be.visible');
      cy.url().should('include', '/domains/details/example.com/verify-sending');
      cy.title().should('include', 'Verify Sending/Bounce Domain | Domains');
      cy.findByRole('heading', { name: 'Verify Sending/Bounce Domain' }).should('be.visible');
    });

    it('handles sending domain creation errors', () => {
      commonBeforeSteps();
      cy.stubRequest({
        url: '/api/v1/sending-domains',
        method: 'POST',
        statusCode: 400,
        fixture: '400.json',
        requestAlias: 'sendingDomainsReq',
      });

      cy.findByLabelText(/Sending Domain/g).check();
      cy.findByLabelText('Domain').type('example.com');
      cy.findByRole('button', { name: 'Save and Continue' }).click();

      cy.withinModal(() => {
        cy.findByText('Domain Alignment').should('be.visible');
        cy.findByLabelText('Yes').should('be.checked');
        cy.findByRole('button', { name: 'Save and Continue' }).click();
      });

      cy.wait('@sendingDomainsReq');

      cy.findByText('Something went wrong.').should('be.visible');
      cy.findByText('View Details').click();
      cy.findByText('This is an error').should('be.visible');
    });

    it('creates a new bounce domain assigned to all subaccounts', () => {
      commonBeforeSteps();
      stubSendingDomainsPostReq();
      cy.stubRequest({
        url: '/api/v1/sending-domains/example.com',
        fixture: 'sending-domains/200.get.unverified-dkim.json',
        requestAlias: 'unverifieddkimSendingDomains',
      });

      cy.findByLabelText(/Bounce Domain/g).check({ force: true });
      cy.findByLabelText('Domain').type('example.com');
      cy.findByLabelText('Share with all Subaccounts').should('be.checked');
      cy.findByRole('button', { name: 'Save and Continue' }).click();

      cy.wait('@sendingDomainsReq').then(xhr => {
        const { domain, shared_with_subaccounts } = xhr.request.body;

        cy.wrap(domain).should('be.eq', 'example.com');
        cy.wrap(shared_with_subaccounts).should('be.eq', true);
      });
      cy.wait('@unverifieddkimSendingDomains');
      cy.findByText('Bounce Domain example.com created').should('be.visible');
      cy.url().should('include', '/domains/details/example.com/verify-bounce');
      cy.title().should('include', 'Verify Bounce Domain | Domains');
      cy.findByRole('heading', { name: 'Verify Bounce Domain' }).should('be.visible');
    });
    it('creates a new bounce domain for the Assign to Master Account', () => {
      commonBeforeSteps();
      stubSendingDomainsPostReq();
      cy.stubRequest({
        url: '/api/v1/sending-domains/example.com',
        fixture: 'sending-domains/200.get.unverified-dkim.json',
        requestAlias: 'unverifieddkimSendingDomains',
      });

      cy.findByLabelText(/Bounce Domain/g).check({ force: true });
      cy.findByLabelText('Domain').type('example.com');
      cy.findByLabelText('Assign to Master Account').check({ force: true }); // `force` required to workaround Matchbox CSS implementation
      cy.findByRole('button', { name: 'Save and Continue' }).click();

      cy.wait('@sendingDomainsReq').then(xhr => {
        const { domain, shared_with_subaccounts } = xhr.request.body;

        cy.wrap(domain).should('be.eq', 'example.com');
        cy.wrap(shared_with_subaccounts).should('be.eq', false);
      });
      cy.wait('@unverifieddkimSendingDomains');

      cy.findByText('Bounce Domain example.com created').should('be.visible');
      cy.url().should('include', '/domains/details/example.com/verify-bounce');
      cy.title().should('include', 'Verify Bounce Domain | Domains');
      cy.findByRole('heading', { name: 'Verify Bounce Domain' }).should('be.visible');
    });
    it('creates a new Bounce domain for the assigned subaccount', () => {
      commonBeforeSteps();
      stubSendingDomainsPostReq();
      stubSubaccountsReq();
      cy.stubRequest({
        url: '/api/v1/sending-domains/example.com',
        fixture: 'sending-domains/200.get.unverified-dkim.json',
        requestAlias: 'unverifieddkimSendingDomains',
      });

      cy.findByLabelText(/Bounce Domain/g).check({ force: true });
      cy.findByLabelText('Domain').type('example.com');
      cy.findByLabelText('Assign to Subaccount').check({ force: true }); // `force` required to workaround Matchbox CSS implementation
      cy.wait('@subaccountsReq');
      cy.findByLabelText('Subaccount').click();
      cy.findByRole('option', { name: /Fake Subaccount 1/g }).click();
      cy.findByRole('button', { name: 'Save and Continue' }).click();

      cy.wait('@sendingDomainsReq').then(xhr => {
        const { domain, shared_with_subaccounts } = xhr.request.body;

        cy.wrap(domain).should('be.eq', 'example.com');
        cy.wrap(shared_with_subaccounts).should('be.eq', false);
        cy.wrap(xhr.request.headers['x-msys-subaccount']).should('be.eq', 101);
      });
      cy.wait('@unverifieddkimSendingDomains');

      cy.findByText('Bounce Domain example.com created').should('be.visible');
      cy.url().should('include', '/domains/details/example.com/verify-bounce');
      cy.title().should('include', 'Verify Bounce Domain | Domains');
      cy.findByRole('heading', { name: 'Verify Bounce Domain' }).should('be.visible');
    });
    it('creates a new tracking domain', () => {
      commonBeforeSteps();
      stubTrackingDomainsPostReq();
      cy.stubRequest({
        url: '/api/v1/tracking-domains',
        fixture: 'tracking-domains/200.get.domain-details.json',
        requestAlias: 'trackingDomainsList',
      });

      cy.findByLabelText(/Tracking Domain/g).check({ force: true });
      cy.findByLabelText('Domain').type('example.com');
      cy.findByLabelText('Share with all Subaccounts').should('not.exist'); // This field is hidden when "Tracking Domains" is selected as the primary use
      cy.findByLabelText('Assign to Master Account').should('be.checked');
      cy.findByRole('button', { name: 'Save and Continue' }).click();

      cy.wait('@trackingDomainsReq').then(xhr => {
        const { domain } = xhr.request.body;

        cy.wrap(domain).should('be.eq', 'example.com');
      });
      cy.wait('@trackingDomainsList');

      cy.findByText('Successfully added example.com').should('be.visible');
      cy.url().should('include', '/domains/details/example.com/verify-tracking');
      cy.title().should('include', 'Verify Tracking Domain | Domains');
      cy.findByRole('heading', { name: 'Verify Tracking Domain' }).should('be.visible');
    });

    it('handles tracking domain creation errors', () => {
      commonBeforeSteps();
      cy.stubRequest({
        url: '/api/v1/tracking-domains',
        method: 'POST',
        statusCode: 400,
        fixture: '400.json',
        requestAlias: 'trackingDomainsReq',
      });

      cy.findByLabelText(/Tracking Domain/g).check({ force: true });
      cy.findByLabelText('Domain').type('example.com');
      cy.findByRole('button', { name: 'Save and Continue' }).click();

      cy.wait('@trackingDomainsReq');

      cy.findByText('Something went wrong.').should('be.visible');
      cy.findByText('View Details').click();
      cy.findByText('This is an error').should('be.visible');
    });

    it('creates a new tracking domain assigned to a subaccount', () => {
      commonBeforeSteps();
      stubTrackingDomainsPostReq();
      stubSubaccountsReq();
      cy.stubRequest({
        url: '/api/v1/tracking-domains',
        fixture: 'tracking-domains/200.get.domain-details.json',
        requestAlias: 'trackingDomainsList',
      });

      cy.findByLabelText(/Tracking Domain/g).check({ force: true });
      cy.findByLabelText('Domain').type('example.com');
      cy.findByLabelText('Assign to Subaccount').check({ force: true }); // `force` required to workaround Matchbox CSS implementation
      cy.wait('@subaccountsReq');
      cy.findByLabelText('Subaccount').click();
      cy.findByRole('option', { name: /Fake Subaccount 1/g }).click();
      cy.findByRole('button', { name: 'Save and Continue' }).click();

      cy.wait('@trackingDomainsReq').then(xhr => {
        const { domain } = xhr.request.body;

        cy.wrap(domain).should('be.eq', 'example.com');
        cy.wrap(xhr.request.headers['x-msys-subaccount']).should('be.eq', 101);
      });
      cy.wait('@trackingDomainsList');

      cy.findByText('Successfully added example.com').should('be.visible');
      cy.url().should('include', '/domains/details/example.com/verify-tracking');
      cy.title().should('include', 'Verify Tracking Domain | Domains');
      cy.findByRole('heading', { name: 'Verify Tracking Domain' }).should('be.visible');
    });

    it('renders form validation errors when skipping required fields', () => {
      commonBeforeSteps();

      cy.findByLabelText('Assign to Subaccount').check({ force: true });
      cy.findByRole('button', { name: 'Save and Continue' }).click();
      cy.findByText('A valid domain is required.').should('be.visible');
      cy.findByText('A valid subdomain is required.').should('be.visible');
    });

    it('does not render "Subaccount Assignment" when the user\'s account does not have subaccounts', () => {
      cy.stubRequest({
        url: `/api/v1/users/${USERNAME}`,
        fixture: 'users/200.get.no-subaccounts.json',
        requestAlias: 'currentUserReq',
      });
      cy.stubRequest({
        url: '/api/v1/account',
        fixture: 'account/200.get.json',
        requestAlias: 'accountDomainsReq',
      });
      cy.visit(PAGE_URL);
      cy.wait(['@currentUserReq', '@accountDomainsReq']);

      cy.findByLabelText(/Sending Domain/g).should('be.visible');
      cy.findByLabelText(/Tracking Domain/g).should('be.visible');
      cy.findByLabelText('Domain').should('be.visible');
      cy.findByText('Subaccount Assignment').should('not.exist');
    });
  }

  if (!IS_HIBANA_ENABLED) {
    it('renders the 404 page when the user does not have Hibana enabled', () => {
      cy.visit(PAGE_URL);

      cy.findByRole('heading', { name: 'Page Not Found' }).should('be.visible');
    });
  }
});

function commonBeforeSteps() {
  cy.stubRequest({
    url: '/api/v1/account',
    fixture: 'account/200.get.json',
    requestAlias: 'accountDomainsReq',
  });
  cy.visit(PAGE_URL);
  cy.wait('@accountDomainsReq');
}

function stubSendingDomainsPostReq() {
  cy.stubRequest({
    url: '/api/v1/sending-domains',
    method: 'POST',
    fixture: 'sending-domains/200.post.json',
    requestAlias: 'sendingDomainsReq',
  });
}

function stubTrackingDomainsPostReq() {
  cy.stubRequest({
    url: '/api/v1/tracking-domains',
    method: 'POST',
    fixture: 'tracking-domains/200.post.json',
    requestAlias: 'trackingDomainsReq',
  });
}

function stubSubaccountsReq() {
  cy.stubRequest({
    url: '/api/v1/subaccounts',
    fixture: 'subaccounts/200.get.json',
    requestAlias: 'subaccountsReq',
  });
}
