const TEMPLATES_API_URL = '/api/v1/templates';
const PAGE_URL = '/templates';

describe('The templates list page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });

  it('has a relevant page title and relevant links', () => {
    cy.stubRequest({
      url: TEMPLATES_API_URL,
      fixture: 'templates/200.get.alphabetical-results.json',
      requestAlias: 'getTemplates',
    });
    cy.visit(PAGE_URL);
    cy.wait('@getTemplates');

    cy.title().should('include', 'Templates');
    cy.findByRole('heading', { name: 'Templates' }).should('be.visible');
    cy.verifyLink({
      content: 'Create Template',
      href: '/templates/create',
    });
    cy.findByRole('link', { name: 'Save As CSV' }).should('be.visible'); // This may seem semantically incorrect, but it's actually right! https://css-tricks.com/building-good-download-button/
  });

  it('renders an error message when an error occurs when fetching templates and then allows the user to re-request template data within the message', () => {
    cy.stubRequest({
      statusCode: 400,
      url: TEMPLATES_API_URL,
      fixture: 'templates/400.get.json',
    });

    cy.visit(PAGE_URL);

    cy.findByText('An error occurred').should('be.visible');
    cy.findByText('Show Error Details').click();
    cy.findByText('Error!').should('be.visible');
    cy.findByText('Hide Error Details').click();
    cy.findByText('Error!').should('not.exist');

    cy.stubRequest({
      url: TEMPLATES_API_URL,
      fixture: 'templates/200.get.3-results.json',
    });

    cy.findByText('Try Again').click();

    cy.findByText('Recent Activity').should('be.visible');
    cy.findAllByText('Stubbed Template 1').should('have.length', 2);
    cy.findAllByText('Stubbed Template 2').should('have.length', 2);
    cy.findAllByText('Stubbed Template 3').should('have.length', 2);
  });

  it('renders an empty state when no templates are returned with a "Create Template" button', () => {
    cy.stubRequest({
      url: TEMPLATES_API_URL,
      fixture: 'templates/200.get.no-results.json',
    });

    cy.visit(PAGE_URL);

    cy.findByText('Manage your email templates').should('be.visible');
    cy.verifyLink({
      content: 'Create Template',
      href: '/templates/create',
    });
  });

  it('it does not render the "Recent Activity" section when fewer than three template results are returned', () => {
    cy.stubRequest({
      url: TEMPLATES_API_URL,
      fixture: 'templates/200.get.2-results.json',
    });

    cy.visit(PAGE_URL);

    cy.findByText('Stubbed Template 1').should('be.visible');
    cy.findByText('Stubbed Template 2').should('be.visible');
    cy.findByText('Recent Activity').should('not.exist');
  });

  it('renders "Recent Activity" when three or more template results are returned', () => {
    cy.stubRequest({
      url: TEMPLATES_API_URL,
      fixture: 'templates/200.get.3-results.json',
    });

    cy.visit(PAGE_URL);

    cy.findByText('Recent Activity').should('be.visible');
    cy.findAllByText('Stubbed Template 1')
      .should('be.visible')
      .its('length')
      .should('be.eq', 2);
    cy.findAllByText('Stubbed Template 2').should('be.visible');
    cy.findAllByText('Stubbed Template 3').should('be.visible');
  });

  it('renders "Recent Activity" results with a duplicate action', () => {
    cy.stubRequest({
      url: TEMPLATES_API_URL,
      fixture: 'templates/200.get.3-results.json',
    });

    cy.stubRequest({
      url: '/api/v1/templates/stubbed-template-1',
      fixture: 'templates/stubbed-template-1/200.get.json',
    });

    cy.stubRequest({
      method: 'POST',
      url: '/api/v1/templates',
      fixture: 'templates/200.post.json',
      requestAlias: 'duplicateReq',
    });

    cy.visit(PAGE_URL);

    cy.findAllByText('Open Menu')
      .first()
      .click({ force: true }); // Content is only present for screen readers, requiring use of `force`

    cy.findByText('Duplicate Template').click();

    cy.findByLabelText(/Template Name/g).should('have.value', 'Stubbed Template 1 (COPY)');
    cy.findByLabelText(/Template ID/g).should('have.value', 'stubbed-template-1-copy');

    cy.withinModal(() => {
      cy.findByRole('button', { name: 'Duplicate' }).click();
    });

    cy.wait('@duplicateReq').then(({ request }) => {
      cy.wrap(request.body).should('have.property', 'name', 'Stubbed Template 1 (COPY)');
      cy.wrap(request.body).should('have.property', 'id', 'stubbed-template-1-copy');
    });

    cy.withinSnackbar(() => {
      cy.findByText('Template Stubbed Template 1 duplicated').should('be.visible');
    });
  });

  it('renders "Recent Activity" results with a delete action', () => {
    cy.stubRequest({
      url: TEMPLATES_API_URL,
      fixture: 'templates/200.get.3-results.json',
    });

    cy.stubRequest({
      method: 'DELETE',
      url: `${TEMPLATES_API_URL}/stubbed-template-1`,
      fixture: 'templates/stubbed-template-1/200.delete.json',
      requestAlias: 'deleteReq',
    });

    cy.visit(PAGE_URL);

    cy.findAllByText('Open Menu')
      .first()
      .click({ force: true }); // Content is only present for screen readers, requiring use of `force`

    cy.findByText('Delete Template').click();

    cy.withinModal(() => {
      cy.findByText('Are you sure you want to delete your template?').should('be.visible');
      cy.findByRole('button', { name: 'Delete All Versions' }).click();
    });

    cy.wait('@deleteReq');

    cy.withinSnackbar(() => {
      cy.findByText('Template Stubbed Template 1 deleted').should('be.visible');
    });
  });

  it('has a table that sorts by "Template Name" alphabetically"', () => {
    cy.stubRequest({
      url: TEMPLATES_API_URL,
      fixture: 'templates/200.get.alphabetical-results.json',
    });

    cy.visit(PAGE_URL);

    // Sorts by ascending
    cy.findByText('Template Name').click();

    cy.get('tbody tr')
      .eq(0)
      .should('contain', 'A');

    cy.get('tbody tr')
      .eq(1)
      .should('contain', 'B');

    cy.get('tbody tr')
      .eq(2)
      .should('contain', 'C');

    // Sorts by descending
    cy.findByText('Template Name').click();

    cy.get('tbody tr')
      .eq(0)
      .should('contain', 'C');

    cy.get('tbody tr')
      .eq(1)
      .should('contain', 'B');

    cy.get('tbody tr')
      .eq(2)
      .should('contain', 'A');
  });

  it('has a table that sorts by "Status" alphabetically', () => {
    cy.stubRequest({
      url: TEMPLATES_API_URL,
      fixture: 'templates/200.get.published-and-draft-results.json',
    });

    cy.visit(PAGE_URL);

    cy.findByText('Status').click();

    cy.get('tbody tr')
      .eq(0)
      .should('contain', 'Draft');

    cy.get('tbody tr')
      .eq(1)
      .should('contain', 'Draft');

    cy.get('tbody tr')
      .eq(2)
      .should('contain', 'Published');

    cy.get('tbody tr')
      .eq(3)
      .should('contain', 'Published');

    cy.findByText('Status').click();

    cy.get('tbody tr')
      .eq(0)
      .should('contain', 'Published');

    cy.get('tbody tr')
      .eq(1)
      .should('contain', 'Published');

    cy.get('tbody tr')
      .eq(2)
      .should('contain', 'Draft');

    cy.get('tbody tr')
      .eq(3)
      .should('contain', 'Draft');
  });

  it('has a table sorted by "Last Updated" in ascending and descending order by date', () => {
    cy.stubRequest({
      url: TEMPLATES_API_URL,
      fixture: 'templates/200.get.time-ordered-results.json',
    });

    cy.visit(PAGE_URL);

    cy.findByText('Last Updated').click();

    cy.get('tbody tr')
      .eq(0)
      .should('contain', 'August 11th');

    cy.get('tbody tr')
      .eq(1)
      .should('contain', 'August 12th');

    cy.get('tbody tr')
      .eq(2)
      .should('contain', 'August 13th');

    cy.findByText('Last Updated').click();

    cy.get('tbody tr')
      .eq(0)
      .should('contain', 'August 13th');

    cy.get('tbody tr')
      .eq(1)
      .should('contain', 'August 12th');

    cy.get('tbody tr')
      .eq(2)
      .should('contain', 'August 11th');
  });

  it('has table rows with a duplicate action that duplicates a template', () => {
    cy.stubRequest({
      url: TEMPLATES_API_URL,
      fixture: 'templates/200.get.3-results.json',
    });

    cy.stubRequest({
      url: '/api/v1/templates/stubbed-template-1',
      fixture: 'templates/stubbed-template-1/200.get.json',
    });

    cy.stubRequest({
      method: 'POST',
      url: TEMPLATES_API_URL,
      fixture: 'templates/200.post.json',
    });

    cy.visit(PAGE_URL);

    cy.findAllByText('Open Menu')
      .first()
      .click({ force: true });

    cy.findByText('Duplicate Template').click();

    cy.findByLabelText(/Template Name/g).should('have.value', 'Stubbed Template 1 (COPY)');
    cy.findByLabelText(/Template ID/g).should('have.value', 'stubbed-template-1-copy');

    cy.findByText('Duplicate').click();

    cy.findByText('Template Stubbed Template 1 duplicated').should('be.visible');
  });

  it('has table rows with a delete action that deletes a template', () => {
    cy.stubRequest({
      url: TEMPLATES_API_URL,
      fixture: 'templates/200.get.3-results.json',
    });

    cy.stubRequest({
      method: 'DELETE',
      url: '/api/v1/templates/stubbed-template-1',
      fixture: 'templates/stubbed-template-1/200.delete.json',
    });

    cy.visit(PAGE_URL);

    cy.findAllByText('Open Menu')
      .first()
      .click({ force: true });

    cy.findByText('Delete Template').click();

    cy.findByText('Are you sure you want to delete your template?').should('be.visible');

    cy.findByText('Delete All Versions').click();

    cy.findByText('Template Stubbed Template 1 deleted').should('be.visible');
  });

  it('filters results by name', () => {
    cy.stubRequest({
      url: TEMPLATES_API_URL,
      fixture: 'templates/200.get.3-results.json',
    });

    cy.visit(PAGE_URL);

    cy.findByLabelText('Filter By')
      .clear()
      .type('Stubbed Template 1');

    cy.get('table').within(() => {
      cy.findByText('Stubbed Template 2').should('not.exist');
      cy.findByText('Stubbed Template 3').should('not.exist');
    });

    cy.findByLabelText('Filter By')
      .clear()
      .type('Stubbed Template 2');

    cy.get('table').within(() => {
      cy.findByText('Stubbed Template 1').should('not.exist');
      cy.findByText('Stubbed Template 3').should('not.exist');
    });

    cy.findByLabelText('Filter By')
      .clear()
      .type('Stubbed Template 3');

    cy.get('table').within(() => {
      cy.findByText('Stubbed Template 1').should('not.exist');
      cy.findByText('Stubbed Template 2').should('not.exist');
    });

    cy.findByLabelText('Filter By')
      .clear()
      .type('Nothing will be found');

    cy.get('table').within(() => {
      cy.findByText('Stubbed Template 1').should('not.exist');
      cy.findByText('Stubbed Template 2').should('not.exist');
      cy.findByText('Stubbed Template 3').should('not.exist');
    });
  });
});
