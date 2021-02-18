import { LINKS } from 'src/constants';
import { stubSendingDomains, stubSubaccounts, stubUsersRequest, verifyTableRow } from '../helpers';

const PAGE_URL = '/domains';

describe('bounce domains table', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });

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
