import { IS_HIBANA_ENABLED } from 'cypress/constants';
const PAGE_URL = '/snippets';
const API_URL = '/api/labs/snippets';

function stubSnippets({ fixture = 'snippets/200.get.json', statusCode } = {}) {
  return cy.stubRequest({
    url: API_URL,
    fixture,
    statusCode,
    requestAlias: 'snippetsReq',
  });
}

describe('The Snippets list page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });
  it('has a relevant page title', () => {
    stubSnippets();
    cy.visit(PAGE_URL);
    cy.wait('@snippetsReq');
    cy.title().should('include', 'Snippets | SparkPost');
    cy.findByRole('heading', { name: 'Snippets' }).should('be.visible');
  });
  it('renders with a link to the create page', () => {
    stubSnippets();
    cy.visit(PAGE_URL);
    cy.wait('@snippetsReq');

    cy.findByText('Create Snippet')
      .closest('a')
      .should('have.attr', 'href', '/snippets/create');
  });
  it('renders an error banner when the server returns one', () => {
    stubSnippets({ fixture: '400.json', statusCode: 400 });
    cy.visit(PAGE_URL);
    cy.wait('@snippetsReq');

    cy.findByText('An error occurred').should('be.visible');
    cy.findByText('Try Again').should('be.visible');
    cy.findByText('Show Error Details').click();
    cy.findByText('This is an error').should('be.visible');
    cy.get('table').should('not.exist');

    stubSnippets();
    cy.findByRole('button', { name: 'Try Again' }).click();
    cy.wait('@snippetsReq');
    cy.get('table').should('be.visible');
  });
  if (IS_HIBANA_ENABLED) {
    it('renders the empty state banner when "allow_empty_states" is set on the account and banner has not been dismissed', () => {
      stubSnippets();
      cy.visit(PAGE_URL);
      cy.wait(['@accountReq', '@snippetsReq']);

      cy.findByRole('heading', { name: 'Consistent Content, Easy' }).should('be.visible');
      cy.verifyLink({
        content: 'Snippets Documentation',
        href: 'https://developers.sparkpost.com/api/template-language/#header-snippets',
      });
    });
    it('renders the empty state when there are no ab tests', () => {
      stubSnippets({ fixture: '200.get.no-results.json' });
      cy.visit(PAGE_URL);
      cy.wait(['@accountReq', '@snippetsReq']);
      cy.findByRole('heading', { name: 'Snippets' }).should('be.visible');
      cy.findByText(
        'Snippets are modular, reusable content that can be imported into the HTML, Text, or AMP part of any email template. Snippets make it easy to create and maintain consistent content like footers and social share buttons across all emails.',
      ).should('be.visible');
      cy.findByRole('button', { name: 'Create Snippet' });
      cy.verifyLink({
        content: 'Snippets Documentation',
        href: 'https://developers.sparkpost.com/api/template-language/#header-snippets',
      });
    });
  }
});
