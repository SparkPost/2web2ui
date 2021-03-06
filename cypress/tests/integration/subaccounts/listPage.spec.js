import { CREATE_SUBACCOUNT } from 'src/constants';
import { USERNAME } from 'cypress/constants';
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

// this is an override of the stub set by stubAuth
function stubUsersRequest() {
  cy.stubRequest({
    url: `/api/v1/users/${USERNAME}`,
    fixture: `users/200.get.subaccount-banner-dismissed.json`,
    requestAlias: 'stubbedUsersRequest',
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

  it('does not renders the empty state banner when the banner has been dismissed', () => {
    stubSubaccount({ fixture: 'subaccounts/200.get.json' });
    stubUsersRequest(); // override for user ui option to turn off banner
    cy.visit(PAGE_URL);
    cy.wait(['@subaccounts']);
    cy.title().should('include', 'Subaccounts');
    cy.findByRole('heading', { name: 'Subaccounts' }).should('be.visible');
    cy.findByRole('heading', { name: 'Organize Sending and Analytics' }).should('not.exist');
    cy.findByText(
      'Subaccounts can be used to provision and manage senders separately from each other, and to provide assets and reporting data for each of them.',
    ).should('not.exist');
  });

  it('renders the empty state banner when the banner has not been dismissed', () => {
    stubSubaccount({ fixture: 'subaccounts/200.get.json' });
    cy.visit(PAGE_URL);
    cy.wait(['@subaccounts']);
    cy.title().should('include', 'Subaccounts');
    cy.findByRole('heading', { name: 'Subaccounts' }).should('be.visible');
    cy.findByRole('heading', { name: 'Organize Sending and Analytics' }).should('be.visible');
    cy.findByText(
      'Subaccounts can be used to provision and manage senders separately from each other, and to provide assets and reporting data for each of them.',
    ).should('be.visible');
    cy.verifyLink({
      content: 'Subaccounts Documentation',
      href: 'https://sparkpost.com/docs/user-guide/subaccounts/',
    });
  });

  it('renders the empty state when there are no subaccounts', () => {
    stubSubaccount({ fixture: '200.get.no-results.json' });
    cy.visit(PAGE_URL);
    cy.wait(['@subaccounts']);
    cy.title().should('include', 'Subaccounts');
    cy.findByRole('heading', { name: 'Subaccounts' }).should('be.visible');
    cy.get('p').contains(
      'Subaccounts can be used to provision and manage senders separately from each other, and to provide assets and reporting data for each of them. Subaccounts are great for service providers who send on behalf of others or for businesses that want to separate different streams of traffic.',
    );
    cy.findByText('Common uses for Subaccounts').should('be.visible');
    cy.findByText('Sending as a service provider for multiple unique customers.').should(
      'be.visible',
    );
    cy.findByText('Keeping unique internal business units independent from one another.').should(
      'be.visible',
    );
    cy.findByText(
      'Tracking mission critical campaign data separate from other mailstreams.',
    ).should('be.visible');
    cy.verifyLink({
      content: 'Create Subaccount',
      href: CREATE_SUBACCOUNT,
    });
    cy.verifyLink({
      content: 'Subaccounts Documentation',
      href: 'https://sparkpost.com/docs/user-guide/subaccounts/',
    });
  });
});
