const PAGE_URL = '/';
const API_URL = '/api/v1/account*';

describe('Hibana theme togging and UI', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });

    cy.stubRequest({
      url: API_URL,
      fixture: 'account/200.get.has-hibana-theme-controls.json',
    });
  });

  it('renders the Hibana UI when the user\'s account has the UI flag "hibana.hasThemeControls"', () => {
    cy.visit(PAGE_URL);

    cy.get('[data-id="hibana-controls"]').should('be.visible');
  });

  it('does not render the Hibana UI when the user\'s account has the UI flag "hibana.hasThemeControls" set to `false`', () => {
    cy.stubRequest({
      url: API_URL,
      fixture: 'account/200.get.does-not-have-hibana-theme-controls.json',
    });
    cy.visit(PAGE_URL);

    cy.get('[data-id="hibana-controls"]').should('not.be.visible');
  });

  it('does not render the Hibana UI when the user\'s account lacks the "hibana" UI flag entirely', () => {
    cy.stubRequest({
      url: API_URL,
      fixture: 'account/200.get.no-ui-options.json',
    });
    cy.visit(PAGE_URL);

    cy.get('[data-id="hibana-controls"]').should('not.be.visible');
  });

  it('Enables and disables Hibana when clicking "Take a Look" and "That’s fine, take me back" buttons', () => {
    cy.visit(PAGE_URL);

    cy.findByText('Take a Look').click();
    cy.findByText('That’s fine, take me back').click();
    cy.findByText('Take a Look').should('be.visible');
  });
});
