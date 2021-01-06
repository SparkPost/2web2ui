import { IS_HIBANA_ENABLED } from 'cypress/constants';
const PAGE_URL = '/lists/recipient-lists';
const API_URL = '/api/v1/recipient-lists';

function stubRecipientLists({ fixture = 'recipient-lists/200.get.json', statusCode } = {}) {
  return cy.stubRequest({
    url: API_URL,
    fixture,
    statusCode,
    requestAlias: 'recipientLists',
  });
}

function stubAccountsReq({ fixture = 'account/200.get.has-empty-states.json' } = {}) {
  cy.stubRequest({
    url: '/api/v1/account**',
    fixture: fixture,
    requestAlias: 'accountReq',
  });
}

describe('The recipient lists page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });

  it('has a relevant page title', () => {
    stubRecipientLists();
    cy.visit(PAGE_URL);
    cy.wait('@recipientLists');

    cy.title().should('include', 'Recipient Lists | SparkPost');
    cy.findByRole('heading', { name: 'Recipient Lists' }).should('be.visible');
  });

  it('renders with a link to the create recipient list page', () => {
    stubRecipientLists();
    cy.visit(PAGE_URL);
    cy.wait('@recipientLists');

    cy.verifyLink({
      content: 'Create Recipient List',
      href: '/lists/recipient-lists/create',
    });
  });

  it('renders an error banner when the server returns one', () => {
    stubRecipientLists({ fixture: 'recipient-lists/400.get.json', statusCode: 400 });
    cy.visit(PAGE_URL);
    cy.wait('@recipientLists');

    cy.findByText('An error occurred').should('be.visible');
    cy.findByText('Sorry, we ran into an error loading Recipient Lists').should('be.visible');
    cy.findByText('Try Again').should('be.visible');
    cy.get('table').should('not.exist');

    stubRecipientLists();
    cy.findByRole('button', { name: 'Try Again' }).click();
    cy.wait('@recipientLists');
    cy.get('table').should('be.visible');
  });

  if (IS_HIBANA_ENABLED) {
    it('renders the empty state banner when "allow_empty_states" is set on the account and banner has not been dismissed', () => {
      stubRecipientLists();
      stubAccountsReq();
      cy.visit(PAGE_URL);
      cy.wait(['@accountReq', '@recipientLists']);

      cy.findByRole('heading', { name: 'Organize Recipients' }).should('be.visible');
      cy.verifyLink({
        content: 'Recipient Lists Documentation',
        href: 'https://developers.sparkpost.com/api/recipient-lists/',
      });
    });
    it('renders the empty state when there are no recipient lists', () => {
      stubRecipientLists({ fixture: '200.get.no-results.json' });
      stubAccountsReq();
      cy.visit(PAGE_URL);
      cy.wait(['@accountReq', '@recipientLists']);
      cy.findByRole('heading', { name: 'Recipient Lists' }).should('be.visible');
      cy.findByText(
        'A recipient list is a collection of recipients that can be used in a transmission. When sending email to multiple recipients, it’s best to put them in a recipient list. This is particularly true when sending multiple emails to the same recipients.',
      ).should('be.visible');
      cy.verifyLink({
        content: 'Create Recipient List',
        href: '/lists/recipient-lists/create',
      });
      cy.verifyLink({
        content: 'Recipient Lists Documentation',
        href: 'https://developers.sparkpost.com/api/recipient-lists/',
      });
    });
  }
});
