import { IS_HIBANA_ENABLED } from 'cypress/constants';
const PAGE_URL = '/ab-testing';
const API_URL = '/api/v1/ab-test';

function stubAbTest({ fixture = 'ab-test/200.get.json', statusCode } = {}) {
  return cy.stubRequest({
    url: API_URL,
    fixture,
    statusCode,
    requestAlias: 'abTest',
  });
}

describe('The A/B Testing list page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });
  it('has a relevant page title', () => {
    stubAbTest();
    cy.visit(PAGE_URL);
    cy.wait('@abTest');
    cy.title().should('include', 'A/B Testing | SparkPost');
    cy.findByRole('heading', { name: 'A/B Testing' }).should('be.visible');
  });
  it('renders with a link to the create page', () => {
    stubAbTest();
    cy.visit(PAGE_URL);
    cy.wait('@abTest');

    cy.findByText('Create a New A/B Test')
      .closest('a')
      .should('have.attr', 'href', '/ab-testing/create');
  });
  it('renders an error banner when the server returns one', () => {
    stubAbTest({ fixture: '400.json', statusCode: 400 });
    cy.visit(PAGE_URL);
    cy.wait('@abTest');

    cy.findByText('An error occurred').should('be.visible');
    cy.findByText('Try Again').should('be.visible');
    cy.findByText('Show Error Details').click();
    cy.findByText('This is an error').should('be.visible');
    cy.get('table').should('not.exist');

    stubAbTest();
    cy.findByRole('button', { name: 'Try Again' }).click();
    cy.wait('@abTest');
    cy.get('table').should('be.visible');
  });
  if (IS_HIBANA_ENABLED) {
    it('renders the empty state banner when the banner has not been dismissed', () => {
      stubAbTest();
      cy.visit(PAGE_URL);
      cy.wait(['@accountReq', '@abTest']);

      cy.findByRole('heading', { name: 'Discover Better Engagement' }).should('be.visible');
      cy.findByText('A/B Testing Documentation')
        .closest('a')
        .should(
          'have.attr',
          'href',
          'https://www.sparkpost.com/docs/tech-resources/a-b-testing-sparkpost/',
        );
    });
    it('renders the empty state when there are no ab tests', () => {
      stubAbTest({ fixture: '200.get.no-results.json' });
      cy.visit(PAGE_URL);
      cy.wait(['@accountReq', '@abTest']);
      cy.findByRole('heading', { name: 'A/B Testing' }).should('be.visible');
      cy.findByText(
        'A/B testing uses Templates and Transmissions to create tests that reveal how variations in content impact recipient engagement. These tests can help identify the most effective content, subject lines, images, and more.',
      ).should('be.visible');
      cy.findByText('templates')
        .closest('a')
        .should('have.attr', 'href', '/templates');
      cy.findByText('A/B Testing Documentation')
        .closest('a')
        .should(
          'have.attr',
          'href',
          'https://www.sparkpost.com/docs/tech-resources/a-b-testing-sparkpost/',
        );
      cy.findAllByText(
        'A/B testing uses Templates and Transmissions to create tests that reveal how variations in content impact recipient engagement. These tests can help identify the most effective content, subject lines, images, and more.',
      );
      cy.contains('Create two templates you would like to test.');
      cy.findAllByText('Create and schedule an A/B test.');
      cy.contains('Provide the ab_test_id when sending with the Transmission API.');
    });
  }
});
