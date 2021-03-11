const PAGE_URL = '/reports/message-events';

describe('The events page', () => {
  // Removes the first 3 filters (which are there by default).
  const removePresetFilters = () => {
    cy.findAllByText('Remove')
      .first()
      .click();
    cy.findAllByText('Remove')
      .first()
      .click();
    cy.findAllByText('Remove')
      .first()
      .click();
  };
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });

    cy.stubRequest({
      url: '/api/v1/events/message*',
      fixture: 'events/message/200.get.json',
      requestAlias: 'getMessageEvents',
    });

    cy.stubRequest({
      url: '/api/v1/events/message/documentation',
      fixture: 'events/message/documentation/200.get.json',
    });
  });

  it('has a relevant page title', () => {
    cy.visit(PAGE_URL);

    cy.title().should('include', 'Events Search | Events');
    cy.findByText('Events Search').should('be.visible');
  });

  it('renders an error when the request for events documentation data fails', () => {
    cy.stubRequest({
      statusCode: 400,
      url: '/api/v1/events/message/documentation',
      fixture: 'events/message/documentation/400.get.json',
    });

    cy.visit(PAGE_URL);

    cy.findByText('An error occurred').should('be.visible');
    cy.findByText('Show Error Details').click();
    cy.findByText('This is an error').should('be.visible');
    cy.findByText('Hide Error Details').click();
    cy.findByText('This is an error').should('not.exist');

    cy.stubRequest({
      url: '/api/v1/events/message/documentation',
      fixture: 'events/message/documentation/200.get.json',
    });

    cy.findByText('Try Again').click();
    cy.findByText('An error occurred').should('not.exist');
  });

  it('renders an error when the request for events data fails', () => {
    cy.stubRequest({
      statusCode: 400,
      url: '/api/v1/events/message*',
      fixture: 'events/message/400.get.json',
    });

    cy.visit(PAGE_URL);

    cy.findByText('An error occurred').should('be.visible');
    cy.findByText('Show Error Details').click();
    cy.findByText('This is an error').should('be.visible');
    cy.findByText('Hide Error Details').click();
    cy.findByText('This is an error').should('not.exist');

    cy.stubRequest({
      url: '/api/v1/events/message*',
      fixture: 'events/message/200.get.json',
    });

    cy.findByText('Try Again').click();
    cy.findByText('An error occurred').should('not.exist');
  });

  it('renders the "Share this report" modal when clicking on the "Share" button', () => {
    cy.visit(PAGE_URL);

    cy.findByRole('button', { name: 'Share' }).click();

    cy.findByText('Share this report').should('be.visible');
  });

  describe('filtering', () => {
    describe('by date', () => {
      it('re-requests data when filtering by "Broad Date Range"', () => {
        cy.clock(Date.UTC(2019, 8, 11)); // freeze time

        cy.visit(PAGE_URL);
        cy.wait('@getMessageEvents');

        cy.findByText('different-results@hotmail.com').should('not.exist');

        cy.stubRequest({
          url: '/api/v1/events/message*',
          fixture: 'events/message/200.get.different-results.json',
          requestAlias: 'eventsRequest',
        });

        cy.findByLabelText('Broad Date Range').select('Last 24 Hours');

        cy.wait('@eventsRequest').then(xhr => {
          cy.wrap(xhr.url).should('include', 'from=2019-09-10T00:00');
          cy.wrap(xhr.url).should('include', 'to=2019-09-11T00:00');
        });

        cy.findByText('different-results@hotmail.com').should('be.visible');
      });

      it('updates URL query params with relevant value when filtering by "Broad Date Range"', () => {
        cy.visit(PAGE_URL);

        cy.findByLabelText('Broad Date Range').select('Last Hour');
        cy.url().should('include', 'range=hour');
        cy.findByLabelText('Broad Date Range').select('Last 24 Hours');
        cy.url().should('include', 'range=day');
        cy.findByLabelText('Broad Date Range').select('Last 7 Days');
        cy.url().should('include', 'range=7days');
        cy.findByLabelText('Broad Date Range').select('Last 10 Days');
        cy.url().should('include', 'range=10days');
      });

      it('re-requests data when filtering by "Narrow Date Range"', () => {
        cy.visit(PAGE_URL);

        cy.findByText('different-results@hotmail.com').should('not.exist');

        cy.stubRequest({
          url: '/api/v1/events/message*',
          fixture: 'events/message/200.get.different-results.json',
          requestAlias: 'eventsRequest',
        });

        cy.findByLabelText('Narrow Date Range').click();
        cy.findByText('Apply').click();

        cy.findByText('different-results@hotmail.com').should('be.visible');
      });
    });

    it('re-requests events data when the user filters by a recipient email address', () => {
      cy.visit(PAGE_URL);

      cy.stubRequest({
        url: '/api/v1/events/message*',
        fixture: 'events/message/200.get.different-results.json',
        requestAlias: 'eventsRequest',
      });

      cy.findByLabelText('Filter by Recipient Email Address')
        .type('different-recipient@hotmail.com')
        .blur();

      cy.wait('@eventsRequest');

      cy.findByText('Recipients: different-recipient@hotmail.com').should('be.visible');
      cy.findByText('Clear All Filters').should('be.visible');
      cy.findByText('different-recipient@hotmail.com').should('be.visible'); // The new results are visible...
      cy.url().should('include', 'recipients=different-recipient%40hotmail.com');
      cy.findByText('fake-recipient@hotmail.com').should('not.exist'); // ...and the old results are not!
    });

    it('renders an invalid email address in the recipient email address filter when an invalid email is entered', () => {
      cy.visit(PAGE_URL);

      cy.findByLabelText('Filter by Recipient Email Address')
        .type('hello')
        .blur();

      cy.findByText('hello is not a valid email address').should('be.visible');

      cy.findByLabelText('Filter by Recipient Email Address')
        .clear()
        .type('@gmail.com')
        .blur();

      cy.findByText('@gmail.com is not a valid email address').should('be.visible');

      cy.findByLabelText('Filter by Recipient Email Address')
        .clear()
        .type('a@b')
        .blur();

      cy.findByText('a@b is not a valid email address').should('be.visible');

      cy.findByLabelText('Filter by Recipient Email Address')
        .clear()
        .type('a@b.c')
        .blur();

      cy.findByText('a@b.c is not a valid email address').should('not.exist');
    });

    it('re-requests data when removing an active filter and when clicking "Clear All Filters"', () => {
      cy.visit(PAGE_URL);

      cy.wait('@getMessageEvents');

      cy.stubRequest({
        url: '/api/v1/events/message*',
        fixture: 'events/message/200.get.different-results.json',
      });

      cy.findByLabelText('Filter by Recipient Email Address')
        .type('hello@gmail.com')
        .blur();

      cy.findByText('different-recipient@hotmail.com').should('be.visible');
      cy.findByText('fake-recipient@hotmail.com').should('not.exist');

      cy.stubRequest({
        url: '/api/v1/events/message*',
        fixture: 'events/message/200.get.json',
        requestAlias: 'getMessageEvents',
      });

      cy.findByText('Clear All Filters').click();

      cy.wait('@getMessageEvents');

      cy.findByText('fake-recipient@hotmail.com').should('be.visible');
      cy.findByText('different-recipient@hotmail.com').should('not.exist');
    });

    describe('the "Advanced Filters" modal', () => {
      beforeEach(() => {
        cy.visit(PAGE_URL);
        cy.findByText('Add Filters').click();
      });

      it('renders documentation about each event type when hovering over a check box label', () => {
        cy.findByText('Delay').trigger('mouseover');
        cy.findAllByText('Remote MTA has temporarily rejected a message.').should('be.visible');
        cy.findByText('Delay').trigger('mouseout');
        cy.findAllByText('Remote MTA has temporarily rejected a message.').should('not.be.visible');
      });

      it('allows the addition and removal of other filters via the "Add Filter" and "Remove" buttons', () => {
        const selectLabel = 'Filter By';
        const textFieldLabel = 'Filter';

        cy.findAllByLabelText(selectLabel).should('have.length', 4);
        cy.findAllByLabelText(textFieldLabel).should('have.length', 4);

        cy.findByText('Add Filter').click();

        cy.findAllByLabelText(selectLabel).should('have.length', 5);
        cy.findAllByLabelText(textFieldLabel).should('have.length', 5);

        cy.findAllByText('Remove')
          .first()
          .click();

        cy.findAllByLabelText(selectLabel).should('have.length', 4);
        cy.findAllByLabelText(textFieldLabel).should('have.length', 4);

        removePresetFilters();
        cy.findByText('Remove').click();

        cy.findByLabelText(selectLabel).should('not.exist');
        cy.findByLabelText(textFieldLabel).should('not.exist');
      });

      it('closes the modal when clicking "Cancel"', () => {
        cy.findByText('Cancel').click();

        cy.findByText('Advanced Filters').should('not.exist');
      });

      it('does not add in default filters if there are alreday filters', () => {
        const selectLabel = 'Filter By';
        const textFieldLabel = 'Filter';

        cy.visit(`${PAGE_URL}?subjects=test`);
        cy.findByText('Add Filters').click();

        cy.findAllByLabelText(selectLabel).should('have.length', 2);
        cy.findAllByLabelText(textFieldLabel).should('have.length', 2);
      });

      it('closes the modal and applies filters when clicking "Apply Filters" by re-requesting events data', () => {
        // `force` shouldn't be necessary, but due to component markup it is - Hibana component redesign may make this unnecessary
        cy.findByText('AMP Click').click({ force: true });
        cy.findByText('Out of Band').click({ force: true });
        removePresetFilters();
        cy.findByLabelText('Filter By').select('Recipient Domains');
        cy.findByLabelText('Filter').type('gmail.com');
        cy.findByText('Add Filter').click();
        cy.findAllByLabelText('Filter By')
          .last()
          .select('Subjects');
        cy.findAllByLabelText('Filter')
          .last()
          .type('Happy Birthday');

        cy.stubRequest({
          url: '/api/v1/events/message*',
          fixture: 'events/message/200.get.different-results.json',
        });

        cy.findByText('Apply Filters').click();

        cy.findByText('Advanced Filters').should('not.exist');
        cy.findByText('Event: Amp Click').should('be.visible');
        cy.url().should('include', 'events=amp_click');
        cy.findByText('Event: Out Of Band').should('be.visible');
        cy.url().should('include', 'events=out_of_band');
        cy.findByText('Recipient Domains: gmail.com').should('be.visible');
        cy.findByText('Subjects: Happy Birthday').should('be.visible');
        cy.findByText('These are different results').should('be.visible'); // The new results are visible...
        cy.findByText('fake-recipient@hotmail.com').should('not.exist'); // ...and the old results are not!
      });

      it('removes all filters when clicking "Clear All Filters"', () => {
        cy.findByText('AMP Click').click({ force: true });
        cy.findByText('Out of Band').click({ force: true });
        removePresetFilters();
        cy.findByLabelText('Filter By').select('Recipient Domains');
        cy.findByLabelText('Filter').type('gmail.com');
        cy.findByText('Apply Filters').click();

        cy.findByText('Event: Amp Click').should('be.visible');
        cy.findByText('Event: Out Of Band').should('be.visible');
        cy.findByText('Recipient Domains: gmail.com').should('be.visible');

        cy.findByText('Clear All Filters').click();

        cy.findByText('Event: Amp Click').should('not.exist');
        cy.findByText('Event: Out Of Band').should('not.exist');
        cy.findByText('Recipient Domains: gmail.com').should('not.exist');
      });
    });
  });

  describe('the events table', () => {
    describe('pagination', () => {
      const CURRENT_PAGE_SELECTOR = '[data-id="pagination-current-page"]';

      beforeEach(() => {
        cy.visit(PAGE_URL);

        cy.wait('@getMessageEvents');

        cy.stubRequest({
          url: '/api/v1/events/message*',
          fixture: 'events/message/200.get.different-results.json',
          requestAlias: 'eventsRequest',
        });
      });

      it('re-requests events data when clicking the "Next" pagination button while updating the current rendered page', () => {
        cy.findByText('different-results@hotmail.com').should('not.exist');
        cy.get(CURRENT_PAGE_SELECTOR).should('contain', '1');

        cy.findByText('Previous')
          .closest('button')
          .should('be.disabled');

        cy.findByText('Next')
          .closest('button') // The content is inside a `<span>` so this ensures the correct parent element is clicked
          .click();

        cy.findByText('different-results@hotmail.com').should('be.visible');
        cy.get(CURRENT_PAGE_SELECTOR).should('contain', '2');
        cy.findByText('Previous')
          .closest('button')
          .should('not.be.disabled');
      });

      it('returns to the previous page of results when clicking the "Previous" pagination button', () => {
        cy.get(CURRENT_PAGE_SELECTOR).should('contain', '1');

        cy.findByText('Next')
          .closest('button')
          .click();

        cy.findByText('Previous')
          .closest('button')
          .click();

        cy.findByText('fake-recipient@hotmail.com').should('be.visible');
        cy.get(CURRENT_PAGE_SELECTOR).should('contain', '1');
      });

      it('re-requests all data and returns the user to the first page of results when clicking the "Return to First Page" button', () => {
        cy.findByText('Next')
          .closest('button')
          .click();
        cy.findByText('Next')
          .closest('button')
          .click();

        cy.findByText('different-results@hotmail.com').should('be.visible');
        cy.get(CURRENT_PAGE_SELECTOR).should('contain', '3');

        cy.stubRequest({
          url: '/api/v1/events/message*',
          fixture: 'events/message/200.get.json',
        });

        cy.findByText('Return to First Page')
          .closest('button')
          .click();

        cy.findByText('different-results@hotmail.com').should('not.exist');
        cy.findByText('fake-recipient@hotmail.com').should('be.visible');
        cy.get(CURRENT_PAGE_SELECTOR).should('contain', '1');
      });
    });

    describe('per page buttons', () => {
      beforeEach(() => {
        cy.visit(PAGE_URL);

        cy.stubRequest({
          url: '/api/v1/events/message*',
          fixture: 'events/message/200.get.different-results.json',
        });

        cy.findByText('different-results@hotmail.com').should('not.exist');
      });

      it('re-requests events data when clicking on "100"', () => {
        cy.findByText('100').click();
        cy.findByText('different-results@hotmail.com').should('be.visible');
      });

      it('re-requests events data when clicking on "50"', () => {
        cy.findByText('50').click();
        cy.findByText('different-results@hotmail.com').should('be.visible');
      });

      it('re-requests events data when clicking on "25"', () => {
        cy.findByText('50').click(); // The table starts set to "25" so selecting this one requires a change
        cy.findByText('25').click();
        cy.findByText('different-results@hotmail.com').should('be.visible');
      });

      it('re-requests events data when clicking on "10"', () => {
        cy.findByText('10').click();
        cy.findByText('different-results@hotmail.com').should('be.visible');
      });
    });

    it('renders with a "View Details" button that links to the detail page for this event', () => {
      cy.visit(PAGE_URL);

      cy.findAllByText('View Details')
        .first()
        .closest('a')
        .should('have.attr', 'href', '/reports/message-events/details/mock-message-id-1/1234');

      cy.findAllByText('View Details')
        .last()
        .closest('a')
        .should('have.attr', 'href', '/reports/message-events/details/mock-message-id-2/5678');
    });

    it('renders the "Event", "Subject", "Recipient", "From Address", and event "Time" for each event', () => {
      cy.visit(PAGE_URL);

      cy.get('tbody tr')
        .first()
        .within(() => {
          cy.findByText('Mock Subject 1').should('be.visible');
          cy.findByText('fake-recipient@hotmail.com').should('be.visible');
          cy.findByText('fake-sender@hotmail.com').should('be.visible');
          cy.findByText('Injection').should('be.visible');
        });

      cy.get('tbody tr')
        .last()
        .within(() => {
          cy.findByText('Delivery').should('be.visible');
          cy.findByText('Mock Subject 2').should('be.visible');
          cy.findByText('fake-recipient@gmail.com').should('be.visible');
          cy.findByText('fake-sender@hotmail.com').should('be.visible');
        });
    });

    it('renders the empty state when no events are returned', () => {
      cy.stubRequest({
        url: '/api/v1/events/message*',
        fixture: 'events/message/200.get.no-results.json',
      });

      cy.visit(PAGE_URL);

      cy.findByText('There are no message events for your current query').should('be.visible');
      cy.get('table').should('not.exist');
    });
  });
});
