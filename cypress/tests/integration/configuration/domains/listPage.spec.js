import { stubSendingDomains, stubSubaccounts } from './helpers';

const PAGE_URL = '/domains';

describe('The domains list page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });

  it('renders with a relevant page title and call-to-action, immediately redirecting to the sending domain view', () => {
    cy.visit(PAGE_URL);

    cy.title().should('include', 'Domains');
    cy.findByRole('heading', { name: 'Domains' }).should('be.visible');
    cy.verifyLink({
      content: 'Add a Domain',
      href: '/domains/create?type=sending',
    });

    cy.url().should('include', `${PAGE_URL}/list/sending`);
  });

  it('renders tabs that route to different sending/bounce/tracking domain views when clicked', () => {
    cy.visit(PAGE_URL);

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
    const domainName = 'with-a-subaccount.com';
    stubSendingDomains({ fixture: 'sending-domains/200.get.paginated-results.json' });
    stubSubaccounts();
    cy.stubRequest({
      url: `/api/v1/sending-domains/${domainName}/verify`,
      method: 'POST',
      fixture: 'sending-domains/verify/200.post-abusetoken.json',
      requestAlias: 'sendingDomainVerifyReq',
    });
    cy.stubRequest({
      url: `/api/v1/sending-domains/${domainName}`,
      fixture: 'sending-domains/200.get.all-verified.json',
      requestAlias: 'sendingDomainsReq',
    });
    cy.visit(`${PAGE_URL}/list/sending?token=faketoken&domain=${domainName}&mailbox=abuse`);

    cy.wait(['@sendingDomainsReq', '@subaccountsReq', '@sendingDomainVerifyReq']).then(xhr => {
      const {
        request: { headers },
      } = xhr[2];
      expect(headers).to.deep.equal({
        Accept: 'application/json, text/plain, */*',
        Authorization: 'fake_access_token',
        'Content-Type': 'application/json;charset=utf-8',
        'X-Sparky': '1d24c3473dd52a2f4a53fb6808cf9a73',
        'x-msys-subaccount': 101,
      });
    });
    cy.findByText(`${domainName} has been verified`).should('be.visible');
    cy.findByRole('heading', { name: 'Domain Details' }).should('be.visible');
    cy.findByText('All Domains').click();
    cy.findByText(`${domainName} has been verified`).should('be.visible');
  });

  it('renders an error when the domain cannot be verified and the sending/bounce domain url has token, mailbox and domain as query parameters', () => {
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
});
