const PAGE_URL = '/account/settings';

describe('Account Settings Page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
    cy.stubRequest({
      url: '/api/v1/account/sso/saml',
      fixture: 'account/sso/200.get.saml.json',
      requestAlias: 'ssoSamlGet',
    });
    cy.stubRequest({
      url: '/api/v1/users/mockuser/two-factor',
      fixture: 'users/two-factor/200.get.json',
      requestAlias: 'twoFactorGet',
    });
  });
  it('renders with a relevant page title', () => {
    cy.visit(PAGE_URL);
    cy.title().should('include', 'Account settings');
  });
  //proof checks if the 2FA toggle is switched on for starter plans
  it('renders the two factor toggle and it is checked for starter plans', () => {
    cy.stubRequest({
      url: '/api/v1/account',
      fixture: 'account/200.get.100k-starter-plan.json',
      requestAlias: 'accountRequest',
    });
    cy.stubRequest({
      url: '/api/v1/billing/subscription',
      fixture: 'billing/subscription/200.get.starter-plan-higher-subaccounts-limitoverride.json',
      requestAlias: 'starterSubscription',
    });
    cy.visit(PAGE_URL);
    cy.wait(['@accountRequest', '@starterSubscription']);
    cy.findAllByText('Two-factor Authentication').should('be.visible');
    cy.findAllByRole('checkbox', { id: 'enforceTfa' })
      .first()
      .should('be.checked');
    cy.findAllByText(
      'All users must have two-factor authentication enabled to login to this account.',
    ).should('be.visible');
  });
  it('hides SSO Panel Section and tfa toggle is disabled and turned on when enforce_tfa_required is enabled', () => {
    stubAccountsReq({ fixture: 'account/200.get.enforce-tfa.json' });
    cy.visit(PAGE_URL);
    cy.findAllByRole('checkbox', { id: 'enforceTfa' })
      .first()
      .should('be.checked');
    cy.findAllByRole('checkbox', { id: 'enforceTfa' })
      .first()
      .should('be.disabled');
    cy.findAllByRole('heading', { name: 'Single Sign On' }).should('not.exist');
    cy.findByText('Two-factor authentication is required for your account.').should('be.visible');
  });

  describe('Single Sign On Panel', () => {
    describe('SCIM Token Section', () => {
      describe('Generate token flow -> when no prior token is present', () => {
        beforeEach(() => {
          cy.stubRequest({
            url: 'api/v1/api-keys?grant=scim/manage',
            fixture: 'api-keys/200.get.scim-token-notoken.json',
            requestAlias: 'oldScimTokenGet',
          });
          cy.visit(PAGE_URL);
        });

        it('renders correct message when no prior scim token is present', () => {
          cy.wait('@oldScimTokenGet');

          cy.findByText('No token generated').should('be.visible');
        });

        it('opens Generate SCIM token Modal when a token is not present and clicking on Continue dismisses the Modal and new token can be found', () => {
          cy.wait('@oldScimTokenGet');
          cy.stubRequest({
            method: 'POST',
            url: 'api/v1/api-keys',
            fixture: 'api-keys/200.post.json',
            requestAlias: 'scimTokenCreate',
          });
          cy.stubRequest({
            url: 'api/v1/api-keys?grant=scim/manage',
            fixture: 'api-keys/200.get.scim-token-newtoken.json',
            requestAlias: 'newScimTokenGet',
          });

          cy.findByRole('button', { name: 'Generate SCIM Token' }).click();
          cy.wait(['@scimTokenCreate', '@newScimTokenGet']);

          cy.withinModal(() => {
            cy.findByText('Generate SCIM Token').should('be.visible');
            cy.findByText('Make sure to copy your SCIM token now.').should('be.visible');
            cy.findByText('Continue').click();
          });

          cy.findByText('123f••••••••').should('be.visible');
          cy.findByText('Delete Token').should('be.visible');
        });
      });

      describe('Generate token flow -> when a token is already present', () => {
        beforeEach(() => {
          cy.stubRequest({
            url: 'api/v1/api-keys?grant=scim/manage',
            fixture: 'api-keys/200.get.scim-token.json',
            requestAlias: 'scimTokenGet',
          });
          cy.visit(PAGE_URL);
        });
        it('opens Override SCIM token Modal when a token is already present and clicking on Generate New Token opens Generate SCIM token Modal and clicking on Continue dismisses the Modal and new token can be found', () => {
          cy.findByText('old1••••••••').should('be.visible');
          cy.findByText('Generate SCIM Token').click();
          cy.stubRequest({
            method: 'POST',
            url: 'api/v1/api-keys',
            fixture: 'api-keys/200.post.json',
            fixtureAlias: 'scimTokenCreate',
            requestAlias: 'scimTokenCreate',
          });
          cy.stubRequest({
            url: 'api/v1/api-keys?grant=scim/manage',
            fixture: 'api-keys/200.get.scim-token-newtoken.json',
            fixtureAlias: 'newScimTokenGet',
            requestAlias: 'newScimTokenGet',
          });
          cy.stubRequest({
            url: 'api/v1/api-keys/oldid',
            method: 'DELETE',
            fixture: 'api-keys/200.get.scim-token-notoken.json',
            requestAlias: 'scimTokenDelete',
          });

          cy.withinModal(() => {
            cy.findByText('Override Your Current Token?').should('be.visible');
            cy.findByText('Generate New Token').click();
            cy.wait(['@scimTokenDelete', '@scimTokenCreate', '@newScimTokenGet']);
            cy.findByText('Continue').click();
          });
          cy.findByText('123f••••••••').should('be.visible');
        });
      });

      it('Delete Token flow for scim token', () => {
        cy.stubRequest({
          url: 'api/v1/api-keys?grant=scim/manage',
          fixture: 'api-keys/200.get.scim-token.json',
          requestAlias: 'scimTokenGet',
        });
        cy.visit(PAGE_URL);
        cy.findByText('old1••••••••').should('be.visible');
        cy.findByText('Delete Token').click();
        cy.withinModal(() => {
          cy.findAllByText('Delete SCIM Token').should('be.visible');
          cy.stubRequest({
            url: 'api/v1/api-keys/oldid',
            method: 'DELETE',
            fixture: 'api-keys/200.get.scim-token-notoken.json',
            requestAlias: 'scimTokenDelete',
          });
          cy.stubRequest({
            url: 'api/v1/api-keys?grant=scim/manage',
            fixture: 'api-keys/200.get.scim-token-notoken.json',
            requestAlias: 'scimTokenGet',
          });
          cy.get('button')
            .contains('Delete SCIM Token')
            .click();
          cy.wait(['@scimTokenDelete', '@scimTokenGet']);
        });
        cy.findByText('SCIM token deleted').should('be.visible');
        cy.findByText('No token generated').should('be.visible');
        cy.findByText('Delete token').should('not.exist');
      });
      it('modal close when any on the api errors out', () => {
        cy.stubRequest({
          url: 'api/v1/api-keys?grant=scim/manage',
          fixture: 'api-keys/200.get.scim-token.json',
          requestAlias: 'scimTokenGet',
        });
        cy.visit(PAGE_URL);
        cy.findByText('old1••••••••').should('be.visible');
        cy.findByText('Delete Token').click();
        cy.withinModal(() => {
          cy.findAllByText('Delete SCIM Token').should('be.visible');
          cy.stubRequest({
            url: 'api/v1/api-keys/oldid',
            method: 'DELETE',
            status: '401',
            fixture: 'api-keys/200.get.scim-token-notoken.json',
            requestAlias: 'scimTokenDelete',
          });
          cy.get('button')
            .contains('Delete SCIM Token')
            .click();
          cy.wait('@scimTokenDelete');
        });
        cy.findByText(
          'The token will be immediately and permanently removed. This cannot be undone.',
        ).should('not.exist');
      });
    });
  });
});

function stubAccountsReq({ fixture = 'account/200.get.tfa-required.json' } = {}) {
  cy.stubRequest({
    url: '/api/v1/account**',
    fixture: fixture,
    requestAlias: 'accountReq',
  });
}
