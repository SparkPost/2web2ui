import { commonBeforeSteps } from './helpers';
import { PAGE_URL } from './constants';

describe('Industry Benchmark', () => {
  beforeEach(() => {
    commonBeforeSteps();
    cy.stubRequest({
      url: '/api/v1/account',
      fixture: 'account/200.get.has-deliverability.json',
      requestAlias: 'getAccountD12y',
    });
    cy.stubRequest({
      url: '/api/v1/billing/subscription',
      fixture: 'billing/subscription/200.get.include-deliverability.json',
      requestAlias: 'getBillingSubscriptionD12y',
    });
    cy.stubRequest({
      url: '/api/v1/metrics/benchmarks/inbox-rate**',
      fixture: 'metrics/benchmarks/inbox-rate/200.get.json',
      requestAlias: 'getInboxFolderRate',
    });
  });

  it('does not show industry benchmark button without compatible metric', () => {
    cy.visit(`${PAGE_URL}&metrics[0]=count_inbox`);
    cy.findByRole('button', { name: 'Industry Benchmark' }).should('not.exist');
  });

  it('shows the default industry benchmark modal correctly', () => {
    cy.visit(`${PAGE_URL}&metrics[0]=inbox_folder_rate`);
    cy.findByRole('button', { name: 'Industry Benchmark' }).should('be.visible');
    cy.findByRole('button', { name: 'Industry Benchmark' }).click();
    cy.withinModal(() => {
      cy.findAllByText('Inbox Folder Rate Industry Benchmark').should('have.length', 2);
      //Toggle block has 2 labels, one actual label and another for screen readers
      cy.findByRole('checkbox', { name: 'Inbox Folder Rate Industry Benchmark' }).should(
        'not.be.checked',
      );
      cy.findByRole('combobox', { name: 'Mailbox Provider' }).should('have.value', 'all');
      cy.findByRole('combobox', { name: 'Industry' }).should('have.value', 'all');
    });
  });

  it('shows pre-filled industry benchmark modal if data is present in the URL', () => {
    cy.visit(
      `${PAGE_URL}&metrics[0]=inbox_folder_rate&industryBenchmarkMetric=inbox_folder_rate&industryBenchmarkFilters=%7B"industryCategory"%3A"b2b"%2C"mailboxProvider"%3A"gmail"%7D
`,
    );
    cy.wait('@getInboxFolderRate').then(xhr => {
      cy.wrap(xhr.url).should('contain', `industry_category=b2b`);
      cy.wrap(xhr.url).should('contain', `mailbox_provider=gmail`);
    });
    cy.findByRole('button', { name: 'Industry Benchmark' }).should('be.visible');
    cy.findByRole('button', { name: 'Industry Benchmark' }).click();
    cy.withinModal(() => {
      cy.findByRole('checkbox', { name: 'Inbox Folder Rate Industry Benchmark' }).should(
        'be.checked',
      );
      cy.findByRole('combobox', { name: 'Industry' }).should('have.value', 'b2b');
      cy.findByRole('combobox', { name: 'Mailbox Provider' }).should('have.value', 'gmail');
    });
  });

  it('changing industry benchmark modal settings updates the URL', () => {
    cy.visit(`${PAGE_URL}&metrics[0]=inbox_folder_rate`);
    cy.findByRole('button', { name: 'Industry Benchmark' }).click();
    cy.withinModal(() => {
      cy.findByRole('checkbox', { name: 'Inbox Folder Rate Industry Benchmark' }).check({
        force: true,
      });
      cy.findByRole('combobox', { name: 'Industry' }).select('b2b');
      cy.findByRole('combobox', { name: 'Mailbox Provider' }).select('gmail');
      cy.findByRole('button', { name: 'Display Benchmark' }).click();
    });
    cy.wait('@getInboxFolderRate').then(xhr => {
      cy.wrap(xhr.url).should('contain', `industry_category=b2b`);
      cy.wrap(xhr.url).should('contain', `mailbox_provider=gmail`);
    });

    cy.url().should('include', 'industryBenchmarkMetric=inbox_folder_rate');
    cy.url().should('include', 'industryBenchmarkFilters');
    cy.url().should('include', 'industryCategory');
    cy.url().should('include', 'b2b');
    cy.url().should('include', 'mailboxProvider');
    cy.url().should('include', 'gmail');
  });

  it('removing every industry benchmark metric removes the industry benchmark query params', () => {
    cy.visit(
      `${PAGE_URL}&metrics[0]=inbox_folder_rate&metrics[1]=count_accepted&industryBenchmarkFilters=%7B"industryCategory"%3A"all"%2C"mailboxProvider"%3A"all"%7D`,
    );
    cy.findByRole('button', { name: 'Add Metrics' }).click();

    cy.withinDrawer(() => {
      cy.findByLabelText('Inbox Folder Rate').uncheck({ force: true });

      cy.findByRole('button', { name: 'Apply Metrics' }).click();
    });

    cy.url().should('not.include', 'industryBenchmarkMetric=inbox_folder_rate');
    cy.url().should('not.include', 'industryBenchmarkFilters');
  });
});
