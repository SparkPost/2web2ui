const BASE_URL = '/domains/details/';

describe('The verify bounce domain page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });

  describe('Verify Bounce Domain Page', () => {
    beforeEach(() => {
      cy.stubRequest({
        url: '/api/v1/account',
        fixture: 'account/200.get.json',
        requestAlias: 'accountDomainsReq',
      });
    });

    it('renders with a relevant page title', () => {
      cy.stubRequest({
        url: '/api/v1/sending-domains/prd2.splango.net',
        fixture: 'sending-domains/200.get.unverified-bounce.json',
        requestAlias: 'unverifiedBounceDomains',
      });

      cy.visit(BASE_URL + 'prd2.splango.net/verify-bounce');

      cy.title().should('include', 'Verify Bounce Domain');
      cy.findByRole('heading', { name: 'Verify Bounce Domain' }).should('be.visible');
    });

    it('clicking on Verify Bounce, displays a success message', () => {
      cy.stubRequest({
        url: '/api/v1/sending-domains/prd2.splango.net',
        fixture: 'sending-domains/200.get.unverified-bounce.json',
        requestAlias: 'unverifiedBounceDomains',
      });
      cy.stubRequest({
        method: 'POST',
        url: '/api/v1/sending-domains/prd2.splango.net/verify',
        fixture: 'sending-domains/verify/200.post.json',
        requestAlias: 'verifyDomain',
      });
      cy.visit(BASE_URL + 'prd2.splango.net/verify-bounce');
      cy.wait(['@accountDomainsReq', '@unverifiedBounceDomains']);

      cy.verifyLink({
        content: 'Forward to Colleague',
        href: `mailto:?subject=Assistance%20Requested%20Verifying%20a%20Bounce%20Domain%20on%20SparkPost&body=mockuser%20has%20requested%20your%20assistance%20verifying%20a%20bounce%20domain%20with%20SparkPost.%20Follow%20the%20link%20below%20to%20find%20the%20values%20you%E2%80%99ll%20need%20to%20add%20to%20the%20settings%20of%20your%20DNS%20provider.%0D%0A%5BGo%20to%20SparkPost%5D(${
          Cypress.config().baseUrl
        }/domains/details/prd2.splango.net/verify-bounce)%0D%0A`,
      });

      cy.findAllByLabelText('The CNAME record has been added to the DNS provider.').click({
        force: true,
      });
      cy.findByRole('button', { name: 'Verify Bounce' }).click();
      cy.wait('@verifyDomain');
      cy.findAllByText('Successfully verified cname record of prd2.splango.net').should(
        'be.visible',
      );
    });
  });
});
