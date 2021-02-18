import { LINKS } from 'src/constants';
import { stubTrackingDomains, stubSubaccounts, stubUsersRequest } from '../helpers';

const PAGE_URL = '/domains';

describe('tracking domains table', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });

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
