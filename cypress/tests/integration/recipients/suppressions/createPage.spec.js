const PAGE_URL = '/lists/suppressions/create';

describe('The create suppressions page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });

  it('renders in its initial state', () => {
    commonBeforeSteps();

    cy.title().should('include', 'Add Suppressions');
    cy.findByRole('heading', { name: 'Add Suppressions', level: 1 }).should('be.visible');
    cy.findByRole('tab', { name: 'Single Recipient', selected: true }).should('be.visible');
    cy.findByRole('tab', { name: 'Bulk Upload' }).should('be.visible');
    cy.findByRole('textbox', { name: /Email Address/g }).should('be.visible');
    cy.findByRole('textbox', { name: /Subaccount/g }).should('be.visible');
    cy.findByRole('checkbox', { name: /Transactional/g }).should('be.visible');
    cy.findByRole('checkbox', { name: /Non-Transactional/g }).should('be.visible');
    cy.findByRole('button', { name: 'Add / Update' }).should('be.visible');
  });

  describe('the "Single Recipient" tab', () => {
    it('creates a new suppression via the "Single Recipient" tab', () => {
      commonBeforeSteps();

      cy.findByRole('textbox', { name: /Email Address/g }).type('fake-email@fake.com');
      cy.findByRole('textbox', { name: /Subaccount/g }).click();
      cy.findByRole('option', { name: /Fake Subaccount 1/g }).click();
      cy.findByRole('checkbox', { name: /Transactional/g }).check({ force: true });
      cy.findByRole('checkbox', { name: /Non-Transactional/g }).check({ force: true });
      cy.findByRole('textbox', { name: /Description/g }).type('this is a description');

      cy.stubRequest({
        method: 'PUT',
        url: '/api/v1/suppression-list',
        fixture: 'suppression-list/200.put.json',
        requestAlias: 'suppressionListReq',
      });

      cy.findByRole('button', { name: 'Add / Update' }).click();

      cy.wait('@suppressionListReq').then(xhr => {
        expect(xhr.request.body).to.deep.equal({
          recipients: [
            {
              description: 'this is a description',
              recipient: 'fake-email@fake.com',
              type: 'transactional',
            },
            {
              description: 'this is a description',
              recipient: 'fake-email@fake.com',
              type: 'non_transactional',
            },
          ],
        });

        expect(xhr.request.headers['x-msys-subaccount']).to.equal(101);
      });

      cy.withinSnackbar(() => {
        cy.findByText('Successfully updated your suppression list').should('be.visible');
      });
    });

    it('renders validation errors when required fields are skipped', () => {
      commonBeforeSteps();

      cy.findByRole('textbox', { name: /Email Address/g })
        .focus()
        .blur();

      cy.findByText('A valid email address is required.').should('be.visible');

      cy.findByRole('textbox', { name: /Email Address/g }).type('fake-email-address@hello.com');
      cy.findByRole('button', { name: 'Add / Update' }).click();
      cy.findByText('You must select at least one Type').should('be.visible');
    });

    it('renders an error when creating a suppression fails', () => {
      stubSubaccounts();
      cy.visit(PAGE_URL);
      cy.wait('@subaccountsReq');

      cy.findByRole('textbox', { name: /Email Address/g }).type('fake-email@fake.com');
      cy.findByRole('textbox', { name: /Subaccount/g }).click();
      cy.findByRole('option', { name: /Fake Subaccount 1/g }).click();
      cy.findByRole('checkbox', { name: /Transactional/g }).check({ force: true });
      cy.findByRole('checkbox', { name: /Non-Transactional/g }).check({ force: true });

      cy.stubRequest({
        method: 'PUT',
        statusCode: 400,
        url: '/api/v1/suppression-list',
        fixture: '400.json',
        requestAlias: 'suppressionListReq',
      });

      cy.findByRole('button', { name: 'Add / Update' }).click();

      cy.wait('@suppressionListReq');

      cy.withinSnackbar(() => {
        cy.findByText('Something went wrong.').should('be.visible');
        cy.findByRole('button', { name: 'View Details' }).click();
        cy.findByText('This is an error').should('be.visible');
      });
    });
  });

  describe('the "Bulk Upload" tab', () => {
    function uploadCSV() {
      // TODO: This is a bug - Dropzone is not accepting the passed in `id` so the label isn't properly associated with the <input />
      // cy.findByLabelText('CSV File of Suppressions').should('be.visible');
      const exampleCSV = 'suppression-list/fake-list.csv';

      cy.fixture(exampleCSV).then(fileContent => {
        cy.get('[name="suppressionsFile"]').upload({
          fileContent,
          fileName: 'fake-list.csv',
          mimeType: 'text/csv',
        });
      });
      cy.findByText('fake-list.csv').should('be.visible');
    }

    it('creates a bulk list of suppressions via the "Bulk Upload" tab', () => {
      commonBeforeSteps();

      cy.findByRole('tab', { name: 'Bulk Upload' })
        .click()
        .should('be.selected');

      uploadCSV();
      cy.findByRole('textbox', { name: 'Subaccount' }).click();
      cy.findByRole('option', { name: /Fake Subaccount 3/g }).click();

      cy.stubRequest({
        method: 'PUT',
        url: '/api/v1/suppression-list',
        fixture: 'suppression-list/200.put.json',
        requestAlias: 'suppressionListReq',
      });

      cy.findByRole('button', { name: 'Upload' }).click();

      cy.wait('@suppressionListReq').then(xhr => {
        expect(xhr.request.body).to.deep.equal({
          recipients: [
            {
              recipient: 'danny.devito@example.com',
              type: 'non_transactional',
              description: 'i was imported!',
            },
            {
              recipient: 'john.doe@example.com',
              type: 'transactional',
              description: 'i was imported!',
            },
          ],
        });

        expect(xhr.request.headers['x-msys-subaccount']).to.equal(103);
      });

      cy.withinSnackbar(() => {
        cy.findByText('Successfully updated your suppression list').should('be.visible');
      });
      cy.url().should('include', '/lists/suppressions');
      cy.title().should('include', 'Suppressions');
      cy.findByRole('heading', { name: 'Suppressions', level: 1 }).should('be.visible');
    });

    it('renders an error when bulk suppression upload fails', () => {
      commonBeforeSteps();

      cy.findByRole('tab', { name: 'Bulk Upload' })
        .click()
        .should('be.selected');

      uploadCSV();

      cy.stubRequest({
        method: 'PUT',
        statusCode: 400,
        url: '/api/v1/suppression-list',
        fixture: '400.json',
        requestAlias: 'suppressionListReq',
      });

      cy.findByRole('button', { name: 'Upload' }).click();

      cy.wait('@suppressionListReq');

      cy.findByRole('heading', { name: 'An error occurred' })
        .scrollIntoView()
        .should('be.visible');
      cy.findByText('Unable to add recipients to your suppression list').should('be.visible');
      cy.findByRole('button', { name: 'Show Error Details' }).click();
      cy.findByText('This is an error').should('be.visible');
      cy.findByRole('button', { name: 'Hide Error Details' }).should('be.visible');
    });
  });
});

function commonBeforeSteps() {
  stubSubaccounts();
  cy.visit(PAGE_URL);
  cy.wait('@subaccountsReq');
}

function stubSubaccounts() {
  cy.stubRequest({
    url: '/api/v1/subaccounts',
    fixture: 'subaccounts/200.get.json',
    requestAlias: 'subaccountsReq',
  });
}
