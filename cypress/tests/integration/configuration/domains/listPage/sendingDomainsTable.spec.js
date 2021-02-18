import { LINKS } from 'src/constants';
import { stubSendingDomains, stubSubaccounts, stubUsersRequest, verifyTableRow } from '../helpers';

const PAGE_URL = '/domains';

describe('sending domains table', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });

  function verifyMultipleResults() {
    cy.findByRole('table').should('be.visible');

    verifyTableRow({
      rowIndex: 0,
      domainName: 'with-a-subaccount.com',
      creationDate: 'Aug 7, 2017',
      subaccount: 'Fake Subaccount 1 (101)',
      statusTags: ['Unverified'],
    });
    verifyTableRow({
      rowIndex: 1,
      domainName: 'blocked.com',
      creationDate: 'Aug 6, 2017',
      subaccount: 'Assignment: Primary Account',
      statusTags: ['Blocked'],
    });
    verifyTableRow({
      rowIndex: 2,
      domainName: 'spf-valid.com',
      creationDate: 'Aug 5, 2017',
      subaccount: 'Assignment: Primary Account',
      statusTags: [],
    });
    verifyTableRow({
      rowIndex: 3,
      domainName: 'dkim-signing.com',
      creationDate: 'Aug 4, 2017',
      subaccount: 'Assignment: Primary Account',
      statusTags: ['Sending', 'DKIM Signing'],
    });
    verifyTableRow({
      rowIndex: 4,
      domainName: 'fake1.domain.com',
      creationDate: 'Aug 3, 2017',
      subaccount: 'Assignment: Primary Account',
      statusTags: ['Unverified'],
    });
    verifyTableRow({
      rowIndex: 5,
      domainName: 'ready-for-sending.com',
      creationDate: 'Aug 2, 2017',
      subaccount: 'Assignment: Primary Account',
      statusTags: ['Sending'],
    });
    verifyTableRow({
      rowIndex: 6,
      domainName: 'default-bounce.com',
      creationDate: 'Aug 1, 2017',
      subaccount: 'Assignment: Primary Account',
      statusTags: ['Sending', 'Bounce'],
    }).within(() => {
      cy.findByDataId('default-bounce-domain-tooltip').click();
    });
    cy.findAllByText('Default Bounce Domain').should('be.visible');
  }

  it('renders a table with pagination controls under it', () => {
    const PAGES_SELECTOR = '[data-id="pagination-pages"]';
    const PER_PAGE_SELECTOR = '[data-id="pagination-per-page"]';

    stubSendingDomains({ fixture: 'sending-domains/200.get.paginated-results.json' });
    stubSubaccounts();

    cy.visit(PAGE_URL);
    cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

    cy.findAllByText('Per Page').should('be.visible');
    cy.get(PAGES_SELECTOR).within(() => {
      cy.findAllByText('1').should('be.visible');
      cy.findAllByText('2').should('be.visible');
      cy.findAllByText('3').should('not.exist');

      cy.findAllByRole('button', { name: 'Previous' }).should('be.disabled');
      cy.findAllByRole('button', { name: 'Next' }).should('not.be.disabled');
      cy.findAllByRole('button', { name: 'Next' }).click();
    });

    verifyTableRow({
      rowIndex: 3,
      domainName: 'wat5.com',
      creationDate: 'Aug 7, 1958',
      subaccount: 'Fake Subaccount 1 (101)',
      statusTags: ['Unverified'],
    });

    cy.get(PER_PAGE_SELECTOR).within(() => {
      cy.findAllByText('25').click();
    });

    cy.get('tbody').within(() => {
      cy.get('tr').should('have.length', 14);
    });

    verifyTableRow({
      rowIndex: 13,
      domainName: 'wat5.com',
      creationDate: 'Aug 7, 1958',
      subaccount: 'Fake Subaccount 1 (101)',
      statusTags: ['Unverified'],
    });

    cy.get(PER_PAGE_SELECTOR).within(() => {
      cy.findAllByText('10').click();
    });

    cy.get('tbody').within(() => {
      cy.get('tr').should('have.length', 10);
    });
  });

  it('renders a table after requesting sending domains', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
    stubSubaccounts();
    cy.visit(PAGE_URL);
    cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

    verifyMultipleResults();
  });

  it('renders an empty state when no results are returned and empty states is turned on', () => {
    cy.stubRequest({
      url: '/api/v1/sending-domains',
      fixture: '200.get.no-results.json',
      requestAlias: 'sendingDomainsReq',
    });
    cy.visit(PAGE_URL);
    cy.wait('@sendingDomainsReq');
    cy.withinMainContent(() => {
      cy.findByRole('table').should('not.exist');

      // Sending domain tab
      cy.get('p')
        .contains(
          'Sending domains are used to indicate who an email is from via the "From" header. DNS records can be configured for a sending domain, which allows recipient mail servers to authenticate messages sent from SparkPost.',
        )
        .should('be.visible');
      cy.get('p')
        .contains(
          'At least one verified sending domain is required in order to start sending or enable analytics.',
        )
        .should('be.visible');
      cy.findByText('Add a new sending domain.').should('be.visible');
      cy.findByText('Configure the domain provider to send with SparkPost.').should('be.visible');
      cy.findByText('Confirm that the sending domain was successfully verified.').should(
        'be.visible',
      );

      cy.verifyLink({
        content: 'Add Sending Domain',
        href: '/domains/create?type=sending',
      });

      cy.verifyLink({
        content: 'Sending Domains Documentation',
        href: LINKS.SENDING_DOMAIN_DOCS,
      });
      cy.findByText('Sending Domains Documentation').should('have.length', 1);
    });
  });

  it('renders an empty state banner above the table after requesting sending domains.', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.json' });
    cy.visit(PAGE_URL);
    cy.wait(['@sendingDomainsReq']);
    // banner content
    cy.findByRole('heading', { name: 'Sending Domains' }).should('be.visible');
    cy.findByText(
      'Sending domains are used to indicate who an email is from via the "From" header. DNS records can be configured for a sending domain, which allows recipient mail servers to authenticate messages sent from SparkPost.',
    ).should('be.visible');
    cy.verifyLink({
      content: 'Sending Domains Documentation',
      href: LINKS.SENDING_DOMAIN_DOCS,
    });
  });

  it('does not render an empty state banner above the table after requesting sending domains if the user dismissed it.', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.json' });
    stubUsersRequest({});
    cy.visit(PAGE_URL);
    cy.wait(['@sendingDomainsReq']);
    // banner content
    cy.findByRole('heading', { name: 'Sending Domains' }).should('not.exist');
    cy.findByText(
      'Sending domains are used to indicate who an email is from via the "From" header. DNS records can be configured for a sending domain, which allows recipient mail servers to authenticate messages sent from SparkPost.',
    ).should('not.exist');
    cy.findByRole('button', { name: 'Sending Domains Documentation' }).should('not.exist');
  });

  it('renders an error message when an error is returned from the server', () => {
    stubSendingDomains({ fixture: '400.json', statusCode: 400 });
    cy.visit(PAGE_URL);
    cy.wait('@sendingDomainsReq');

    cy.withinSnackbar(() => {
      cy.findByText('Something went wrong.').should('be.visible');
    });

    cy.withinMainContent(() => {
      cy.findByRole('heading', { name: 'An error occurred' }).should('be.visible');
      cy.findByText('Sorry, we seem to have had some trouble loading your domains.').should(
        'be.visible',
      );
      cy.findByRole('button', { name: 'Show Error Details' }).click();
      cy.findByText('This is an error').should('be.visible');
      cy.findByRole('button', { name: 'Hide Error Details' }).click();
      cy.findByText('This is an error').should('not.exist');
    });

    // Verifying that the list endpoint is re-requested, rendering the table successfully
    stubSendingDomains();
    cy.findByRole('button', { name: 'Try Again' }).click();
    cy.wait('@sendingDomainsReq');

    cy.findByRole('table').should('be.visible');
  });

  it('filters by domain name when typing in the "Filter Domains" field', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
    stubSubaccounts();
    cy.visit(PAGE_URL);
    cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

    // Partial domain name match
    cy.findByLabelText('Filter Domains').type('blocked');

    verifyTableRow({
      rowIndex: 0,
      domainName: 'blocked.com',
      creationDate: 'Aug 6, 2017',
      statusTags: ['Blocked'],
    });

    // Clearing the field removes the filter
    cy.findByLabelText('Filter Domains').clear();

    verifyMultipleResults();

    // Full domain name match
    cy.findByLabelText('Filter Domains').type('blocked.com');

    verifyTableRow({
      rowIndex: 0,
      domainName: 'blocked.com',
      creationDate: 'Aug 6, 2017',
      statusTags: ['Blocked'],
    });
  });

  it('sorts alphabetically via the "Sort By" field', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
    stubSubaccounts();
    cy.visit(PAGE_URL);
    cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

    cy.findByLabelText('Sort By').click();
    cy.findAllByText('Domain Name (A - Z)')
      .last()
      .click();

    verifyTableRow({
      rowIndex: 0,
      domainName: 'blocked.com',
      creationDate: 'Aug 6, 2017',
      statusTags: ['Blocked'],
    });
    verifyTableRow({
      rowIndex: 1,
      domainName: 'default-bounce.com',
      creationDate: 'Aug 1, 2017',
      statusTags: ['Sending', 'Bounce'],
    });
    verifyTableRow({
      rowIndex: 2,
      domainName: 'dkim-signing.com',
      creationDate: 'Aug 4, 2017',
      statusTags: ['Sending', 'DKIM Signing'],
    });
    verifyTableRow({
      rowIndex: 3,
      domainName: 'fake1.domain.com',
      creationDate: 'Aug 3, 2017',
      statusTags: ['Unverified'],
    });
    verifyTableRow({
      rowIndex: 4,
      domainName: 'ready-for-sending.com',
      creationDate: 'Aug 2, 2017',
      statusTags: ['Sending'],
    });
    verifyTableRow({
      rowIndex: 5,
      domainName: 'spf-valid.com',
      creationDate: 'Aug 5, 2017',
      statusTags: [],
    });
    verifyTableRow({
      rowIndex: 6,
      domainName: 'with-a-subaccount.com',
      creationDate: 'Aug 7, 2017',
      subaccount: 'Fake Subaccount 1 (101)',
      statusTags: ['Unverified'],
    });

    cy.findByLabelText('Sort By').click();
    cy.findByRole('option', { name: 'Domain Name (Z - A)' }).click();

    verifyTableRow({
      rowIndex: 0,
      domainName: 'with-a-subaccount.com',
      creationDate: 'Aug 7, 2017',
      subaccount: 'Fake Subaccount 1 (101)',
      statusTags: ['Unverified'],
    });
    verifyTableRow({
      rowIndex: 1,
      domainName: 'spf-valid.com',
      creationDate: 'Aug 5, 2017',
      statusTags: ['Sending'],
    });
    verifyTableRow({
      rowIndex: 2,
      domainName: 'ready-for-sending.com',
      creationDate: 'Aug 2, 2017',
      statusTags: ['Sending'],
    });
    verifyTableRow({
      rowIndex: 3,
      domainName: 'fake1.domain.com',
      creationDate: 'Aug 3, 2017',
      statusTags: ['Unverified'],
    });
    verifyTableRow({
      rowIndex: 4,
      domainName: 'dkim-signing.com',
      creationDate: 'Aug 4, 2017',
      statusTags: ['Sending', 'DKIM Signing'],
    });
    verifyTableRow({
      rowIndex: 5,
      domainName: 'default-bounce.com',
      creationDate: 'Aug 1, 2017',
      statusTags: ['Sending', 'Bounce'],
    });
    verifyTableRow({
      rowIndex: 6,
      domainName: 'blocked.com',
      creationDate: 'Aug 6, 2017',
      statusTags: ['Blocked'],
    });
  });

  it('sorts chronologically via the "Sort By" field', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
    stubSubaccounts();
    cy.visit(PAGE_URL);
    cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

    cy.findByLabelText('Sort By').click();
    cy.findAllByText('Date Added (Newest - Oldest)')
      .last()
      .click();

    verifyTableRow({
      rowIndex: 0,
      domainName: 'with-a-subaccount.com',
      creationDate: 'Aug 7, 2017',
      subaccount: 'Fake Subaccount 1 (101)',
      statusTags: ['Unverified'],
    });
    verifyTableRow({
      rowIndex: 1,
      domainName: 'blocked.com',
      creationDate: 'Aug 6, 2017',
      statusTags: ['Blocked'],
    });
    verifyTableRow({
      rowIndex: 2,
      domainName: 'spf-valid.com',
      creationDate: 'Aug 5, 2017',
      statusTags: [],
    });
    verifyTableRow({
      rowIndex: 3,
      domainName: 'dkim-signing.com',
      creationDate: 'Aug 4, 2017',
      statusTags: ['Sending', 'DKIM Signing'],
    });
    verifyTableRow({
      rowIndex: 4,
      domainName: 'fake1.domain.com',
      creationDate: 'Aug 3, 2017',
      statusTags: ['Unverified'],
    });
    verifyTableRow({
      rowIndex: 5,
      domainName: 'ready-for-sending.com',
      creationDate: 'Aug 2, 2017',
      statusTags: ['Sending'],
    });
    verifyTableRow({
      rowIndex: 6,
      domainName: 'default-bounce.com',
      creationDate: 'Aug 1, 2017',
      statusTags: ['Sending', 'Bounce'],
    });

    cy.findByLabelText('Sort By').click();
    cy.findByRole('option', { name: 'Date Added (Oldest - Newest)' }).click();

    verifyTableRow({
      rowIndex: 0,
      domainName: 'default-bounce.com',
      creationDate: 'Aug 1, 2017',
      statusTags: ['Sending', 'Bounce'],
    });
    verifyTableRow({
      rowIndex: 1,
      domainName: 'ready-for-sending.com',
      creationDate: 'Aug 2, 2017',
      statusTags: ['Sending'],
    });
    verifyTableRow({
      rowIndex: 2,
      domainName: 'fake1.domain.com',
      creationDate: 'Aug 3, 2017',
      statusTags: ['Unverified'],
    });
    verifyTableRow({
      rowIndex: 3,
      domainName: 'dkim-signing.com',
      creationDate: 'Aug 4, 2017',
      statusTags: ['Sending', 'DKIM Signing'],
    });
    verifyTableRow({
      rowIndex: 4,
      domainName: 'spf-valid.com',
      creationDate: 'Aug 5, 2017',
      statusTags: [],
    });
    verifyTableRow({
      rowIndex: 5,
      domainName: 'blocked.com',
      creationDate: 'Aug 6, 2017',
      statusTags: ['Blocked'],
    });
    verifyTableRow({
      rowIndex: 6,
      domainName: 'with-a-subaccount.com',
      creationDate: 'Aug 7, 2017',
      subaccount: 'Fake Subaccount 1 (101)',
      statusTags: ['Unverified'],
    });
  });

  it('all domain status are checked if select all is checked and select all is not checked if even one of checkbox is unchecked', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
    stubSubaccounts();
    cy.visit(PAGE_URL);
    cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

    cy.findByRole('button', { name: 'Domain Status' }).click();

    cy.findByLabelText('Verified').uncheck({ force: true });
    cy.findByLabelText('Unverified').uncheck({ force: true });
    cy.findByLabelText('Blocked').uncheck({ force: true });
    cy.findByLabelText('Bounce').uncheck({ force: true });
    cy.findByLabelText('DKIM Signing').uncheck({ force: true });
    cy.findByLabelText('Select All').check({ force: true });
    cy.findByLabelText('Verified').should('be.checked');
    cy.findByLabelText('Unverified').should('be.checked');
    cy.findByLabelText('Blocked').should('be.checked');
    cy.findByLabelText('Bounce').should('be.checked');
    cy.findByLabelText('DKIM Signing').should('be.checked');

    cy.findByLabelText('DKIM Signing').uncheck({ force: true });
    cy.findByLabelText('Select All').should('not.be.checked');
  });

  it('filters by domain status', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
    stubSubaccounts();
    cy.visit(PAGE_URL);
    cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

    cy.findByRole('button', { name: 'Domain Status' }).click();

    cy.findByLabelText('Verified').should('be.visible');
    cy.findByLabelText('Unverified').should('be.visible');
    cy.findByLabelText('Blocked').should('be.visible');
    cy.findByLabelText('Bounce').should('be.visible');
    cy.findByLabelText('DKIM Signing').should('be.visible');

    verifyTableRow({
      rowIndex: 1,
      domainName: 'blocked.com',
      creationDate: 'Aug 6, 2017',
      statusTags: ['Blocked'],
    });

    cy.findByLabelText('Blocked').check({ force: true });

    verifyTableRow({
      rowIndex: 0,
      domainName: 'blocked.com',
      creationDate: 'Aug 6, 2017',
      statusTags: ['Blocked'],
    });

    cy.findByLabelText('Unverified').check({ force: true });
    verifyTableRow({
      rowIndex: 0,
      domainName: 'with-a-subaccount.com',
      creationDate: 'Aug 7, 2017',
      statusTags: ['Unverified'],
    });
    verifyTableRow({
      rowIndex: 1,
      domainName: 'blocked.com',
      creationDate: 'Aug 6, 2017',
      statusTags: ['Blocked'],
    });
    verifyTableRow({
      rowIndex: 2,
      domainName: 'fake1.domain.com',
      creationDate: 'Aug 3, 2017',
      statusTags: ['Unverified'],
    });
    cy.get('tbody tr')
      .eq(3)
      .should('not.exist');

    cy.findByLabelText('Bounce').check({ force: true });
    verifyTableRow({
      rowIndex: 0,
      domainName: 'with-a-subaccount.com',
      creationDate: 'Aug 7, 2017',
      statusTags: ['Unverified'],
    });
    verifyTableRow({
      rowIndex: 1,
      domainName: 'blocked.com',
      creationDate: 'Aug 6, 2017',
      statusTags: ['Blocked'],
    });
    verifyTableRow({
      rowIndex: 2,
      domainName: 'fake1.domain.com',
      creationDate: 'Aug 3, 2017',
      statusTags: ['Unverified'],
    });
    verifyTableRow({
      rowIndex: 3,
      domainName: 'default-bounce.com',
      creationDate: 'Aug 1, 2017',
      statusTags: ['Sending', 'Bounce'],
    });
    cy.get('tbody tr')
      .eq(5)
      .should('not.exist');

    cy.findByLabelText('DKIM Signing').check({ force: true });
    verifyTableRow({
      rowIndex: 0,
      domainName: 'with-a-subaccount.com',
      creationDate: 'Aug 7, 2017',
      statusTags: ['Unverified'],
    });
    verifyTableRow({
      rowIndex: 1,
      domainName: 'blocked.com',
      creationDate: 'Aug 6, 2017',
      statusTags: ['Blocked'],
    });
    verifyTableRow({
      rowIndex: 2,
      domainName: 'dkim-signing.com',
      creationDate: 'Aug 4, 2017',
      statusTags: ['Sending', 'DKIM Signing'],
    });
    verifyTableRow({
      rowIndex: 3,
      domainName: 'fake1.domain.com',
      creationDate: 'Aug 3, 2017',
      statusTags: ['Unverified'],
    });
    verifyTableRow({
      rowIndex: 4,
      domainName: 'default-bounce.com',
      creationDate: 'Aug 1, 2017',
      statusTags: ['Sending', 'Bounce'],
    });
    cy.get('tbody tr')
      .eq(5)
      .should('not.exist');

    cy.findByLabelText('Verified').check({ force: true });
    verifyTableRow({
      rowIndex: 0,
      domainName: 'with-a-subaccount.com',
      creationDate: 'Aug 7, 2017',
      statusTags: ['Unverified'],
    });
    verifyTableRow({
      rowIndex: 1,
      domainName: 'blocked.com',
      creationDate: 'Aug 6, 2017',
      statusTags: ['Blocked'],
    });
    verifyTableRow({
      rowIndex: 4,
      domainName: 'fake1.domain.com',
      creationDate: 'Aug 3, 2017',
      statusTags: ['Unverified'],
    });
    verifyTableRow({
      rowIndex: 6,
      domainName: 'default-bounce.com',
      creationDate: 'Aug 1, 2017',
      statusTags: ['Sending', 'Bounce'],
    });
    cy.get('tbody tr')
      .eq(7)
      .should('not.exist');
  });

  it('syncs query param domain name input', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
    stubSubaccounts();
    cy.visit(`${PAGE_URL}/list/sending?domainName=spf-`);
    cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

    verifyTableRow({
      rowIndex: 0,
      domainName: 'spf-valid.com',
      statusTags: ['Sending'],
    });
  });

  it('syncs query param readyForSending checkbox', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
    stubSubaccounts();
    cy.visit(`${PAGE_URL}/list/sending?readyForSending=true`);
    cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

    cy.findByRole('button', { name: 'Domain Status' }).click();
    cy.findByLabelText('Verified').should('be.checked');
    cy.findByLabelText('DKIM Signing').should('not.be.checked');
    cy.findByLabelText('Bounce').should('not.be.checked');
    cy.findByLabelText('Unverified').should('not.be.checked');
    cy.findByLabelText('Blocked').should('not.be.checked');

    verifyTableRow({
      rowIndex: 0,
      domainName: 'spf-valid.com',
      statusTags: ['Sending'],
    });
    verifyTableRow({
      rowIndex: 1,
      domainName: 'dkim-signing.com',
      statusTags: ['Sending', 'DKIM Signing'],
    });
    verifyTableRow({
      rowIndex: 2,
      domainName: 'ready-for-sending.com',
      statusTags: ['Sending'],
    });
    verifyTableRow({
      rowIndex: 3,
      domainName: 'default-bounce.com',
      statusTags: ['Sending', 'Bounce'],
    });
  });

  it('syncs query param readyForDKIM checkbox', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
    stubSubaccounts();
    cy.visit(`${PAGE_URL}/list/sending?readyForDKIM=true`);
    cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

    cy.findByRole('button', { name: 'Domain Status' }).click();
    cy.findByLabelText('Verified').should('not.be.checked');
    cy.findByLabelText('DKIM Signing').should('be.checked');
    cy.findByLabelText('Bounce').should('not.be.checked');
    cy.findByLabelText('Unverified').should('not.be.checked');
    cy.findByLabelText('Blocked').should('not.be.checked');
  });

  it('syncs query param readyForBounce checkbox', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
    stubSubaccounts();
    cy.visit(`${PAGE_URL}/list/sending?readyForBounce=true`);
    cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

    cy.findByRole('button', { name: 'Domain Status' }).click();
    cy.findByLabelText('Verified').should('not.be.checked');
    cy.findByLabelText('DKIM Signing').should('not.be.checked');
    cy.findByLabelText('Bounce').should('be.checked');
    cy.findByLabelText('Unverified').should('not.be.checked');
    cy.findByLabelText('Blocked').should('not.be.checked');
  });

  it('syncs query param unverified checkbox', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
    stubSubaccounts();
    cy.visit(`${PAGE_URL}/list/sending?unverified=true`);
    cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

    cy.findByRole('button', { name: 'Domain Status' }).click();
    cy.findByLabelText('Verified').should('not.be.checked');
    cy.findByLabelText('DKIM Signing').should('not.be.checked');
    cy.findByLabelText('Bounce').should('not.be.checked');
    cy.findByLabelText('Unverified').should('be.checked');
    cy.findByLabelText('Blocked').should('not.be.checked');
  });

  it('syncs query param blocked checkbox', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
    stubSubaccounts();
    cy.visit(`${PAGE_URL}/list/sending?blocked=true`);
    cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

    cy.findByRole('button', { name: 'Domain Status' }).click();
    cy.findByLabelText('Verified').should('not.be.checked');
    cy.findByLabelText('DKIM Signing').should('not.be.checked');
    cy.findByLabelText('Bounce').should('not.be.checked');
    cy.findByLabelText('Unverified').should('not.be.checked');
    cy.findByLabelText('Blocked').should('be.checked');
  });

  it('Resets domain status filter state when switching from sending to bounce', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
    stubSubaccounts();

    cy.visit(`${PAGE_URL}/list/sending?blocked=true`);
    cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

    cy.findByRole('button', { name: 'Domain Status' }).click();
    cy.findByLabelText('Select All').should('not.be.checked');
    cy.findByLabelText('Verified').should('not.be.checked');
    cy.findByLabelText('DKIM Signing').should('not.be.checked');
    cy.findByLabelText('Bounce').should('not.be.checked');
    cy.findByLabelText('Unverified').should('not.be.checked');
    cy.findByLabelText('Blocked').should('be.checked');

    cy.findByRole('tab', { name: 'Bounce Domains' }).click({ force: true });
    cy.findByRole('button', { name: 'Domain Status' }).click();
    cy.findByLabelText('Select All').should('not.be.checked');
    cy.findByLabelText('Verified').should('not.be.checked');
    cy.findByLabelText('DKIM Signing').should('not.be.checked');
    cy.findByLabelText('Unverified').should('not.be.checked');
    cy.findByLabelText('Blocked').should('not.be.checked');

    verifyTableRow({
      rowIndex: 0,
      domainName: 'default-bounce.com',
      creationDate: 'Aug 1, 2017',
      statusTags: ['Sending', 'Bounce'],
    });
    cy.get('tbody tr')
      .eq(1)
      .should('not.exist');
  });

  it('Persists the domain status filter state when switching from bounce to sending', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
    stubSubaccounts();

    cy.visit(`${PAGE_URL}/list/bounce?readyForDKIM=true`);
    cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

    cy.findByRole('button', { name: 'Domain Status' }).click();

    cy.findByLabelText('Select All').should('not.be.checked');
    cy.findByLabelText('Verified').should('not.be.checked');
    cy.findByLabelText('DKIM Signing').should('be.checked');
    cy.findByLabelText('Unverified').should('not.be.checked');
    cy.findByLabelText('Blocked').should('not.be.checked');

    cy.findByRole('tab', { name: 'Sending Domains' }).click({ force: true });
    cy.findByRole('button', { name: 'Domain Status' }).click();

    verifyTableRow({
      rowIndex: 0,
      domainName: 'dkim-signing.com',
      creationDate: 'Aug 4, 2017',
      statusTags: ['Sending', 'DKIM Signing'],
    });
    cy.get('tbody tr')
      .eq(1)
      .should('not.exist');
  });

  it('syncs query param selectAll checkbox', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
    stubSubaccounts();
    cy.visit(`${PAGE_URL}/list/sending?selectAll=true`);
    cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

    cy.findByRole('button', { name: 'Domain Status' }).click();
    cy.findByRole('button', { name: 'Domain Status' }).click();
    cy.findByLabelText('Verified').should('not.be.checked');
    cy.findByLabelText('DKIM Signing').should('not.be.checked');
    cy.findByLabelText('Bounce').should('not.be.checked');
    cy.findByLabelText('Unverified').should('not.be.checked');
    cy.findByLabelText('Blocked').should('not.be.checked');
  });
});
