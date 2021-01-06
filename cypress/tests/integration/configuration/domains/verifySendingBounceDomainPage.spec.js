import { IS_HIBANA_ENABLED } from 'cypress/constants';

const PAGE_URL = '/domains/details/fake-domain.com/verify-sending-bounce';

describe('The verify sending/bounce domain page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });

  if (IS_HIBANA_ENABLED) {
    describe('Verify Sending/Bounce Domain Page', () => {
      beforeEach(() => {
        cy.stubRequest({
          url: '/api/v1/account',
          fixture: 'account/200.get.json',
          requestAlias: 'accountDomainsReq',
        });
      });

      it('renders with a relevant page title', () => {
        cy.stubRequest({
          url: '/api/v1/sending-domains/sending-bounce.net',
          fixture: 'sending-domains/200.get.unverified-dkim-bounce.json',
          requestAlias: 'unverifiedDkimBounce',
        });

        cy.visit('/domains/details/sending-bounce.net/verify-sending-bounce');
        cy.wait(['@accountDomainsReq', '@unverifiedDkimBounce']);

        cy.title().should('include', 'Verify Sending/Bounce Domain');
        cy.findByRole('heading', { name: 'Verify Sending/Bounce Domain' }).should('be.visible');
      });

      it('renders sections correclty in case of unverified sending/bounce domain', () => {
        cy.stubRequest({
          url: '/api/v1/sending-domains/sending-bounce.net',
          fixture: 'sending-domains/200.get.unverified-dkim-bounce.json',
          requestAlias: 'unverifiedDkimBounce',
        });
        cy.stubRequest({
          method: 'POST',
          url: '/api/v1/sending-domains/sending-bounce.net/verify',
          fixture: 'sending-domains/verify/200.post.json',
          requestAlias: 'verifyDomain',
        });

        cy.visit('/domains/details/sending-bounce.net/verify-sending-bounce');
        cy.wait(['@accountDomainsReq', '@unverifiedDkimBounce']);
        cy.findByRole('heading', { name: 'DNS Verification' }).should('be.visible');
        cy.findByRole('heading', { name: 'Add DKIM Record' }).should('be.visible');
        cy.findByRole('heading', { name: 'Add Bounce Record' }).should('be.visible');
        cy.findByRole('button', { name: 'Verify Domain' }).should('be.visible');
      });

      it('clicking on the Verify Domain renders success message on succesful verification of dkim and cname of domain and renders correct section titles after', () => {
        cy.stubRequest({
          url: '/api/v1/sending-domains/sending-bounce.net',
          fixture: 'sending-domains/200.get.unverified-dkim-bounce.json',
          requestAlias: 'unverifiedDkimBounce',
        });
        cy.stubRequest({
          method: 'POST',
          url: '/api/v1/sending-domains/sending-bounce.net/verify',
          fixture: 'sending-domains/verify/200.post.json',
          requestAlias: 'verifyDomain',
        });

        cy.visit('/domains/details/sending-bounce.net/verify-sending-bounce');
        cy.wait(['@accountDomainsReq', '@unverifiedDkimBounce']);

        cy.verifyLink({
          content: 'Forward to Colleague',
          href: `mailto:?subject=Assistance%20Requested%20Verifying%20a%20Sending/Bounce%20Domain%20on%20SparkPost&body=mockuser%20has%20requested%20your%20assistance%20verifying%20a%20sending/bounce%20domain%20with%20SparkPost.%20Follow%20the%20link%20below%20to%20find%20the%20values%20you%E2%80%99ll%20need%20to%20add%20to%20the%20settings%20of%20your%20DNS%20provider.%0D%0A%5BGo%20to%20SparkPost%5D(${
            Cypress.config().baseUrl
          }/domains/details/sending-bounce.net/verify-sending-bounce)%0D%0A`,
        });

        cy.findByLabelText('The TXT and CNAME records have been added to the DNS provider.').check({
          force: true,
        });
        cy.findByRole('button', { name: 'Verify Domain' }).click();
        cy.wait('@verifyDomain');
        cy.findAllByText('You have successfully verified DKIM record of sending-bounce.net').should(
          'be.visible',
        );
        cy.findAllByText(
          'You have successfully verified cname record of sending-bounce.net',
        ).should('be.visible');
        cy.findByRole('heading', { name: 'TXT record for DKIM' }).should('be.visible');
        cy.findByRole('heading', { name: 'CNAME record for Bounce' }).should('be.visible');
      });

      it('Verify Domain submit button displays an error message until the user selects the confirmation checkbox', () => {
        cy.stubRequest({
          url: '/api/v1/sending-domains/sending-bounce.net',
          fixture: 'sending-domains/200.get.unverified-dkim-bounce.json',
          requestAlias: 'unverifiedDkimBounce',
        });

        cy.visit('/domains/details/sending-bounce.net/verify-sending-bounce');
        cy.wait(['@accountDomainsReq', '@unverifiedDkimBounce']);

        cy.findByRole('button', { name: 'Verify Domain' }).should('be.visible');

        cy.findAllByText('The TXT and CNAME records have been added to the DNS provider.').should(
          'be.visible',
        );
        cy.findAllByText('The TXT and CNAME records have been added to the DNS provider.').should(
          'not.be.checked',
        );

        cy.findByRole('button', { name: 'Verify Domain' }).click({ force: true });

        cy.findAllByText('Please confirm you have added the records to your DNS provider.').should(
          'be.visible',
        );

        cy.findByLabelText('The TXT and CNAME records have been added to the DNS provider.').check({
          force: true,
        });

        cy.findAllByText('Please confirm you have added the records to your DNS provider.').should(
          'not.exist',
        );

        cy.findByRole('button', { name: 'Verify Domain' }).click();
      });
    });
  }

  if (!IS_HIBANA_ENABLED) {
    it('renders the 404 page when the user does not have Hibana enabled', () => {
      cy.visit(PAGE_URL);

      cy.findByRole('heading', { name: 'Page Not Found' }).should('be.visible');
    });
  }
});
