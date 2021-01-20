import { IS_HIBANA_ENABLED } from 'cypress/constants';
const PAGE_URL = '/account/api-keys';
const API_URL = '/api/v1/api-keys';

function stubApiKeys({ fixture = 'api-keys/200.get.json', statusCode } = {}) {
  cy.stubRequest({
    url: API_URL,
    fixture,
    statusCode,
    requestAlias: 'apiKeys',
  });
  cy.stubRequest({
    url: '/api/v1/subaccounts',
    fixture: 'subaccounts/200.get.json',
  });
}

describe('The API Keys list page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });

  it('has a relevant page title', () => {
    stubApiKeys();
    cy.visit(PAGE_URL);
    cy.wait('@apiKeys');

    cy.title().should('include', 'API Keys | SparkPost');
    cy.findByRole('heading', { name: 'API Keys' }).should('be.visible');
  });

  it('renders with a link to the create page', () => {
    stubApiKeys();
    cy.visit(PAGE_URL);
    cy.wait('@apiKeys');

    cy.findByText('Create API Key')
      .closest('a')
      .should('have.attr', 'href', '/account/api-keys/create');
  });

  it('renders a banner with a new key and hides the new key on revisit', () => {
    stubApiKeys();
    cy.visit(PAGE_URL);
    cy.wait('@apiKeys');

    // Navigate to create and fill form
    cy.findByText('Create API Key').click();
    cy.findByLabelText('API Key Name').type('test-key');

    cy.stubRequest({
      method: 'POST',
      url: API_URL,
      fixture: 'api-keys/200.post.json',
    });

    // Submit and redirect
    cy.findAllByText('Create API Key')
      .last()
      .click();

    cy.findByText('this-is-a-fake-api-key').should('be.visible');
    cy.findByRole('heading', { name: 'New API Key' }).should('be.visible');

    // Simulates unmount
    cy.visit(PAGE_URL);
    cy.wait('@apiKeys');
    cy.findByRole('heading', { name: 'API Keys' }).should('be.visible');
    cy.findByText('this-is-a-fake-api-key').should('not.exist');
    cy.findByRole('heading', { name: 'New API Key' }).should('not.exist');
  });

  it('renders an error banner when the server returns one', () => {
    stubApiKeys({ fixture: '400.json', statusCode: 400 });
    cy.visit(PAGE_URL);
    cy.wait('@apiKeys');

    cy.findByText('An error occurred').should('be.visible');
    cy.findByText('Try Again').should('be.visible');
    cy.findByText('Show Error Details').click();
    cy.findByText('This is an error').should('be.visible');
    cy.get('table').should('not.exist');

    stubApiKeys();
    cy.findByRole('button', { name: 'Try Again' }).click();
    cy.wait('@apiKeys');
    cy.get('table').should('be.visible');
  });

  if (IS_HIBANA_ENABLED) {
    it('renders the empty state when "allow_empty_states" is set on the account', () => {
      stubApiKeys({ fixture: '200.get.no-results.json' });
      cy.visit(PAGE_URL);
      cy.wait(['@accountReq', '@apiKeys']);

      cy.findByRole('heading', { name: 'API Keys' }).should('be.visible');
      cy.findByText('API Keys Documentation')
        .closest('a')
        .should(
          'have.attr',
          'href',
          'https://www.sparkpost.com/docs/getting-started/create-api-keys/',
        );
    });
  }
});
