import { IS_HIBANA_ENABLED } from 'cypress/constants';
const SUBACCOUNT_API_URL = '/api/v1/subaccounts';
const PAGE_URL = '/account/subaccounts';

function stubSubaccount({ fixture = 'subaccounts/200.get.json', statusCode } = {}) {
  return cy.stubRequest({
    url: SUBACCOUNT_API_URL,
    fixture,
    statusCode,
    requestAlias: 'subaccounts',
  });
}

function stubAccountsReq({ fixture = 'account/200.get.has-empty-states.json' } = {}) {
  cy.stubRequest({
    url: '/api/v1/account**',
    fixture: fixture,
    requestAlias: 'accountReq',
  });
}

describe('The subaccounts list page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });

  it('has a relevant page title', () => {
    stubSubaccount();
    cy.visit(PAGE_URL);
    cy.title().should('include', 'Subaccounts');
  });

  if (IS_HIBANA_ENABLED) {
    it('does not render the empty state banner when "allow_empty_states" is not set', () => {
      stubSubaccount({ fixture: '200.get.no-results.json' });
      cy.visit(PAGE_URL);
      cy.wait(['@subaccounts']);
      cy.title().should('include', 'Subaccounts');
      cy.findByRole('heading', { name: 'Manage your subaccounts' }).should('be.visible');
    });

    it('renders the empty state banner when "allow_empty_states" is set on the account and banner has not been dismissed', () => {
      stubSubaccount({ fixture: '200.get.no-results.json' });
      stubAccountsReq();
      cy.visit(PAGE_URL);
      cy.wait(['@subaccounts']);
      cy.title().should('include', 'Subaccounts');
      cy.findByRole('heading', { name: 'Subaccounts' }).should('be.visible');
    });

    it('renders the empty state when there are no subaccounts', () => {
      stubSubaccount({ fixture: '200.get.no-results.json' });
      stubAccountsReq();
      cy.visit(PAGE_URL);
      cy.wait(['@subaccounts']);
      cy.title().should('include', 'Subaccounts');
      cy.findByRole('heading', { name: 'Subaccounts' }).should('be.visible');
    });
  }
});
