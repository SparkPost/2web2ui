import { USERNAME } from 'cypress/constants';
import { LINKS } from 'src/constants';

const PAGE_URL = '/domains';

function verifyTableRow({ rowIndex, domainName, creationDate, subaccount, statusTags }) {
  cy.get('tbody tr')
    .eq(rowIndex)
    .within(() => {
      cy.get('td')
        .eq(0)
        .within(() => {
          cy.verifyLink({
            content: domainName,
            href: `/domains/details/sending-bounce/${domainName}`,
          });

          if (creationDate) cy.findByText(creationDate).should('be.visible');

          if (subaccount) cy.findByText(subaccount).should('be.visible');
        });

      cy.get('td')
        .eq(1)
        .within(() => {
          statusTags.forEach(tag => cy.findByText(tag).should('be.visible'));
        });
    });

  // Return the row to allow `.within()` chaining
  return cy.get('tbody tr').eq(rowIndex);
}

describe('The domains list page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });

    cy.stubRequest({
      url: '/api/v1/account',
      fixture: 'account/200.get.json',
      requestAlias: 'accountDomainsReq',
    });
  });

  it('renders with a relevant page title and redirects to the sending domain view', () => {
    cy.visit(PAGE_URL);

    cy.wait('@accountDomainsReq');

    cy.title().should('include', 'Domains');
    cy.findByRole('heading', { name: 'Domains' }).should('be.visible');
    cy.url().should('include', `${PAGE_URL}/list/sending`);
  });

  it('renders with a link to the domains create page', () => {
    cy.visit(PAGE_URL);

    cy.wait('@accountDomainsReq');

    cy.verifyLink({
      content: 'Add a Domain',
      href: '/domains/create?type=sending',
    });
  });

  it('renders tabs that route to different sending/bounce/tracking domain views when clicked', () => {
    cy.visit(PAGE_URL);

    cy.wait('@accountDomainsReq');

    // Going right to left since the first tab is already active!
    cy.findByRole('tab', { name: 'Tracking Domains' }).click({ force: true });
    cy.findByRole('tab', { name: 'Tracking Domains' }).should('have.attr', 'aria-selected', 'true');
    cy.url().should('include', `${PAGE_URL}/list/tracking`);

    cy.findByRole('tab', { name: 'Bounce Domains' }).click({ force: true });
    cy.findByRole('tab', { name: 'Bounce Domains' }).should('have.attr', 'aria-selected', 'true');
    cy.url().should('include', `${PAGE_URL}/list/bounce`);

    cy.findByRole('tab', { name: 'Sending Domains' }).click({ force: true });
    cy.findByRole('tab', { name: 'Sending Domains' }).should('have.attr', 'aria-selected', 'true');
    cy.url().should('include', `${PAGE_URL}/list/sending`);
  });

  it('successfully verifies the sending/bounce domain when url has token, mailbox and domain as query parameters and redirects to domain details page and navigating back to domains details does not show additional alerts', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.paginated-results.json' });
    stubSubaccounts();
    cy.stubRequest({
      url: '/api/v1/sending-domains/fake1.domain.com/verify',
      method: 'POST',
      fixture: 'sending-domains/verify/200.post-abusetoken.json',
      requestAlias: 'sendingDomainVerifyReq',
    });
    cy.stubRequest({
      url: '/api/v1/sending-domains/fake1.domain.com',
      fixture: 'sending-domains/200.get.all-verified.json',
      requestAlias: 'sendingDomainsReq',
    });
    cy.visit(`${PAGE_URL}/list/sending?token=faketoken&domain=fake1.domain.com&mailbox=abuse`);

    cy.wait(['@sendingDomainsReq', '@subaccountsReq', '@sendingDomainVerifyReq']);
    cy.findByText('fake1.domain.com has been verified').should('be.visible');
    cy.findByRole('heading', { name: 'Domain Details' }).should('be.visible');
    cy.findByText('All Domains').click();
    cy.findByText('fake1.domain.com has been verified').should('be.visible');
  });

  it('renders error when domain cannot be verified and the sending/bounce domain url has token, mailbox and domain as query parameters', () => {
    stubSendingDomains({ fixture: 'sending-domains/200.get.paginated-results.json' });
    stubSubaccounts();
    cy.stubRequest({
      url: '/api/v1/sending-domains/fake1.domain.com/verify',
      method: 'POST',
      fixture: 'sending-domains/verify/200.post.json',
      requestAlias: 'sendingDomainVerifyReq',
    });
    cy.visit(`${PAGE_URL}/list/sending?token=faketoken&domain=fake1.domain.com&mailbox=abuse`);

    cy.wait(['@sendingDomainsReq', '@subaccountsReq']);
    cy.findByText('Unable to verify fake1.domain.com').should('be.visible');
    cy.findByRole('heading', { name: 'Domains' }).should('be.visible');
  });
  /**
   * SENDING DOMAINS TABLE
   */
  describe('sending domains table', () => {
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

    it('syncs query param validSPF checkbox', () => {
      stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
      stubSubaccounts();
      cy.visit(`${PAGE_URL}/list/sending?validSPF=true`);
      cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

      cy.findByRole('button', { name: 'Domain Status' }).click();
      cy.findByLabelText('Verified').should('not.be.checked');
      cy.findByLabelText('DKIM Signing').should('not.be.checked');
      cy.findByLabelText('Bounce').should('not.be.checked');
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

  /**
   * BOUNCE DOMAINS TABLE
   */
  describe('bounce domains table', () => {
    it('renders a table after requesting sending domains - and renders only bounce domains', () => {
      stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
      stubSubaccounts();
      cy.visit(`${PAGE_URL}/list/bounce`);
      cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

      cy.get('tbody tr')
        .eq(0)
        .within(() => {
          cy.get('td')
            .eq(0)
            .within(() => {
              cy.verifyLink({
                content: 'default-bounce.com',
                href: `${PAGE_URL}/details/sending-bounce/default-bounce.com`,
              });
              cy.findByText('Aug 1, 2017');
            });
          cy.get('td')
            .eq(1)
            .within(() => {
              cy.findByText('Sending').should('be.visible');
              cy.findByText('Bounce').should('be.visible');
            });
        });
    });

    it('renders correct status checkbox in domain status filter', () => {
      stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
      stubSubaccounts();
      cy.visit(`${PAGE_URL}/list/bounce`);
      cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

      cy.findByRole('button', { name: 'Domain Status' }).click();

      cy.findByLabelText('Verified').should('be.visible');
      cy.findByLabelText('Unverified').should('be.visible');
      cy.findByLabelText('Blocked').should('be.visible');
      cy.findByLabelText('Bounce').should('not.exist');
      cy.findByLabelText('DKIM Signing').should('be.visible');
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

        cy.findByRole('tab', { name: 'Bounce Domains' }).click({ force: true });

        cy.findByRole('heading', { name: 'Bounce Domains' });

        cy.verifyLink({
          content: 'Add Bounce Domain',
          href: '/domains/create?type=bounce',
        });

        cy.verifyLink({
          content: 'Bounce Domains Documentation',
          href: LINKS.BOUNCE_DOMAIN_DOCS,
        });
        cy.findByText('Bounce Domains Documentation').should('have.length', 1);

        cy.findByText(
          'Custom bounce domains override the default Return-Path value, also known as the envelope FROM value, which denotes the destination for out-of-band bounces.',
        ).should('be.visible');

        cy.get('p').contains(
          'Bounce domains can be set up using an existing sending domain or by adding a new domain specifically for bounces. Only verified domains can be used for bounce domains. Unverified bounce domains will appear under Sending Domains.',
        );

        cy.findByText('Add a new bounce domain.').should('be.visible');

        cy.findByText('Configure the CNAME record with the domain provider.').should('be.visible');

        cy.findByText('Confirm that the bounce domain was successfully verified.').should(
          'be.visible',
        );
      });
    });

    it('renders an empty state banner above the table after requesting sending domains.', () => {
      stubSendingDomains({ fixture: 'sending-domains/200.get.json' });
      cy.visit(PAGE_URL);
      cy.wait(['@sendingDomainsReq']);

      // bounce domain tab
      cy.findByRole('tab', { name: 'Bounce Domains' }).click({ force: true });

      cy.findByRole('heading', { name: 'Bounce Domains' }).should('be.visible');

      cy.get('p').contains(
        'Custom bounce domains override the default Return-Path value, also known as the envelope FROM value, which denotes the destination for out-of-band bounces. Bounce domains can be set up using an existing Sending Domain or by adding a new domain specifically for bounce.',
      );
      cy.verifyLink({
        content: 'Bounce Domains Documentation',
        href: LINKS.BOUNCE_DOMAIN_DOCS,
      });
    });

    it('does not render an empty state banner above the table after requesting sending domains if the user dismissed it.', () => {
      stubSendingDomains({ fixture: 'sending-domains/200.get.json' });
      stubUsersRequest({ fixture: 'users/200.get.bounce-domain-banner-dismissed.json' });
      cy.visit(PAGE_URL);
      cy.wait(['@sendingDomainsReq']);

      // bounce domain tab
      cy.findByRole('tab', { name: 'Bounce Domains' }).click({ force: true });

      // banner content
      cy.findByRole('heading', { name: 'Bounce Domains' }).should('not.exist');
      cy.findByRole('button', { name: 'Bounce Domains Documentation' }).should('not.exist');
    });

    it('renders an error message when an error is returned from the server', () => {
      stubSendingDomains({ fixture: '400.json', statusCode: 400 });
      cy.visit(`${PAGE_URL}/list/bounce`);
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

    it('syncs query param domain name input', () => {
      stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
      stubSubaccounts();
      cy.visit(`${PAGE_URL}/list/bounce?domainName=spf-`);
      cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

      cy.findByText('There is no data to display').should('be.visible');
      cy.location().should(loc => {
        expect(loc.search).to.eq('?domainName=spf-');
      });
      // TODO: assert domain filter input is correct
    });

    it('syncs query param readyForSending checkbox', () => {
      stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
      stubSubaccounts();
      cy.visit(`${PAGE_URL}/list/bounce?readyForSending=true`);
      cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

      cy.findByRole('button', { name: 'Domain Status' }).click();
      cy.findByLabelText('Verified').should('be.checked');
      cy.findByLabelText('DKIM Signing').should('not.be.checked');
      cy.findByLabelText('Unverified').should('not.be.checked');
      cy.findByLabelText('Blocked').should('not.be.checked');

      verifyTableRow({
        rowIndex: 0,
        domainName: 'default-bounce.com',
        statusTags: ['Sending', 'Bounce'],
      });
      cy.location().should(loc => {
        expect(loc.search).to.eq('?readyForSending=true');
      });
    });

    it('syncs query param readyForDKIM checkbox', () => {
      stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
      stubSubaccounts();
      cy.visit(`${PAGE_URL}/list/bounce?readyForDKIM=true`);
      cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

      cy.findByRole('button', { name: 'Domain Status' }).click();
      cy.findByLabelText('Verified').should('not.be.checked');
      cy.findByLabelText('DKIM Signing').should('be.checked');
      cy.findByLabelText('Unverified').should('not.be.checked');
      cy.findByLabelText('Blocked').should('not.be.checked');

      cy.findByText('There is no data to display').should('be.visible');
      cy.location().should(loc => {
        expect(loc.search).to.eq('?readyForDKIM=true');
      });
    });

    it('syncs query param validSPF checkbox', () => {
      stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
      stubSubaccounts();
      cy.visit(`${PAGE_URL}/list/bounce?validSPF=true`);
      cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

      cy.findByRole('button', { name: 'Domain Status' }).click();
      cy.findByLabelText('Verified').should('not.be.checked');
      cy.findByLabelText('DKIM Signing').should('not.be.checked');
      cy.findByLabelText('Unverified').should('not.be.checked');
      cy.findByLabelText('Blocked').should('not.be.checked');

      cy.findByText('There is no data to display').should('be.visible');
      cy.location().should(loc => {
        expect(loc.search).to.eq('?validSPF=true');
      });
    });

    it('syncs query param unverified checkbox', () => {
      stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
      stubSubaccounts();
      cy.visit(`${PAGE_URL}/list/bounce?unverified=true`);
      cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

      cy.findByRole('button', { name: 'Domain Status' }).click();
      cy.findByLabelText('Verified').should('not.be.checked');
      cy.findByLabelText('DKIM Signing').should('not.be.checked');
      cy.findByLabelText('Unverified').should('be.checked');
      cy.findByLabelText('Blocked').should('not.be.checked');

      cy.findByText('There is no data to display').should('be.visible');
      cy.location().should(loc => {
        expect(loc.search).to.eq('?unverified=true');
      });
    });

    it('syncs query param blocked checkbox', () => {
      stubSendingDomains({ fixture: 'sending-domains/200.get.multiple-results.json' });
      stubSubaccounts();
      cy.visit(`${PAGE_URL}/list/bounce?blocked=true`);
      cy.wait(['@sendingDomainsReq', '@subaccountsReq']);

      cy.findByRole('button', { name: 'Domain Status' }).click();
      cy.findByLabelText('Verified').should('not.be.checked');
      cy.findByLabelText('DKIM Signing').should('not.be.checked');
      cy.findByLabelText('Unverified').should('not.be.checked');
      cy.findByLabelText('Blocked').should('be.checked');

      cy.findByText('There is no data to display').should('be.visible');
      cy.location().should(loc => {
        expect(loc.search).to.eq('?blocked=true');
      });
    });

    // NOTE: Filtering/sorting is not tested for this table here as this particular set of UI is using the same component as the sending domains table.
  });

  /**
   * TRACKING DOMAINS TABLE
   */
  describe('tracking domains table', () => {
    function verifyTableRow({ rowIndex, domainName, subaccount, status }) {
      cy.get('tbody tr')
        .eq(rowIndex)
        .within(() => {
          cy.get('td')
            .eq(0)
            .within(() => {
              cy.verifyLink({
                content: domainName,
                href: `/domains/details/tracking/${domainName}`,
              });

              if (subaccount) cy.findByText(subaccount).should('be.visible');
            });

          cy.get('td')
            .eq(1)
            .within(() => {
              cy.findByText(status).should('be.visible');
            });
        });

      // Return the row to allow `.within()` chaining
      return cy.get('tbody tr').eq(rowIndex);
    }

    function verifyMultipleResults() {
      verifyTableRow({
        rowIndex: 1,
        domainName: 'unverified.com',
        status: 'Unverified',
      });
      verifyTableRow({
        rowIndex: 3,
        domainName: 'verified.com',
        status: 'Tracking',
      });
      verifyTableRow({
        rowIndex: 2,
        domainName: 'verified-and-default.com',
        status: 'Tracking',
      }).within(() => {
        cy.findByDataId('default-tracking-domain-tooltip').click();
      });
      cy.findAllByText('Default Tracking Domain').should('be.visible');
      verifyTableRow({
        rowIndex: 0,
        domainName: 'blocked.com',
        status: 'Blocked',
      });
      verifyTableRow({
        rowIndex: 4,
        domainName: 'with-subaccount-assignment.com',
        status: 'Tracking',
        subaccount: 'Fake Subaccount 1 (101)',
      });
    }

    it('renders a table with pagination controls under it', () => {
      const PAGES_SELECTOR = '[data-id="pagination-pages"]';
      const PER_PAGE_SELECTOR = '[data-id="pagination-per-page"]';

      stubTrackingDomains({ fixture: 'tracking-domains/200.get.paginated.json' });
      stubSubaccounts();

      cy.visit(`${PAGE_URL}/list/tracking`);
      cy.wait(['@trackingDomainsReq', '@subaccountsReq']);

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
        domainName: 'with-subaccount-assignment.com',
        status: 'Tracking',
      });

      cy.get(PER_PAGE_SELECTOR).within(() => {
        cy.findAllByText('25').click();
      });

      cy.get('tbody').within(() => {
        cy.get('tr').should('have.length', 14);
      });

      verifyTableRow({
        rowIndex: 13,
        domainName: 'with-subaccount-assignment.com',
        status: 'Tracking',
      });

      cy.get(PER_PAGE_SELECTOR).within(() => {
        cy.findAllByText('10').click();
      });

      cy.get('tbody').within(() => {
        cy.get('tr').should('have.length', 10);
      });
    });

    it('renders requested tracking domains data in a table', () => {
      stubTrackingDomains();
      stubSubaccounts();
      cy.visit(`${PAGE_URL}/list/tracking`);
      cy.wait(['@trackingDomainsReq', '@subaccountsReq']);

      verifyMultipleResults();
    });

    it('renders an empty state when no results are returned and empty states is turned on', () => {
      stubTrackingDomains({ fixture: '200.get.no-results.json' });
      cy.visit(`${PAGE_URL}/list/tracking`);
      cy.wait('@trackingDomainsReq');

      cy.findByRole('tab', { name: 'Tracking Domains' }).click({ force: true });

      cy.withinMainContent(() => {
        cy.findByRole('table').should('not.exist');

        cy.findByRole('heading', { name: 'Tracking Domains' });

        cy.verifyLink({
          content: 'Add Tracking Domain',
          href: '/domains/create?type=tracking',
        });

        cy.verifyLink({
          content: 'Tracking Domains Documentation',
          href: LINKS.TRACKING_DOMAIN_DOCS,
        });
        cy.findByText('Tracking Domains Documentation').should('have.length', 1);

        cy.findByText(
          'Tracking domains are used in engagement tracking to report email opens and link clicks. Custom tracking domains will replace the domain portion of the URL.',
        ).should('be.visible');

        cy.findByText('Add a new tracking domain.').should('be.visible');

        cy.findByText('Configure the CNAME record with your domain provider.').should('be.visible');

        cy.findByText('Confirm that the tracking domain was successfully verified.').should(
          'be.visible',
        );
      });
    });

    it('renders an empty state banner above the table after requesting tracking domains.', () => {
      stubTrackingDomains();
      cy.visit(`${PAGE_URL}/list/tracking`);
      cy.wait('@trackingDomainsReq');
      cy.findByRole('tab', { name: 'Tracking Domains' }).click({ force: true });
      cy.findByRole('heading', { name: 'Tracking Domains' }).should('be.visible');
      cy.get('p').contains(
        'Tracking domains are used in engagement tracking to report email opens and link clicks. Custom tracking domains will replace the domain portion of the URL.',
      );
      cy.verifyLink({
        content: 'Tracking Domains Documentation',
        href: LINKS.TRACKING_DOMAIN_DOCS,
      });
    });

    it('does not render an empty state banner above the table after requesting tracking domains if the user dismissed it.', () => {
      stubTrackingDomains();
      stubUsersRequest({ fixture: 'users/200.get.tracking-domain-banner-dismissed.json' });
      cy.visit(`${PAGE_URL}/list/tracking`);
      cy.wait('@trackingDomainsReq');
      cy.findByRole('tab', { name: 'Tracking Domains' }).click({ force: true });
      cy.findByRole('heading', { name: 'Tracking Domains' }).should('not.exist');
      cy.findByRole('button', { name: 'Tracking Domains Documentation' }).should('not.exist');
    });

    it('renders an error message when an error is returned from the server', () => {
      stubTrackingDomains({ fixture: '400.json', statusCode: 400 });
      cy.visit(`${PAGE_URL}/list/tracking`);
      cy.wait('@trackingDomainsReq');

      cy.withinMainContent(() => {
        cy.findByRole('heading', { name: 'An error occurred' }).should('be.visible');
        cy.findByText('Sorry, we seem to have had some trouble loading your domains.').should(
          'be.visible',
        );
      });

      // Verifying that the list endpoint is re-requested, rendering the table successfully
      stubTrackingDomains();
      cy.findByRole('button', { name: 'Try Again' }).click();
      cy.wait('@trackingDomainsReq');
      cy.findByRole('table').should('be.visible');
    });

    it('filters by domain name when typing in the "Filter Domains" field', () => {
      stubTrackingDomains();
      stubSubaccounts();
      cy.visit(`${PAGE_URL}/list/tracking`);
      cy.wait(['@trackingDomainsReq', '@subaccountsReq']);

      // Verify partial match
      cy.findByLabelText('Filter Domains').type('verified.com');

      verifyTableRow({
        rowIndex: 0,
        domainName: 'unverified.com',
        status: 'Unverified',
      });
      verifyTableRow({
        rowIndex: 1,
        domainName: 'verified.com',
        status: 'Tracking',
      });

      // Clear the filter and verify all results are rendered
      cy.findByLabelText('Filter Domains').clear();
      verifyMultipleResults();

      // Verify exact match
      cy.findByLabelText('Filter Domains').type('unverified.com');

      verifyTableRow({
        rowIndex: 0,
        domainName: 'unverified.com',
        status: 'Unverified',
      });

      // No results

      cy.findByLabelText('Filter Domains')
        .clear()
        .type('abcdefghijklmnop');

      cy.get('table').should('not.exist');
      cy.findByText('There is no data to display').should('be.visible');
    });

    it('sorts alphabetically via the "Sort By" field', () => {
      stubTrackingDomains();
      stubSubaccounts();
      cy.visit(`${PAGE_URL}/list/tracking`);
      cy.wait(['@trackingDomainsReq', '@subaccountsReq']);

      cy.findByLabelText('Sort By').click();
      cy.findAllByText('Domain Name (Z - A)')
        .last()
        .click();

      verifyTableRow({
        rowIndex: 0,
        domainName: 'with-subaccount-assignment.com',
        status: 'Tracking',
        subaccount: 'Fake Subaccount 1 (101)',
      });
      verifyTableRow({
        rowIndex: 1,
        domainName: 'verified.com',
        status: 'Tracking',
      });
      verifyTableRow({
        rowIndex: 2,
        domainName: 'verified-and-default.com',
        status: 'Tracking',
      });
      verifyTableRow({
        rowIndex: 3,
        domainName: 'unverified.com',
        status: 'Unverified',
      });
      verifyTableRow({
        rowIndex: 4,
        domainName: 'blocked.com',
        status: 'Blocked',
      });
      cy.findByLabelText('Sort By').click();
      cy.findByRole('option', { name: 'Domain Name (A - Z)' }).click();

      verifyTableRow({
        rowIndex: 0,
        domainName: 'blocked.com',
        status: 'Blocked',
      });
      verifyTableRow({
        rowIndex: 1,
        domainName: 'unverified.com',
        status: 'Unverified',
      });
      verifyTableRow({
        rowIndex: 2,
        domainName: 'verified-and-default.com',
        status: 'Tracking',
      });
      verifyTableRow({
        rowIndex: 3,
        domainName: 'verified.com',
        status: 'Tracking',
      });
      verifyTableRow({
        rowIndex: 4,
        domainName: 'with-subaccount-assignment.com',
        status: 'Tracking',
        subaccount: 'Fake Subaccount 1 (101)',
      });
    });

    it('filters by domain status and renders correct status checkboxes', () => {
      stubTrackingDomains();
      stubSubaccounts();
      cy.visit(`${PAGE_URL}/list/tracking`);
      cy.wait(['@trackingDomainsReq', '@subaccountsReq']);

      cy.findByRole('button', { name: 'Domain Status' }).click();

      cy.findByLabelText('Verified').should('be.visible');
      cy.findByLabelText('Unverified').should('be.visible');
      cy.findByLabelText('Blocked').should('be.visible');

      cy.findByLabelText('Blocked').check({ force: true });
      verifyTableRow({
        rowIndex: 0,
        domainName: 'blocked.com',
        status: 'Blocked',
      });
      cy.location().should(loc => {
        expect(loc.search).to.eq('?blocked=true');
      });
      cy.get('tbody tr')
        .eq(1)
        .should('not.exist');

      cy.findByLabelText('Unverified').check({ force: true });
      verifyTableRow({
        rowIndex: 0,
        domainName: 'blocked.com',
        status: 'Blocked',
      });
      verifyTableRow({
        rowIndex: 1,
        domainName: 'unverified.com',
        status: 'Unverified',
      });
      cy.location().should(loc => {
        expect(loc.search).to.eq('?unverified=true&blocked=true');
      });
      cy.get('tbody tr')
        .eq(2)
        .should('not.exist');

      cy.findByLabelText('Verified').check({ force: true });
      verifyTableRow({
        rowIndex: 0,
        domainName: 'blocked.com',
        status: 'Blocked',
      });
      verifyTableRow({
        rowIndex: 1,
        domainName: 'unverified.com',
        status: 'Unverified',
      });
      verifyTableRow({
        rowIndex: 2,
        domainName: 'verified-and-default.com',
        status: 'Tracking',
      });
      verifyTableRow({
        rowIndex: 3,
        domainName: 'verified.com',
        status: 'Tracking',
      });
      verifyTableRow({
        rowIndex: 4,
        domainName: 'with-subaccount-assignment.com',
        status: 'Tracking',
      });
      cy.location().should(loc => {
        expect(loc.search).to.eq('?verified=true&unverified=true&blocked=true');
      });
      cy.get('tbody tr')
        .eq(5)
        .should('not.exist');
    });

    it('syncs query param verified checkbox', () => {
      stubTrackingDomains();
      stubSubaccounts();
      cy.visit(`${PAGE_URL}/list/tracking?verified=true`);
      cy.wait(['@trackingDomainsReq', '@subaccountsReq']);

      cy.findByRole('button', { name: 'Domain Status' }).click();
      cy.findByLabelText('Verified').should('be.checked');
      cy.findByLabelText('Unverified').should('not.be.checked');
      cy.findByLabelText('Blocked').should('not.be.checked');
    });

    it('syncs query param unverified checkbox', () => {
      stubTrackingDomains();
      stubSubaccounts();
      cy.visit(`${PAGE_URL}/list/tracking?unverified=true`);
      cy.wait(['@trackingDomainsReq', '@subaccountsReq']);

      cy.findByRole('button', { name: 'Domain Status' }).click();
      cy.findByLabelText('Verified').should('not.be.checked');
      cy.findByLabelText('Unverified').should('be.checked');
      cy.findByLabelText('Blocked').should('not.be.checked');
    });

    it('syncs query param blocked checkbox', () => {
      stubTrackingDomains();
      stubSubaccounts();
      cy.visit(`${PAGE_URL}/list/tracking?blocked=true`);
      cy.wait(['@trackingDomainsReq', '@subaccountsReq']);

      cy.findByRole('button', { name: 'Domain Status' }).click();
      cy.findByLabelText('Verified').should('not.be.checked');
      cy.findByLabelText('Unverified').should('not.be.checked');
      cy.findByLabelText('Blocked').should('be.checked');
    });
  });
});

function stubSendingDomains({
  fixture = 'sending-domains/200.get.json',
  requestAlias = 'sendingDomainsReq',
  statusCode = 200,
} = {}) {
  cy.stubRequest({
    url: '/api/v1/sending-domains',
    fixture,
    requestAlias,
    statusCode,
  });
}

// this is an override of the stub set by stubAuth
function stubUsersRequest({
  fixture = 'users/200.get.sending-domain-banner-dismissed.json',
  requestAlias = 'stubbedUsersRequest',
}) {
  cy.stubRequest({
    url: `/api/v1/users/${USERNAME}`,
    fixture,
    requestAlias,
  });
}

function stubSubaccounts({
  fixture = 'subaccounts/200.get.json',
  requestAlias = 'subaccountsReq',
} = {}) {
  cy.stubRequest({
    url: '/api/v1/subaccounts',
    fixture,
    requestAlias,
  });
}

function stubTrackingDomains({
  fixture = 'tracking-domains/200.get.json',
  requestAlias = 'trackingDomainsReq',
  statusCode = 200,
} = {}) {
  cy.stubRequest({
    url: '/api/v1/tracking-domains',
    fixture,
    requestAlias,
    statusCode,
  });
}
