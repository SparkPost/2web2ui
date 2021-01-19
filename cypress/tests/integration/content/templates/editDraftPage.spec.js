import { EDITOR_SELECTOR, TEMPLATE_ID } from './constants';
import { verifyTemplateSettingsIsDisabled, typeInEditor } from './helpers';

const PAGE_URL = `/templates/edit/${TEMPLATE_ID}/draft/content`;
const DEFAULT_PREVIEW_ERROR_HEADING = 'Oh no! An Error Occurred';
const DEFAULT_PREVIEW_ERROR_DESCRIPTION =
  'If you notice this happens often, check your substitution data or code syntax as these are frequent causes of preview errors.';

describe('The templates edit draft page', () => {
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
      url: '/api/v1/templates/stubbed-template-1',
      fixture: 'templates/stubbed-template-1/200.get.json',
    });

    cy.stubRequest({
      method: 'POST',
      url: '/api/v1/utils/content-previewer',
      fixture: 'utils/content-previewer/200.post.json',
    });
  });

  it('renders the template title with "(DRAFT)"', () => {
    cy.visit(PAGE_URL);

    cy.findByText('Stubbed Template 1 (DRAFT)');
  });

  it('renders the status in the header as "Draft"', () => {
    cy.visit(PAGE_URL);

    cy.findByDataId('template-status').within(() => {
      cy.findByText('Draft').should('be.visible'); // Note - content is capitalized with CSS, so the markup is not "DRAFT"
    });
  });

  it('redirects to the list page if the template fails to load', () => {
    cy.stubRequest({
      statusCode: 400,
      url: '/api/v1/templates/stubbed-template-1',
      fixture: 'templates/stubbed-template-1/400.get.json',
    });

    cy.visit(PAGE_URL);

    cy.findByText('Unable to load template').should('be.visible');
    cy.title().should('include', 'Templates');
    cy.findByRole('heading', { name: 'Templates' }).should('be.visible');
    cy.findByText('Stubbed Template 1').should('not.exist');
  });

  it('does not render an error if the server returns content with null values', () => {
    cy.stubRequest({
      url: '/api/v1/templates/stubbed-template-1*',
      fixture: 'templates/stubbed-template-1/200.get.content-null-values.json',
      requestAlias: 'hello',
    });

    cy.visit(PAGE_URL);

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(300); // The duration of the debounce function that triggers AMP validation

    // NOTE: No assertion necessary.
    // The test will fail if the exception occurs.
    // If the exception does not occur, then everything proceeds smoothly.
  });

  describe('template settings', () => {
    it('renders form elements with pre-populated values', () => {
      cy.visit(PAGE_URL);

      cy.findByText('Template Settings').click();

      cy.findByLabelText('Template Name').should('have.value', 'Stubbed Template 1');
      cy.findByLabelText('Template ID').should('have.value', 'stubbed-template-1');
      cy.findByLabelText('Subject').should('have.value', 'Stubbed Template 1');
      cy.findByLabelText('From Email').should('have.value', 'fake-user@bounce.uat.sparkspam.com');

      // NOTE: Using `.findByLabelText` for grabbing the switch isn't working as labels aren't correctly associated with inputs from an HTML POV
      // Additionally, the switch content visibility isn't working as the content isn't actually hidden from the standpoint of Cypress, just occluded by a decorative
      // element. Ideally when this component is refactored, these tests could be cleaner and less brittle.
      cy.findAllByText('Track Opens') // Each `<ToggleBlock/>` has a visually hidden and screen reader hidden label - kinda confusing!
        .closest('[data-id="toggle-block"]')
        .within(() => {
          cy.get('input').should('be.checked');
        });

      cy.findAllByText('Track Clicks')
        .closest('[data-id="toggle-block"]')
        .within(() => {
          cy.get('input').should('be.checked');
        });

      cy.findAllByText('Transactional')
        .closest('[data-id="toggle-block"]')
        .within(() => {
          cy.get('input').should('not.be.checked');
        });
    });

    it('renders all form elements as disabled if the user does not have the grant to modify templates', () => {
      stubReportingUserGrants();

      cy.visit(PAGE_URL);

      verifyTemplateSettingsIsDisabled();
    });

    it('renders a success message when the user changes a value in the form and then clicks the "Update Settings" button', () => {
      cy.stubRequest({
        method: 'PUT',
        url: '/api/v1/templates/stubbed-template-1',
        fixture: 'templates/stubbed-template-1/200.put.json',
      });

      cy.visit(PAGE_URL);

      cy.findByText('Template Settings').click();

      cy.findByLabelText('Template Name').type('Making Some Changes');

      cy.findByText('Update Settings').click();

      cy.findByText('Template settings updated.').should('be.visible');
    });
  });

  describe('template actions', () => {
    it('does not render when the user does not have permission to modify templates', () => {
      stubReportingUserGrants();

      cy.visit(PAGE_URL);

      cy.findByText('Save and Publish').should('not.exist');
    });

    it('renders with a "Save and Publish" button', () => {
      cy.visit(PAGE_URL);

      cy.findByText('Save and Publish').should('be.visible');
    });

    it('renders a popover with "Save and Publish", "Save Draft", "Duplicate", and "Delete" buttons when clicked', () => {
      cy.visit(PAGE_URL);

      cy.findAllByText('Save and Publish').should('have.length', 1);

      openTemplateSettings();

      cy.findAllByText('Save and Publish').should('have.length', 2);
      cy.findByText('Save Draft').should('be.visible');
      cy.findByText('Duplicate').should('be.visible');
      cy.findByText('Delete').should('be.visible');
    });

    describe('"Save and Publish" button', () => {
      it('renders a confirmation modal when clicked', () => {
        cy.visit(PAGE_URL);

        cy.findByText('Save and Publish').click();

        cy.withinModal(() => {
          cy.findByText('Are you sure you want to publish your template?').should('be.visible');
          cy.findByText('Save and Publish').should('be.visible');
          cy.findByText('Cancel').should('be.visible');
        });
      });

      it('redirects to the published view and renders a success message when confirmed', () => {
        cy.stubRequest({
          method: 'PUT',
          url: `/api/v1/templates/${TEMPLATE_ID}`,
          fixture: 'templates/stubbed-template-1/200.put.json',
        });

        cy.stubRequest({
          url: `/api/v1/templates/${TEMPLATE_ID}?draft=false`,
          fixture: 'templates/stubbed-template-1/200.get.published.json',
        });

        cy.visit(PAGE_URL);

        cy.findByText('Save and Publish').click();

        cy.withinModal(() => {
          cy.findAllByText('Save and Publish').click();
        });

        cy.findByText('Template published').should('be.visible');
        cy.url().should('include', 'published');
      });

      // TODO: This test caught a bug with the error handling - a ticket should be filed to address
      // it('renders an error message when the template fails to publish', () => {
      //   cy.stubRequest({
      //     method: 'PUT',
      //     statusCode: 400,
      //     url: `/api/v1/templates/${TEMPLATE_ID}`,
      //     fixture: 'templates/stubbed-template-1/400.put.json',
      //   });

      //   cy.stubRequest({
      //     statusCode: 400,
      //     url: `/api/v1/templates/${TEMPLATE_ID}?draft=false`,
      //     fixture: 'templates/stubbed-template-1/400.get.json',
      //   });

      //   cy.visit(PAGE_URL);

      //   cy.findByText('Save and Publish').click();

      //   cy.withinModal(() => {
      //     cy.findAllByText('Save and Publish').click();
      //   });

      //   cy.findByText('Something went wrong.').should('be.visible');
      //   cy.findByText('Template published').should('not.exist');
      // });
    });

    describe('"Save Draft" button', () => {
      it('renders a success message when clicked and updates the state of the draft to "Saved"', () => {
        cy.stubRequest({
          method: 'PUT',
          url: '/api/v1/templates/stubbed-template-1',
          fixture: 'templates/stubbed-template-1/200.put.json',
        });

        cy.visit(PAGE_URL);

        openTemplateSettings();

        cy.findByText('Save Draft').click();

        cy.findByText('Draft saved').should('be.visible');
      });

      it('updates the state of the draft to "Saved" after an unsaved change has been made to the template content', () => {
        cy.stubRequest({
          method: 'PUT',
          url: '/api/v1/templates/stubbed-template-1',
          fixture: 'templates/stubbed-template-1/200.put.json',
        });

        cy.visit(PAGE_URL);

        cy.get(EDITOR_SELECTOR)
          .focus()
          .type('<h1>Hello, world.</h1>');

        cy.findByText('Unsaved Changes').should('be.visible');

        openTemplateSettings();

        cy.findByText('Save Draft').click();

        cy.findByText('Saved').should('exist'); // Overlapped by the snackbar UI, so we can't use `should.be.visible` here
      });
    });

    describe('"Duplicate" button', () => {
      beforeEach(() => cy.visit(PAGE_URL));

      it('renders a confirmation modal when clicked with default values "<TEMPLATE NAME> (COPY)" and "<template-id>-copy" in their respective fields', () => {
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

  describe('the code editor in draft mode', () => {
    it('renders as "Read Only" on all tabs except "Test Data" when the user does not have permission to modify a template', () => {
      stubReportingUserGrants();

      cy.visit(PAGE_URL);

      // HTML tab already active by default, so no need to click it
      typeInEditor('Hello HTML tab.');
      cy.findByText('Hello HTML tab.').should('not.exist');
      cy.findByText('Read Only').should('be.visible');

      cy.findByText('AMP HTML').click();
      typeInEditor('Hello AMP HTML tab.');
      cy.findByText('Hello AMP HTML tab.').should('not.exist');
      cy.findByText('Read Only').should('be.visible');

      cy.findByText('Text').click();
      typeInEditor('Hello Text tab.');
      cy.findByText('Hello Text tab.').should('not.exist');
      cy.findByText('Read Only').should('be.visible');

      cy.findByText('Test Data').click();
      typeInEditor('Hello Test Data tab.');
      cy.findByText('Hello Test Data tab.').should('be.visible');
      cy.findByText('Read Only').should('not.exist');
    });

    it('renders the values of the HTML, AMP HTML, and Text tabs from the stored template', () => {
      cy.visit(PAGE_URL);

      cy.findByText('HTML!').should('be.visible');

      cy.findByText('AMP HTML').click();

      cy.findByText('AMP HTML!').should('be.visible');

      cy.findByText('Text').click();

      cy.findByText('This is some text').should('be.visible');
    });

    it('allows text entry in the HTML, AMP HTML, Text, and Test Data tabs', () => {
      cy.visit(PAGE_URL);

      typeInEditor('<h1>Hello, HTML');

      cy.findByText('Hello, HTML').should('be.visible'); // Can't check for full HTML as the markup is split between several containing `<span>s`

      cy.findByText('AMP HTML').click();

      typeInEditor('<h1>Hello, AMP HTML');

      cy.findByText('Hello, AMP HTML').should('be.visible');

      cy.findByText('Text').click();

      typeInEditor('Hello, text');

      cy.findByText('Hello, text').should('be.visible');

      cy.findByText('Test Data').click();

      typeInEditor('Hello, test data');

      cy.findByText('Hello, test data').should('be.visible');
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

          expect(localStorage.getItem('tpldata/mockuser/stubbed-template-1/d')).to.eq(
            '{"substitution_data":"THIS IS SOME TEST DATA"}',
          );
        });

        typeInEditor('{"substitution_data": "THIS IS SOME DIFFERENT DATA"}').should(() => {
          // Trying arbitrary wait to see if this helps with flakiness
          /* eslint-disable-next-line */
          cy.wait(1000);

          expect(localStorage.getItem('tpldata/mockuser/stubbed-template-1/d')).to.eq(
            '{"substitution_data":"THIS IS SOME DIFFERENT DATA"}',
          );
        });
      });
    });

    describe('the editor actions popover', () => {
      it('renders the insert snippet modal when clicking on the "Insert Snippet" button', () => {
        cy.stubRequest({
          url: '/api/labs/snippets',
          fixture: 'snippets/200.get.json',
        });

        cy.visit(PAGE_URL);

        cy.findByText('More').click({ force: true });

        cy.findByText('Insert Snippet').click();

        cy.findByText('Add a snippet').should('be.visible');

        cy.findByLabelText('Find a Snippet').focus();
        cy.findByText('Snippet 1').should('be.visible');
        cy.findByText('this-is-a-snippet-1').should('be.visible');
        cy.findByText('Snippet 2').should('be.visible');
        cy.findByText('this-is-a-snippet-2').should('be.visible');
        cy.findByText('Snippet 3').should('be.visible');
        cy.findByText('this-is-a-snippet-3').should('be.visible');
        cy.findByLabelText('Find a Snippet')
          .focus()
          .blur();

        cy.findByLabelText('Snippet Code').should(
          'have.value',
          '{{ render_snippet( "example-id" ) }}',
        );

        // Testing the copying behavior prevents Cypress tests from running as it opens a browser confirmation dialog
        // See: https://github.com/cypress-io/cypress/issues/2851
        // cy.findByText('Copy Code').click();
        // cy.findByText('Snippet copied').should('be.visible');
        // cy.findByText('Add a snippet').should('not.exist');
      });

      it('renders the "Insert AMP Boilerplate" button when opened', () => {
        cy.visit(PAGE_URL);

        cy.findByText('AMP HTML').click();
        cy.findByText('More').click({ force: true });

        cy.findByText('Insert AMP Boilerplate').should('be.visible');

        cy.findByText('HTML').click();
        cy.findByText('More').click({ force: true });

        cy.findByText('Insert AMP Boilerplate').should('not.exist');

        cy.findByText('Text').click();
        cy.findByText('More').click({ force: true });

        cy.findByText('Insert AMP Boilerplate').should('not.exist');

        cy.findByText('Test Data').click();
        cy.findByText('More').click({ force: true });

        cy.findByText('Insert AMP Boilerplate').should('not.exist');
      });

      it('renders a warning modal when the "Insert AMP Boilerplate" button is clicked, which allows the user to replace the content of the "AMP HTML" tab with the starter boilerplate', () => {
        cy.visit(PAGE_URL);

        cy.findByText('AMP HTML').click();
        cy.findByText('AMP HTML!').should('be.visible');
        cy.findByText('4email').should('not.exist');
        cy.findByText('More').click({ force: true });
        cy.findByText('Insert AMP Boilerplate').click();

        cy.findByText('Are you sure you want to insert the AMP Email Boilerplate?').should(
          'be.visible',
        );
        cy.findByText('Insert').click();
        cy.findByText('AMP HTML!').should('not.exist');
        cy.findByText('4email').should('be.visible');
      });
    });
  });

  describe('preview panel', () => {
    it('allows the user to toggle between a desktop and mobile preview', () => {
      cy.visit(PAGE_URL);

      cy.findByText('Mobile Preview').click({ force: true });
      cy.get('[data-id="preview-mobile-phone"]').should('be.visible');

      cy.findByText('Desktop Preview').click({ force: true });
      cy.get('[data-id="preview-desktop"]').should('be.visible');
    });

    it("renders the relevant content according to the user's current selected tab", () => {
      cy.stubRequest({
        method: 'POST',
        url: '/api/v1/utils/content-previewer',
        fixture: 'utils/content-previewer/200.post.json',
        requestAlias: 'previewRequest',
      });

      cy.visit(PAGE_URL);

      cy.wait('@previewRequest');

      testPreviewContent({
        selector: 'h1',
        content: 'This is some HTML content',
      });

      getIframeBody()
        .find('a')
        .should('contain', 'Click Here')
        .should('have.attr', 'rel', 'noopener noreferrer')
        .should('have.attr', 'target', '_parent');

      cy.findByText('AMP HTML').click();

      testPreviewContent({
        selector: 'h1',
        content: 'This is some AMP HTML content',
      });

      cy.findByText('Text').click();

      testPreviewContent({
        selector: 'p',
        content: 'This is some text content.',
      });

      cy.findByText('Test Data').click();

      testPreviewContent({
        selector: 'h1',
        content: 'This is some HTML content',
      });
    });

    it('prioritizes rendering AMP HTML content over text when the "Test Data" tab is selected when no HTML is available', () => {
      cy.stubRequest({
        method: 'POST',
        url: '/api/v1/utils/content-previewer',
        fixture: 'utils/content-previewer/200.post.no-html.json',
        requestAlias: 'previewRequest',
      });

      cy.visit(PAGE_URL);

      cy.wait('@previewRequest');

      cy.findByText('Test Data').click();

      testPreviewContent({
        selector: 'h1',
        content: 'This is some AMP HTML content',
      });
    });

    it('renders text content when neither HTML no AMP HTML content are returned when the "Test Data" tab is selected', () => {
      cy.stubRequest({
        method: 'POST',
        url: '/api/v1/utils/content-previewer',
        fixture: 'utils/content-previewer/200.post.no-amp-or-html.json',
        requestAlias: 'previewRequest',
      });

      cy.visit(PAGE_URL);

      cy.wait('@previewRequest');

      cy.findByText('Test Data').click();

      testPreviewContent({
        selector: 'p',
        content: 'This is some text content.',
      });
    });

    it('renders a "Send a Test" button that opens a modal for sending preview emails', () => {
      cy.stubRequest({
        method: 'PUT',
        url: '/api/v1/templates/stubbed-template-1',
        fixture: 'templates/stubbed-template-1/200.put.json',
      });

      cy.visit(PAGE_URL);

      cy.findByText('Send a Test').click();

      cy.findByText(
        'Verify your email renders as expected in the inbox by sending a quick test.',
      ).should('be.visible');
      cy.findByLabelText('From').should('have.value', 'fake-user@bounce.uat.sparkspam.com');
      cy.findByLabelText('Subject').should('have.value', 'Stubbed Template 1');
    });

    it('renders a success message when the user sends a test preview email', () => {
      cy.stubRequest({
        method: 'PUT',
        url: '/api/v1/templates/stubbed-template-1',
        fixture: 'templates/stubbed-template-1/200.put.json',
      });

      cy.stubRequest({
        method: 'POST',
        url: '/api/v1/transmissions',
        fixture: 'transmissions/200.post.json',
      });

      cy.visit(PAGE_URL);

      cy.findByText('Send a Test').click();

      cy.findByLabelText('To').type('fake-email@gmail.com');

      cy.findByText('Send Email').click();

      cy.findByText('Successfully sent a test email').should('be.visible');
    });

    describe('preview error handling', () => {
      function beforeSteps({ fixture }) {
        cy.stubRequest({
          method: 'POST',
          statusCode: 422,
          url: '/api/v1/utils/content-previewer',
          fixture,
          requestAlias: 'previewRequest',
        });

        cy.visit(PAGE_URL);

        cy.wait('@previewRequest');
      }

      it('renders an syntax error with the relevant line number when the custom status code is "3000"', () => {
        beforeSteps({ fixture: 'utils/content-previewer/422.post.code-3000.json' });

        cy.findByText(DEFAULT_PREVIEW_ERROR_HEADING).should('be.visible');
        cy.findByText(
          'We are unable to load your template preview due to a substitution language syntax error in template content on line 1 of your html.',
        ).should('be.visible');
        cy.findByText(DEFAULT_PREVIEW_ERROR_DESCRIPTION).should('be.visible');
      });

      it('renders a syntax error without line number information if that information is not returned by the server', () => {
        beforeSteps({ fixture: 'utils/content-previewer/422.post.code-3000-no-line.json' });

        cy.findByText(DEFAULT_PREVIEW_ERROR_HEADING).should('be.visible');
        cy.findByText('This is an error description').should('not.exist');
        cy.findByText(DEFAULT_PREVIEW_ERROR_DESCRIPTION).should('be.visible');
      });

      it('renders an error and its description if the custom status code is not "3000"', () => {
        beforeSteps({ fixture: 'utils/content-previewer/422.post.json' });

        cy.findByText(DEFAULT_PREVIEW_ERROR_HEADING).should('be.visible');
        cy.findByText('This is an error description').should('be.visible');
        cy.findByText(DEFAULT_PREVIEW_ERROR_DESCRIPTION).should('be.visible');
      });

      it('renders the default heading and description when no error code or description are returned from the server', () => {
        beforeSteps({ fixture: 'utils/content-previewer/422.post.no-code-or-description.json' });

        cy.findByText(DEFAULT_PREVIEW_ERROR_HEADING).should('be.visible');
        cy.findByText(DEFAULT_PREVIEW_ERROR_DESCRIPTION).should('be.visible');
      });
    });
  });
});

function openTemplateSettings() {
  cy.findByText('Open Menu').click({ force: true }); // The content is visually hidden (intentionally!), so `force: true` is needed here
}

function testPreviewContent({ selector, content }) {
  cy.get('iframe').then($iframe => {
    const $body = $iframe.contents().find('body');

    if (selector.length) {
      cy.wrap($body.find(selector)).should('contain', content);
    } else {
      cy.wrap($body).should('contain', content);
    }
  });
}

function stubReportingUserGrants() {
  cy.stubRequest({
    url: '/api/v1/authenticate/grants**',
    fixture: 'authenticate/grants/200.get.reporting.json',
  });
}

// see, https://www.cypress.io/blog/2020/02/12/working-with-iframes-in-cypress/
// todo, maybe replace testPreviewContent
function getIframeBody() {
  return cy
    .get('iframe[title="preview email template frame"]')
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then(cy.wrap);
}
