const BASE_UI_URL = '/domains/details';
const TRACKING_DETAILS_URL = `${BASE_UI_URL}/tracking`;
const SENDING_BOUNCE_DETAILS_URL = `${BASE_UI_URL}/sending-bounce`;

let trackingDomainsList = require('cypress/fixtures/tracking-domains/200.get.json');

describe('The domains details page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
  });

  describe('The domains details page', () => {
    beforeEach(() => {
      cy.stubRequest({
        url: '/api/v1/account',
        fixture: 'account/200.get.json',
        requestAlias: 'accountDomainsReq',
      });
    });

    it('renders with a relevant page title', () => {
      cy.stubRequest({
        url: '/api/v1/tracking-domains',
        fixture: 'tracking-domains/200.get.domain-details.json',
        requestAlias: 'trackingDomainsList',
      });
      cy.visit(`${TRACKING_DETAILS_URL}/blah231231231.gmail.com`);

      cy.wait('@accountDomainsReq');

      cy.title().should('include', 'Domain Details');
      cy.findByRole('heading', { name: 'Domain Details' }).should('be.visible');
    });

    describe('Domain Details Page for Tracking Domains', () => {
      it('if a domain is not found it redirects to the List Page', () => {
        cy.stubRequest({
          url: '/api/v1/tracking-domains',
          fixture: 'tracking-domains/200.get.domain-details.json',
          requestAlias: 'trackingDomainsList',
        });
        cy.visit(`${TRACKING_DETAILS_URL}/blah.com`);

        cy.wait(['@accountDomainsReq', '@trackingDomainsList']);
        cy.findByRole('heading', { name: 'Domains' }).should('be.visible');
        cy.url().should('include', '/domains/list');
      });

      it('For unverified Tracking Domain sections are rendered correctly along with a unverified banner', () => {
        cy.stubRequest({
          url: '/api/v1/tracking-domains',
          fixture: 'tracking-domains/200.get.domain-details.json',
          requestAlias: 'trackingDomainsList',
        });
        cy.visit(`${TRACKING_DETAILS_URL}/blah231231231.gmail.com`);

        cy.wait(['@accountDomainsReq', '@trackingDomainsList']);
        cy.findAllByText('Unverified domains will be removed two weeks after being added.');
        cy.findByText('Domains Documentation')
          .closest('a')
          .should(
            'have.attr',
            'href',
            'https://www.sparkpost.com/docs/tech-resources/enabling-multiple-custom-tracking-domains/',
          );

        cy.get('p')
          .contains(
            'Add the CNAME records, Hostnames, and Values for this domain in the settings section of your DNS provider.',
          )
          .should('be.visible');

        cy.findByRole('button', { name: 'Verify Domain' }).click();
        cy.findAllByText('Please confirm you have added the records to your DNS provider.').should(
          'be.visible',
        );

        cy.findAllByLabelText('The CNAME record has been added to the DNS provider.').click({
          force: true,
        });

        cy.findAllByText('Please confirm you have added the records to your DNS provider.').should(
          'not.exist',
        );
      });

      it('verified Tracking Domain with assigned subaccount functions correctly', () => {
        let domainName = 'track1.spappteam.com';
        cy.stubRequest({
          url: '/api/v1/tracking-domains',
          fixture: 'tracking-domains/200.get.domain-details.json',
          requestAlias: 'trackingDomainsList',
        });

        cy.stubRequest({
          url: '/api/v1/subaccounts',
          fixture: 'subaccounts/200.get.json',
          requestAlias: 'subaccountList',
        });

        cy.stubRequest({
          method: 'DELETE',
          url: `/api/v1/tracking-domains/${domainName}`,
          fixture: 'subaccounts/200.get.json',
          requestAlias: 'deleteDomain',
        });

        cy.stubRequest({
          method: 'POST',
          url: `/api/v1/tracking-domains/${domainName}/verify`,
          fixture: 'tracking-domains/verify/200.post.json',
          request: 'reverifyDomain',
        });

        cy.visit(`${TRACKING_DETAILS_URL}/${domainName}`);

        cy.wait(['@accountDomainsReq', '@trackingDomainsList', '@subaccountList']);

        cy.findByText('Domain').should('be.visible');
        cy.findByText(`${domainName}`).should('be.visible');
        cy.findByText('Subaccount Assignment').should('be.visible');
        cy.findByText('Fake Subaccount 4 (104)').should('be.visible');
        cy.findByRole('checkbox', { label: 'Set as Default Tracking Domain' }).should('be.checked');

        cy.findByRole('button', { name: 'Re-Verify Domain' }).should('be.visible');
        cy.findByRole('button', { name: 'Re-Verify Domain' }).click();
        cy.findByText('Successfully verified CNAME for track1.spappteam.com').should('be.visible');

        cy.findByRole('heading', { name: 'Tracking' }).should('be.visible');
        cy.findByRole('button', { name: 'Verify Domain' }).should('not.exist');
        cy.findByRole('heading', { name: 'Delete Domain' }).should('be.visible');
        cy.findByRole('button', { name: 'Delete Domain' }).click();

        cy.withinModal(() => {
          cy.findAllByText('Are you sure you want to delete this domain?').should('be.visible');

          cy.findAllByText(
            'Any templates or transmissions that use this tracking domain directly will fail.',
          ).should('be.visible');

          cy.findByRole('button', { name: 'Delete' }).should('be.visible');
          cy.findByRole('button', { name: 'Cancel' }).should('be.visible');
          cy.findByRole('button', { name: 'Delete' }).click();
          cy.wait('@deleteDomain');
        });

        cy.findAllByText(`Successfully deleted ${domainName}`);
        cy.findByRole('heading', { name: 'Domains' }).should('be.visible');
        cy.url().should('include', '/domains/list');
      });

      it('renders correct section for Tracking Domains Details Section', () => {
        cy.stubRequest({
          url: '/api/v1/tracking-domains',
          fixture: 'tracking-domains/200.get.domain-details.json',
          requestAlias: 'trackingDomainsList',
        });
        cy.visit(`${TRACKING_DETAILS_URL}/click3.spappteam.com`);
        cy.wait(['@trackingDomainsList', '@accountDomainsReq']);
        cy.findByRole('heading', { name: 'Domain Status' }).should('be.visible');
        cy.findByRole('heading', { name: 'Tracking' }).should('be.visible');
        cy.findByRole('heading', { name: 'Delete Domain' }).should('be.visible');
        cy.findByRole('heading', { name: 'Sending' }).should('not.exist');
        cy.findByRole('heading', { name: 'Bounce' }).should('not.exist');
        cy.findByRole('heading', { name: 'DNS Verification' }).should('not.exist');
        cy.findByRole('heading', { name: 'Email Verification' }).should('not.exist');
      });

      it('confirms removal of default domain tracking.', () => {
        cy.stubRequest({
          url: '/api/v1/tracking-domains',
          fixture: 'tracking-domains/200.get.json',
          requestAlias: 'trackingDomainsList',
        });

        cy.visit(`${TRACKING_DETAILS_URL}/verified-and-default.com`);
        cy.wait(['@trackingDomainsList', '@accountDomainsReq']);

        cy.findByRole('heading', { name: 'Domain Details' }).should('be.visible');

        cy.findAllByLabelText('Set as Default Tracking Domain').should('be.visible');

        cy.findAllByLabelText('Set as Default Tracking Domain').should('be.checked');

        cy.findAllByLabelText('Set as Default Tracking Domain').click({ force: true });

        cy.withinModal(() => {
          cy.server();

          cy.stubRequest({
            method: 'PUT',
            url: '/api/v1/tracking-domains/verified-and-default.com',
            fixture: 'tracking-domains/200.put.json',
            requestAlias: 'trackingDomainUpdate',
          });

          cy.route({
            method: 'GET',
            url: '/api/v1/tracking-domains',
            response: {
              results: trackingDomainsList.results.map(result => {
                if (result.domain === 'verified.com') {
                  result.default = true;
                } else if (result.domain === 'verified-and-default.com') {
                  result.default = false;
                }

                return result;
              }),
            },
          }).as('updatedTrackingDomainsList');

          cy.findAllByText('Remove default tracking domain (verified-and-default.com)').should(
            'be.visible',
          );
          cy.findAllByText(
            "Transmissions and templates that don't specify a tracking domain will no longer use verified-and-default.com. Instead, they will use the system default until another default is selected.",
          ).should('be.visible');
          cy.findByRole('button', { name: 'Remove Default' }).should('be.visible');
          cy.findByRole('button', { name: 'Cancel' }).should('be.visible');

          cy.findByRole('button', { name: 'Remove Default' }).click();
          cy.wait('@trackingDomainUpdate');
        });

        cy.findAllByLabelText('Set as Default Tracking Domain').should('be.visible');
        cy.findAllByLabelText('Set as Default Tracking Domain').should('not.be.checked');
      });

      it('confirms setting a default domain tracking.', () => {
        cy.stubRequest({
          url: '/api/v1/tracking-domains',
          fixture: 'tracking-domains/200.get.json',
          requestAlias: 'trackingDomainsList',
        });

        cy.visit(`${TRACKING_DETAILS_URL}/verified.com`);
        cy.wait(['@trackingDomainsList', '@accountDomainsReq']);

        cy.findByRole('heading', { name: 'Domain Details' }).should('be.visible');

        cy.findAllByLabelText('Set as Default Tracking Domain').should('be.visible');
        cy.findAllByLabelText('Set as Default Tracking Domain').should('not.be.checked');

        cy.findAllByLabelText('Set as Default Tracking Domain').click({ force: true });

        cy.withinModal(() => {
          cy.server();

          cy.stubRequest({
            method: 'PUT',
            url: '/api/v1/tracking-domains/verified.com',
            fixture: 'tracking-domains/200.put.json',
            requestAlias: 'trackingDomainUpdate',
          });

          cy.route({
            method: 'GET',
            url: '/api/v1/tracking-domains',
            response: {
              results: trackingDomainsList.results.map(result => {
                if (result.domain === 'verified.com') {
                  result.default = true;
                } else if (result.domain === 'verified-and-default.com') {
                  result.default = false;
                }

                return result;
              }),
            },
          }).as('updatedTrackingDomainsList');

          cy.findAllByText('Set default tracking domain (verified.com)').should('be.visible');
          cy.findAllByText(
            "Transmissions and templates that don't specify a tracking domain will now use verified.com.",
          ).should('be.visible');
          cy.findByRole('button', { name: 'Set as Default' }).should('be.visible');
          cy.findByRole('button', { name: 'Cancel' }).should('be.visible');

          cy.findByRole('button', { name: 'Set as Default' }).click();
        });

        cy.findAllByLabelText('Set as Default Tracking Domain').should('be.visible');
        cy.findAllByLabelText('Set as Default Tracking Domain').should('be.checked');
      });
    });

    describe('Domain Details Page for Sending/Bounce Domain', () => {
      it('renders correct section and banner for Blocked domains', () => {
        cy.stubRequest({
          url: '/api/v1/sending-domains/bounce.uat.sparkspam.com',
          fixture: 'sending-domains/200.get.blocked-domain.json',
          requestAlias: 'blockedSendingDomains',
        });
        cy.visit(`${SENDING_BOUNCE_DETAILS_URL}/bounce.uat.sparkspam.com`);
        cy.wait(['@accountDomainsReq', '@blockedSendingDomains']);

        cy.findByText('This domain has been blocked by SparkPost').should('be.visible');

        cy.findByRole('heading', { name: 'Domain Status' }).should('be.visible');
        cy.findByRole('heading', { name: 'Sending' }).should('not.exist');
        cy.findByRole('heading', { name: 'Bounce' }).should('not.exist');
        cy.findByRole('heading', { name: 'Sending and Bounce' }).should('not.exist');
        cy.findByRole('heading', { name: 'Link Tracking Domain' }).should('not.exist');
        cy.findByRole('heading', { name: 'Delete Domain' }).should('be.visible');
        cy.findAllByText('This domain has been blocked by SparkPost').should('be.visible');
      });

      it('renders correct sections and banner for unverified sending domains', () => {
        cy.stubRequest({
          url: '/api/v1/sending-domains/hello-world-there.com',
          fixture: 'sending-domains/200.get.unverified-dkim.json',
          requestAlias: 'unverifieddkimSendingDomains',
        });

        cy.visit(`${SENDING_BOUNCE_DETAILS_URL}/hello-world-there.com`);
        cy.wait(['@accountDomainsReq', '@unverifieddkimSendingDomains']);

        cy.findByText('Unverified domains will be removed two weeks after being added.').should(
          'be.visible',
        );
        cy.findByText('Domains Documentation')
          .closest('a')
          .should(
            'have.attr',
            'href',
            'https://www.sparkpost.com/docs/getting-started/getting-started-sparkpost/#sending-domain-step-2-verifying-domain-ownership',
          );
        cy.findByRole('heading', { name: 'Domain Status' }).should('be.visible');
        cy.findByRole('heading', { name: 'DNS Verification' }).should('be.visible');
        cy.findByRole('heading', { name: 'Email Verification' }).should('be.visible');
        cy.findByRole('heading', { name: 'Sending' }).should('not.exist');
        cy.findByRole('heading', { name: 'Bounce' }).should('be.visible');
        cy.findByRole('heading', { name: 'Sending and Bounce' }).should('not.exist');
        cy.findByRole('heading', { name: 'Link Tracking Domain' }).should('not.exist');
        cy.findByRole('heading', { name: 'Delete Domain' }).should('be.visible');
        cy.findByRole('button', { name: 'Verify Domain' }).should('be.visible');

        cy.get('p')
          .contains(
            'Add these TXT records, Hostnames, and Values for this domain in the settings section of your DNS provider.',
          )
          .should('be.visible');

        cy.findByRole('button', { name: 'Verify Domain' }).click();

        cy.findAllByText('Please confirm you have added the records to your DNS provider.').should(
          'be.visible',
        );

        cy.findAllByLabelText('The TXT record has been added to the DNS provider.').click({
          force: true,
        });

        cy.findAllByText('Please confirm you have added the records to your DNS provider.').should(
          'not.exist',
        );

        cy.get('p')
          .contains(
            'Add the CNAME record, Hostname, and Value for this domain in the settings section of your DNS provider.',
          )
          .should('be.visible');

        cy.findByRole('button', { name: 'Verify Bounce' }).click();

        cy.findAllByLabelText('The CNAME record has been added to the DNS provider.').click({
          force: true,
        });

        cy.findAllByText('Please confirm you have added the records to your DNS provider.').should(
          'not.exist',
        );
      });

      it('unverified domain renders success message on Verifying Dkim for domain', () => {
        cy.stubRequest({
          url: '/api/v1/sending-domains/hello-world-there.com',
          fixture: 'sending-domains/200.get.unverified-dkim.json',
          requestAlias: 'unverifieddkimSendingDomains',
        });
        cy.stubRequest({
          method: 'POST',
          url: '/api/v1/sending-domains/hello-world-there.com/verify',
          fixture: 'sending-domains/verify/200.post.json',
          requestAlias: 'verifyDomain',
        });

        cy.visit(`${SENDING_BOUNCE_DETAILS_URL}/hello-world-there.com`);
        cy.wait(['@accountDomainsReq', '@unverifieddkimSendingDomains']);

        cy.findByLabelText('The TXT record has been added to the DNS provider.').check({
          force: true,
        });
        cy.findByRole('button', { name: 'Verify Domain' }).click();
        cy.wait('@verifyDomain');
        cy.findAllByText(
          'You have successfully verified DKIM record of hello-world-there.com',
        ).should('be.visible');
      });

      it('renders correct sections for domains with unverified bounce and verified dkim', () => {
        cy.stubRequest({
          url: '/api/v1/sending-domains/prd2.splango.net',
          fixture: 'sending-domains/200.get.unverified-bounce.json',
          requestAlias: 'unverifiedBounceDomains',
        });
        cy.visit(`${SENDING_BOUNCE_DETAILS_URL}/prd2.splango.net`);
        cy.wait(['@unverifiedBounceDomains']);
        cy.wait('@accountDomainsReq');

        cy.findByRole('heading', { name: 'Domain Status' }).should('be.visible');
        cy.findByRole('heading', { name: 'Link Tracking Domain' }).should('be.visible');
        cy.findByRole('heading', { name: 'Delete Domain' }).should('be.visible');
        cy.findByRole('heading', { name: 'Sending' }).should('be.visible');
        cy.findByRole('heading', { name: 'Bounce' }).should('be.visible');
        cy.findByRole('button', { name: 'Verify Bounce' }).should('be.visible');
        cy.findByRole('heading', { name: 'DNS Verification' }).should('not.exist');
        cy.findByRole('heading', { name: 'Email Verification' }).should('not.exist');
        cy.findByRole('heading', { name: 'Sending and Bounce' }).should('not.exist');
      });

      it('unverified bounce domain renders success message on Verifying bounce domain', () => {
        cy.stubRequest({
          url: '/api/v1/sending-domains/prd2.splango.net',
          fixture: 'sending-domains/200.get.unverified-bounce.json',
          requestAlias: 'unverifiedBounceDomains',
        });
        cy.stubRequest({
          method: 'POST',
          url: '/api/v1/sending-domains/prd2.splango.net/verify',
          fixture: 'sending-domains/verify/200.post.json',
          requestAlias: 'verifyDomain',
        });
        cy.visit(`${SENDING_BOUNCE_DETAILS_URL}/prd2.splango.net`);
        cy.wait(['@unverifiedBounceDomains', '@accountDomainsReq']);
        cy.findAllByLabelText('The CNAME record has been added to the DNS provider.').click({
          force: true,
        });
        cy.findByRole('button', { name: 'Verify Bounce' }).click();
        cy.wait('@verifyDomain');
        cy.findAllByText('Successfully verified cname record of prd2.splango.net').should(
          'be.visible',
        );
      });

      it('renders correct sections for completely verified domains', () => {
        cy.stubRequest({
          url: '/api/v1/sending-domains/bounce2.spappteam.com',
          fixture: 'sending-domains/200.get.all-verified.json',
          requestAlias: 'verifiedDomains',
        });
        cy.stubRequest({
          method: 'POST',
          url: '/api/v1/sending-domains/bounce2.spappteam.com/verify',
          fixture: 'sending-domains/verify/200.post.json',
          requestAlias: 'verifyDomain',
        });
        cy.visit(`${SENDING_BOUNCE_DETAILS_URL}/bounce2.spappteam.com`);
        cy.wait(['@verifiedDomains']);
        cy.wait('@accountDomainsReq');

        cy.findByRole('heading', { name: 'Domain Status' }).should('be.visible');
        cy.findByRole('heading', { name: 'Sending and Bounce' }).should('be.visible');
        cy.findByRole('heading', { name: 'Link Tracking Domain' }).should('be.visible');
        cy.findByRole('heading', { name: 'Delete Domain' }).should('be.visible');
        cy.findByRole('heading', { name: 'Sending' }).should('not.exist');
        cy.findByRole('heading', { name: 'Bounce' }).should('not.exist');
        cy.findByRole('heading', { name: 'DNS Verification' }).should('not.exist');
        cy.findByRole('heading', { name: 'Email Verification' }).should('not.exist');

        cy.findByRole('button', { name: 'Re-Verify Domain' }).should('be.visible');
        cy.findByRole('button', { name: 'Re-Verify Domain' }).click();
        cy.findByText('You have successfully verified DKIM record of bounce2.spappteam.com').should(
          'be.visible',
        );
        cy.findByText(
          'You have successfully verified cname record of bounce2.spappteam.com',
        ).should('be.visible');
      });

      it('renders correct sections for verified bounce domain and unverified sending domain', () => {
        cy.stubRequest({
          url: '/api/v1/sending-domains/bounce2.spappteam.com',
          fixture: 'sending-domains/200.get.bounce-verified-sending-unverified.json',
          requestAlias: 'verifiedDomains',
        });
        cy.stubRequest({
          method: 'POST',
          url: '/api/v1/sending-domains/bounce2.spappteam.com/verify',
          fixture: 'sending-domains/verify/200.post.json',
          requestAlias: 'verifyDomain',
        });
        cy.visit(`${SENDING_BOUNCE_DETAILS_URL}/bounce2.spappteam.com`);
        cy.wait(['@verifiedDomains', '@accountDomainsReq']);
        cy.findByRole('heading', { name: 'Domain Status' }).should('be.visible');
        cy.findByRole('heading', { name: 'Sending and Bounce' }).should('not.exist');
        cy.findByRole('heading', { name: 'Link Tracking Domain' }).should('not.exist');
        cy.findByRole('heading', { name: 'Delete Domain' }).should('be.visible');
        cy.findByRole('heading', { name: 'Sending' }).should('not.exist');
        cy.findByRole('heading', { name: 'Bounce' }).should('be.visible');
        cy.findByRole('button', { name: 'Verify Domain' }).should('be.visible');
        cy.findByRole('heading', { name: 'DNS Verification' }).should('be.visible');
        cy.findByRole('heading', { name: 'Email Verification' }).should('be.visible');

        cy.findByRole('button', { name: 'Re-Verify Domain' }).should('be.visible');
        cy.findByRole('button', { name: 'Re-Verify Domain' }).click();
        cy.findByText('Successfully verified cname record of bounce2.spappteam.com').should(
          'be.visible',
        );
      });

      it('renders snackbar after sharing and un-sharing the domain.', () => {
        cy.stubRequest({
          url: '/api/v1/sending-domains/bounce2.spappteam.com',
          fixture: 'sending-domains/200.get.all-verified.json',
          requestAlias: 'verifiedDomains',
        });
        cy.stubRequest({
          method: 'PUT',
          url: '/api/v1/sending-domains/*',
          fixture: 'sending-domains/200.put.json',
          requestAlias: 'sendingDomainUpdate',
        });

        cy.visit(`${SENDING_BOUNCE_DETAILS_URL}/bounce2.spappteam.com`);

        cy.wait('@accountDomainsReq');
        cy.findAllByText('Share this domain with all subaccounts').should('be.visible');
        cy.findAllByLabelText('Share this domain with all subaccounts').click({ force: true });
        cy.wait('@sendingDomainUpdate');
        cy.withinSnackbar(() => {
          cy.findAllByText('Successfully shared this domain with all subaccounts.').should(
            'be.visible',
          );
        });
        cy.findAllByLabelText('Share this domain with all subaccounts').click({ force: true });
        cy.wait('@sendingDomainUpdate');
        cy.withinSnackbar(() => {
          cy.findAllByText('Successfully un-shared this domain with all subaccounts.').should(
            'be.visible',
          );
        });
      });

      it('delete domain prompts confirmation modal first', () => {
        cy.stubRequest({
          url: '/api/v1/sending-domains/bounce2.spappteam.com',
          fixture: 'sending-domains/200.get.bounce-verified-sending-unverified.json',
          requestAlias: 'verifiedDomains',
        });
        cy.visit(`${SENDING_BOUNCE_DETAILS_URL}/bounce2.spappteam.com`);
        cy.wait(['@verifiedDomains', '@accountDomainsReq']);

        cy.findByRole('button', { name: 'Delete Domain' }).click();

        cy.withinModal(() => {
          cy.findAllByText('Are you sure you want to delete this domain?').should('be.visible');

          cy.findAllByText(
            'Any future transmission that uses this domain will be rejected.',
          ).should('be.visible');

          cy.findByRole('button', { name: 'Delete' }).should('be.visible');
          cy.findByRole('button', { name: 'Cancel' }).should('be.visible');
        });
      });
    });
  });
});
