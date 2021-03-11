import { USERNAME } from 'cypress/constants';

const PAGE_URL = '/lists/suppressions';
const SUPPRESSION_LIST_API_URL = '/api/v1/suppression-list*';
const DELETE_MODAL_CONTENT =
  'Are you sure you want to delete fake-email@gmail.com from suppression list?';

describe('The recipients suppressions list page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });

    cy.stubRequest({
      url: '/api/v1/subaccounts',
      fixture: 'subaccounts/200.get.json',
    });

    cy.stubRequest({
      url: SUPPRESSION_LIST_API_URL,
      fixture: 'suppression-list/200.get.json',
      requestAlias: 'stubbedSuppressionListRequest',
    });
  });

  it('has a relevant page title', () => {
    cy.visit(PAGE_URL);

    cy.title().should('include', 'Suppressions');
  });

  it('renders a link to the "Add Suppressions" page', () => {
    cy.visit(PAGE_URL);

    cy.wait('@stubbedSuppressionListRequest');

    cy.verifyLink({
      content: 'Add Suppressions',
      href: '/lists/suppressions/create',
    });
  });

  it('renders date range, "Type", and "Source" fields when the "Filters" tab is selected', () => {
    cy.visit(PAGE_URL);

    cy.findByText('Find by Email').click();
    cy.findByText('Filters').click();

    cy.findByLabelText('Broad Date Range').should('be.visible');
    cy.findByLabelText('Narrow Date Range').should('be.visible');
    cy.findByLabelText('Type').should('be.visible');
    cy.findByLabelText('Sources').should('be.visible');
  });

  it('renders "Recipient Email" and "Subaccount" fields when the "Find by Email" tab is selected', () => {
    cy.visit(PAGE_URL);

    cy.findByText('Find by Email').click();

    cy.findByLabelText('Recipient Email').should('be.visible');
    cy.findByLabelText('Subaccount').should('be.visible');
  });

  it('clears the subaccount field in the "Find by Email" tab when the clear button is clicked', () => {
    cy.visit(PAGE_URL);

    cy.findByText('Find by Email').click();

    cy.findByLabelText('Subaccount').click();
    cy.findByRole('option', { name: /Fake Subaccount 1/g }).click();
    cy.findByLabelText('Subaccount')
      .click()
      .should('have.value', 'Fake Subaccount 1 (101)');
    cy.findByRole('button', { name: 'Clear' }).click();
    cy.findByLabelText('Subaccount').should('have.value', '');
  });

  describe('the suppressions list table', () => {
    it('renders retrieved suppression lists in the table', () => {
      cy.visit(PAGE_URL);

      cy.findByText('fake-email@gmail.com').should('be.visible');
      cy.findByText('Non-transactional').should('be.visible');
      cy.findByText('Manually Added').should('be.visible');
      cy.findByText('Primary Account').should('be.visible');
    });

    it('renders an error when the suppression list endpoint returns an error', () => {
      cy.stubRequest({
        statusCode: 400,
        url: SUPPRESSION_LIST_API_URL,
        fixture: 'suppression-list/400.get.json',
      });

      cy.visit(PAGE_URL);

      cy.findByText('Something went wrong.').should('be.visible');
      cy.findByText('There are no results for your current query').should('be.visible');
    });

    it('renders an empty state when no suppressions have been added', () => {
      cy.stubRequest({
        url: SUPPRESSION_LIST_API_URL,
        fixture: 'suppression-list/200.get.no-results.json',
      });

      cy.visit(PAGE_URL);

      cy.findByText('There are no results for your current query').should('be.visible');
    });

    it('renders a delete modal when clicking the "Delete" button within a table row', () => {
      cy.stubRequest({
        method: 'DELETE',
        url: '/api/v1/suppression-list/fake-email@gmail.com',
        fixture: 'suppression-list/200.delete.json',
      });

      cy.visit(PAGE_URL);

      // Testing cancellation within the modal
      cy.get('table').within(() => {
        cy.findAllByText('Open Menu')
          .first()
          .click({ force: true });
      });

      cy.findAllByText('Delete')
        .first()
        .click();

      cy.findByText(DELETE_MODAL_CONTENT).should('be.visible');

      cy.withinModal(() => {
        cy.findByText('Cancel').click();
      });

      cy.findByText(DELETE_MODAL_CONTENT).should('not.exist');

      // Testing deletion within the modal
      cy.get('table').within(() => {
        cy.findAllByText('Open Menu')
          .first()
          .click({ force: true });
      });

      cy.findAllByText('Delete')
        .first()
        .click();

      cy.withinModal(() => {
        cy.findByText('Delete').click();
      });

      cy.findByText(
        'fake-email@gmail.com was successfully deleted from the suppression list',
      ).should('be.visible');
    });

    it('renders an error and keeps the modal open when suppression deletion fails', () => {
      cy.stubRequest({
        statusCode: 400,
        method: 'DELETE',
        url: '/api/v1/suppression-list/fake-email@gmail.com',
        fixture: 'suppression-list/200.delete.json',
      });

      cy.visit(PAGE_URL);

      cy.get('table').within(() => {
        cy.findAllByText('Open Menu').click({ force: true });
      });
      cy.findAllByText('Delete').click();

      cy.withinModal(() => {
        cy.findByText('Delete').click();
      });

      cy.findByText('Something went wrong.').should('be.visible');
      cy.findByText(DELETE_MODAL_CONTENT).should('be.visible');
    });

    it('unmounts "Delete" buttons within the table row popover while a delete request is pending', () => {
      const deleteDelay = 500;

      cy.stubRequest({
        url: SUPPRESSION_LIST_API_URL,
        fixture: 'suppression-list/200.get.alphabetical-results.json',
      });

      cy.stubRequest({
        method: 'DELETE',
        url: '/api/v1/suppression-list/recipient-a',
        fixture: 'suppression-list/200.delete.json',
        delay: deleteDelay,
      });

      cy.visit(PAGE_URL);

      cy.get('table').within(() =>
        cy
          .findAllByText('Open Menu')
          .first()
          .click({ force: true }),
      );

      cy.findAllByText('Delete')
        .first()
        .click();

      cy.withinModal(() => cy.findByText('Delete').click());

      cy.get('table').within(() =>
        cy
          .findAllByText('Open Menu')
          .first()
          .click({ force: true }),
      );

      cy.findAllByText('Delete').should('not.exist');

      // eslint-disable-next-line
      cy.wait(deleteDelay);

      cy.get('table').within(() =>
        cy
          .findAllByText('Open Menu')
          .first()
          .click({ force: true }),
      );
      cy.findAllByText('Delete').should('be.visible');
    });

    it('renders a details modal when clicking the "View Details" button within a table row', () => {
      cy.visit(PAGE_URL);

      cy.findAllByText('Open Menu')
        .first()
        .click({ force: true });
      cy.findAllByText('View Details')
        .first()
        .click();

      cy.withinModal(() => {
        cy.findByText('Suppression Details').should('be.visible');

        cy.findByText('fake-email@gmail.com').should('be.visible');
        cy.findByText('Non-transactional').should('be.visible');
        cy.findByText('Manually Added').should('be.visible');
        cy.findByText('this is a test description').should('be.visible');
        cy.findByText('Close').click({ force: true });
      });

      cy.findByText('Suppression Details').should('not.exist');
    });

    it('sorts alphabetically by "Recipient", "Type", "Source", and "Subaccount"', () => {
      cy.stubRequest({
        url: SUPPRESSION_LIST_API_URL,
        fixture: 'suppression-list/200.get.alphabetical-results.json',
      });

      cy.visit(PAGE_URL);

      // Sorting by the "Recipient" column
      // Sort descending
      cy.findByText('Recipient').click();

      cy.get('tbody tr')
        .eq(0)
        .should('contain', 'recipient-c');

      cy.get('tbody tr')
        .eq(1)
        .should('contain', 'recipient-b');

      cy.get('tbody tr')
        .eq(2)
        .should('contain', 'recipient-a');

      // Sort ascending
      cy.findByText('Recipient').click();

      cy.get('tbody tr')
        .eq(0)
        .should('contain', 'recipient-a');

      cy.get('tbody tr')
        .eq(1)
        .should('contain', 'recipient-b');

      cy.get('tbody tr')
        .eq(2)
        .should('contain', 'recipient-c');

      // Sorting by the "Type" column
      // Sort ascending
      cy.get('table').within(() => {
        cy.findByText('Type').click();
      });

      cy.get('tbody tr')
        .eq(0)
        .should('contain', 'Non-transactional');

      cy.get('tbody tr')
        .eq(1)
        .should('contain', 'Transactional');

      cy.get('tbody tr')
        .eq(2)
        .should('contain', 'Transactional');

      // Sort descending
      cy.get('table').within(() => {
        cy.findByText('Type').click();
      });

      cy.get('tbody tr')
        .eq(0)
        .should('contain', 'Transactional');

      cy.get('tbody tr')
        .eq(1)
        .should('contain', 'Transactional');

      cy.get('tbody tr')
        .eq(2)
        .should('contain', 'Non-transactional');

      // Sorting by the "Type" column
      // Sort ascending
      cy.findByText('Source').click();

      cy.get('tbody tr')
        .eq(0)
        .should('contain', 'source-a');

      cy.get('tbody tr')
        .eq(1)
        .should('contain', 'source-b');

      cy.get('tbody tr')
        .eq(2)
        .should('contain', 'source-c');

      // Sort descending
      cy.findByText('Source').click();

      cy.get('tbody tr')
        .eq(0)
        .should('contain', 'source-c');

      cy.get('tbody tr')
        .eq(1)
        .should('contain', 'source-b');

      cy.get('tbody tr')
        .eq(2)
        .should('contain', 'source-a');

      // Sorting by the "Type" column
      // Sort ascending
      cy.findByText('Subaccount').click();

      cy.get('tbody tr')
        .eq(0)
        .should('contain', 'Subaccount 1');

      cy.get('tbody tr')
        .eq(1)
        .should('contain', 'Subaccount 2');

      cy.get('tbody tr')
        .eq(2)
        .should('contain', 'Subaccount 3');

      // Sort descending
      cy.findByText('Subaccount').click();

      cy.get('tbody tr')
        .eq(0)
        .should('contain', 'Subaccount 3');

      cy.get('tbody tr')
        .eq(1)
        .should('contain', 'Subaccount 2');

      cy.get('tbody tr')
        .eq(2)
        .should('contain', 'Subaccount 1');
    });

    it('does not render the "Subaccount" column when the user has no subaccounts', () => {
      cy.stubRequest({
        url: `/api/v1/users/${USERNAME}`,
        fixture: 'users/200.get.no-subaccounts.json',
      });

      cy.visit(PAGE_URL);

      cy.findByText('Subaccount').should('not.exist');
    });

    describe('table filtering that triggers network requests and updates suppression list results', () => {
      beforeEach(() => {
        cy.visit(PAGE_URL);

        cy.wait('@stubbedSuppressionListRequest');

        cy.stubRequest({
          url: SUPPRESSION_LIST_API_URL,
          fixture: 'suppression-list/200.get.filtered-results.json',
          requestAlias: 'stubbedFilteredRequest',
        });

        cy.findByText('filtered-fake-email@gmail.com').should('not.exist');
      });

      it('re-requests data when filtering by a broad date range', () => {
        cy.clock(Date.UTC(2019, 8, 11)); // freeze time

        cy.findByLabelText('Broad Date Range').select('Last Hour');
        cy.wait('@stubbedFilteredRequest').then(xhr => {
          cy.wrap(xhr.url).should('contain', 'from=2019-09-10T23:00');
          cy.wrap(xhr.url).should('contain', 'to=2019-09-11T00:00');
        });

        cy.findAllByText('filtered-fake-email@gmail.com').should('have.length', 2);
      });

      it('re-requests data when filtering by a narrow date range', () => {
        cy.findByLabelText('Narrow Date Range').click();
        cy.findByText('Apply').click();

        cy.findAllByText('filtered-fake-email@gmail.com').should('have.length', 2);
      });

      it('re-requests data when filtering by list type', () => {
        cy.findByLabelText('Type').click();
        cy.findByText('Transactional').click();
        cy.get('main').click({ position: 'bottomRight' }); // Clicking outside of the filter dropdown to trigger the change

        cy.findAllByText('filtered-fake-email@gmail.com').should('have.length', 2);
      });

      it('re-requests data when filtering by sources', () => {
        cy.findByLabelText('Sources').click();
        cy.findByText('Spam Complaint').click();
        cy.get('main').click({ position: 'bottomRight' }); // Clicking outside of the filter dropdown to trigger the change
      });
    });
  });

  it('renders the empty state when no results are returned', () => {
    cy.stubRequest({
      url: SUPPRESSION_LIST_API_URL,
      fixture: 'suppression-list/200.get.no-results.json',
    });

    cy.visit(PAGE_URL);

    cy.findByText('There are no results for your current query').should('be.visible');
  });

  it('renders an error when the server returns one', () => {
    cy.stubRequest({
      url: SUPPRESSION_LIST_API_URL,
      statusCode: 400,
      fixture: 'suppression-list/400.get.json',
    });

    cy.visit(PAGE_URL);

    cy.findByText('Something went wrong.').should('be.visible');
    cy.findByText('There are no results for your current query').should('be.visible');
  });
});
