const PAGE_URL = '/account/profile';

describe('The profile page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });

  it('renders with a relevant page title ', () => {
    cy.visit(PAGE_URL);
    cy.title().should('include', 'My Profile | SparkPost');
    cy.findByRole('heading', { name: 'Profile' }).should('be.visible');
  });
  it('renders Reset 2FA button if tfa is required on the account and clicking on the Reset button opens the reset 2FA modal', () => {
    stubAccountsReq();
    stubTwofaReq();
    stubTwofaBackupReq();
    cy.visit(PAGE_URL);
    cy.wait(['@accountReq', '@twoFactorBackupReq', 'twoFactorReq']);
    cy.findByRole('button', { name: 'Reset 2FA' }).should('be.visible');
    cy.findByRole('button', { name: 'Reset 2FA' }).click();
    cy.withinModal(() => {
      cy.findAllByText('Reset Two-Factor Authentication').should('be.visible');
      cy.findByRole('button', { name: 'Reset 2FA' }).should('be.visible');
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

function stubTwofaBackupReq({ fixture = 'users/two-factor/backup/200.get.enabled.json' } = {}) {
  cy.stubRequest({
    url: '/api/v1/users/mockuser/two-factor/backup',
    fixture: fixture,
    requestAlias: 'twoFactorBackupReq',
  });
}

function stubTwofaReq({ fixture = 'users/two-factor/200.get.enabled.json' } = {}) {
  cy.stubRequest({
    url: '/api/v1/users/mockuser/two-factor',
    fixture: fixture,
    requestAlias: 'twoFactorReq',
  });
}
