import { EDITOR_SELECTOR } from '../constants';

export function verifyTemplateSettingsIsDisabled() {
  cy.findByText('Template Settings').click();

  cy.findByLabelText('Template Name').should('be.disabled');
  cy.findByLabelText('Template ID').should('be.disabled');
  cy.findByLabelText('Subject').should('be.disabled');
  cy.findByLabelText('From Email').should('be.disabled');
  cy.findByLabelText('From Name').should('be.disabled');
  cy.findByLabelText('Reply To').should('be.disabled');
  cy.findByLabelText('Description').should('be.disabled');

  // NOTE: Using `.findByLabelText` for grabbing the switch isn't working as labels aren't correctly associated with inputs from an HTML POV
  // Additionally, the switch content visibility isn't working as the content isn't actually hidden from the standpoing of Cypress, just ocluded by a decorative
  // element. Ideally when this component is refactored, these tests could be cleaner and less brittle.
  cy.findAllByText('Track Opens') // Each `<ToggleBlock/>` has a visually hidden and screen reader hidden label - kinda confusing!
    .closest('[data-id="toggle-block"]')
    .within(() => {
      cy.get('input').should('be.disabled');
    });

  cy.findAllByText('Track Clicks')
    .closest('[data-id="toggle-block"]')
    .within(() => {
      cy.get('input').should('be.disabled');
    });

  cy.findAllByText('Transactional')
    .closest('[data-id="toggle-block"]')
    .within(() => {
      cy.get('input').should('be.disabled');
    });

  cy.findAllByRole('button', { name: 'Update Settings' }).should('be.disabled');
}

export function typeInEditor(content) {
  return cy
    .get(EDITOR_SELECTOR)
    .focus()
    .clear()
    .type(content, { parseSpecialCharSequences: false })
    .blur();
}
