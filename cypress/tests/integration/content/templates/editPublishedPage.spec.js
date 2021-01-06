import { EDITOR_SELECTOR, TEMPLATE_ID } from './constants';
import { verifyTemplateSettingsIsDisabled, typeInEditor } from './helpers';

const PAGE_URL = `/templates/edit/${TEMPLATE_ID}/published/content`;

function openTemplateSettings() {
  cy.findByText('Open Menu').click({ force: true }); // The content is visually hidden (intentionally!), so `force: true` is needed here
}

describe('The templates published template page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });

    cy.stubRequest({
      url: '/api/v1/sending-domains',
      fixture: 'sending-domains/200.get.json',
    });

    cy.stubRequest({
      url: '/api/v1/subaccounts',
      fixture: 'subaccounts/200.get.json',
    });

    cy.stubRequest({
      url: '/api/v1/templates/stubbed-template-1*',
      fixture: 'templates/stubbed-template-1/200.get.published.json',
    });

    cy.stubRequest({
      method: 'POST',
      url: '/api/v1/utils/content-previewer',
      fixture: 'utils/content-previewer/200.post.json',
    });
  });

  it('renders the status in the header as "Published"', () => {
    cy.visit(PAGE_URL);

    cy.findByDataId('template-status').within(() => {
      cy.findByText('Published').should('be.visible'); // Note - content is capitalized with CSS, so the markup is not "DRAFT"
    });
  });

  it('redirects to the list page if the template fails to load', () => {
    cy.stubRequest({
      statusCode: 400,
      url: '/api/v1/templates/stubbed-template-1*',
      fixture: 'templates/stubbed-template-1/400.get.json',
    });

    cy.visit(PAGE_URL);

    cy.findByText('Unable to load template').should('be.visible');
    cy.title().should('eq', 'Templates | SparkPost');

    // Need to avoid grabbing mobile navigation content
    cy.withinMainContent(() => {
      cy.findAllByText('Templates').should('be.visible');
    });
    cy.findByText('Stubbed Template 1').should('not.exist');
  });

  describe('the code editor in published mode', () => {
    function checkForReadOnly() {
      cy.findByText('Read Only').should('be.visible');
      cy.findByText('More').should('not.exist'); // Checks that menu is not available on each tab

      cy.get(EDITOR_SELECTOR)
        .focus()
        .clear()
        .type('Hello, world');

      cy.scrollTo('top');

      cy.findByText('Hello, world').should('not.exist');
    }

    it('renders a "Read Only" tag when "HTML" is selected and authoring HTML is impossible', () => {
      cy.visit(PAGE_URL);

      cy.findByText('AMP HTML').click();
      cy.findByText('HTML').click();

      checkForReadOnly();
    });

    it('renders a "Read Only" tag when "AMP HTML" is selected and authoring AMP HTML is impossible', () => {
      cy.visit(PAGE_URL);

      cy.findByText('AMP HTML').click();

      checkForReadOnly();
    });

    it('renders a "Read Only" tag when "Text" is selected and updating text is impossible', () => {
      cy.visit(PAGE_URL);

      cy.findByText('Text').click();

      checkForReadOnly();
    });

    it('does not render a "Read Only" tag when "Test Data" is selected and updating test data is possible', () => {
      cy.visit(PAGE_URL);

      cy.findByText('Test Data').click();

      cy.findByText('Read Only').should('not.exist');

      cy.get(EDITOR_SELECTOR)
        .focus()
        .clear()
        .type('Hello, world');

      cy.scrollTo('top');

      cy.findByText('Hello, world').should('be.visible');
    });

    it("saves the user's test data entry to local storage as the user edits test data", () => {
      cy.visit(PAGE_URL);

      cy.findByText('Test Data').click();

      cy.clearLocalStorage().then(() => {
        // localStorage must be accessed asynchronously!
        // See: https://github.com/cypress-io/cypress/issues/2722
        typeInEditor('{"substitution_data": "THIS IS SOME TEST DATA"}').should(() => {
          // Trying arbitrary wait to see if this helps with flakiness
          /* eslint-disable-next-line */
          cy.wait(1000);

          expect(localStorage.getItem('tpldata/mockuser/stubbed-template-1/p')).to.eq(
            '{"substitution_data":"THIS IS SOME TEST DATA"}',
          );
        });

        typeInEditor('{"substitution_data": "THIS IS SOME DIFFERENT DATA"}').should(() => {
          // Trying arbitrary wait to see if this helps with flakiness
          /* eslint-disable-next-line */
          cy.wait(1000);

          expect(localStorage.getItem('tpldata/mockuser/stubbed-template-1/p')).to.eq(
            '{"substitution_data":"THIS IS SOME DIFFERENT DATA"}',
          );
        });
      });
    });
  });

  it('the "Edit Draft" button re-routes the user to the draft version of the template on click', () => {
    cy.visit(PAGE_URL);

    cy.findByText('Edit Draft').click();

    cy.url().should('include', 'draft');
    cy.findByText('Stubbed Template 1 (DRAFT)').should('be.visible');
    cy.get('[data-id="template-status"]').within(() => {
      cy.findByText('Draft').should('be.visible');
    });
  });

  describe('template actions', () => {
    it('renders a popover with "Edit Draft", "Duplicate", and "Delete" buttons when clicked', () => {
      cy.visit(PAGE_URL);

      cy.findAllByText('Edit Draft').should('have.length', 1);

      openTemplateSettings();

      cy.findAllByText('Edit Draft').should('have.length', 2);
      cy.findByText('Duplicate').should('be.visible');
      cy.findByText('Delete').should('be.visible');
    });

    describe('the "Duplicate" button', () => {
      beforeEach(() => cy.visit(PAGE_URL));

      it('has a "Duplicate" button that renders a confirmation when clicked', () => {
        cy.visit(PAGE_URL);

        openTemplateSettings();

        cy.findByText('Duplicate').click();

        cy.findByText('Duplicate Template').should('be.visible');
        cy.findByLabelText(/Template Name/g).should('have.value', 'Stubbed Template 1 (COPY)');
        cy.findByLabelText(/Template ID/g).should('have.value', 'stubbed-template-1-copy');
      });

      it('renders a success message when the user confirms duplication', () => {
        cy.stubRequest({
          method: 'POST',
          url: '/api/v1/templates',
          fixture: 'templates/200.post.json',
        });

        cy.visit(PAGE_URL);

        openTemplateSettings();

        cy.findByText('Duplicate').click();
        cy.withinModal(() => {
          cy.findByText('Duplicate').click();
        });

        cy.findByText('Template duplicated.').should('be.visible');
      });

      it('renders an error message if the duplication fails on confirmation', () => {
        cy.stubRequest({
          method: 'POST',
          statusCode: 400,
          url: '/api/v1/templates',
          fixture: 'templates/400.post.json',
        });

        cy.visit(PAGE_URL);

        openTemplateSettings();

        cy.findByText('Duplicate').click();
        cy.withinModal(() => {
          cy.findByText('Duplicate').click();
        });

        cy.findByText('Something went wrong.').should('be.visible');

        // And the UI persists prior to throwing the error
        cy.findByLabelText(/Template Name/g).should('be.visible');
        cy.findByLabelText(/Template ID/g).should('be.visible');
      });
    });

    describe('"Delete" button', () => {
      beforeEach(() => cy.visit(PAGE_URL));

      it('renders a confirmation modal when clicked', () => {
        openTemplateSettings();

        cy.findByText('Delete').click();

        cy.findByText('Are you sure you want to delete your template?').should('be.visible');
        cy.findByText('Delete All Versions').should('be.visible');
        cy.findByText('Cancel').should('be.visible');
      });

      it('renders a success message and redirects the user to the list page when the deletion is confirmed', () => {
        cy.stubRequest({
          method: 'DELETE',
          url: `/api/v1/templates/${TEMPLATE_ID}`,
          fixture: 'templates/stubbed-template-1/200.delete.json',
        });

        cy.visit(PAGE_URL);

        openTemplateSettings();

        cy.findByText('Delete').click();
        cy.findByText('Delete All Versions').click();

        cy.findByText('Template deleted').should('be.visible');
      });

      it('renders an error message if the deletion fails on confirmation', () => {
        cy.stubRequest({
          method: 'DELETE',
          statusCode: 400,
          url: `/api/v1/templates/${TEMPLATE_ID}`,
          fixture: 'templates/stubbed-template-1/400.delete.json',
        });

        cy.visit(PAGE_URL);

        openTemplateSettings();

        cy.findByText('Delete').click();
        cy.findByText('Delete All Versions').click();

        cy.findByText('Something went wrong.').should('be.visible');
        cy.findByText('Are you sure you want to delete your template?').should('be.visible'); // The modal remains open
      });
    });
  });

  describe('template settings', () => {
    it('renders all fields as disabled in published mode', () => {
      cy.visit(PAGE_URL);

      verifyTemplateSettingsIsDisabled();
    });
  });
});
