import { PAGE_URL, STABLE_UNIX_DATE } from './constants';
import { commonBeforeSteps } from './helpers';

function verifyRow({ rowIndex, firstCell, secondCell, thirdCell, fourthCell, fifthCell }) {
  cy.get('tbody tr')
    .eq(rowIndex)
    .within(() => {
      cy.get('td')
        .eq(0)
        .should('contain', firstCell);

      cy.get('td')
        .eq(1)
        .should('contain', secondCell);

      cy.get('td')
        .eq(2)
        .should('contain', thirdCell);

      cy.get('td')
        .eq(3)
        .should('contain', fourthCell);

      cy.get('td')
        .eq(4)
        .should('contain', fifthCell);
    });
}

describe('Analytics Report breakdown table', () => {
  beforeEach(() => {
    cy.stubAuth();
    commonBeforeSteps();

    cy.stubRequest({
      url: '/api/v1/subaccounts',
      fixture: 'subaccounts/200.get.json',
      requestAlias: 'getSubaccountList',
    });
  });

  it('renders data broken down by "Recipient Domain"', () => {
    cy.clock(STABLE_UNIX_DATE);
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/watched-domain**/*',
      fixture: 'metrics/deliverability/watched-domain/200.get.json',
      requestAlias: 'getWatchedDomains',
    });
    cy.visit(PAGE_URL);

    cy.findByLabelText('Break Down By')
      .scrollIntoView()
      .select('Recipient Domain', { force: true });

    cy.wait('@getWatchedDomains');

    cy.findByLabelText('Top Domains Only')
      .should('be.visible')
      .should('be.checked');

    cy.get('table').within(() => {
      cy.findByText('Recipient Domain').should('be.visible');
    });

    verifyRow({
      rowIndex: 0,
      firstCell: 'hotmail.com',
      secondCell: '9K',
      thirdCell: '10K',
      fourthCell: '11K',
      fifthCell: '12K',
    });

    verifyRow({
      rowIndex: 1,
      firstCell: 'yahoo.com',
      secondCell: '5',
      thirdCell: '6',
      fourthCell: '7',
      fifthCell: '8',
    });

    verifyRow({
      rowIndex: 2,
      firstCell: 'gmail.com',
      secondCell: '1',
      thirdCell: '2',
      fourthCell: '3',
      fifthCell: '4',
    });

    // Verifying that the "Top Domains Only" checkbox re-requests domains
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/domain**/*',
      fixture: 'metrics/deliverability/domain/200.get.json',
      requestAlias: 'getDomain',
    });

    cy.findByLabelText('Top Domains Only').uncheck({ force: true });

    cy.wait('@getDomain');

    cy.findByText('top-domains-only.com')
      .scrollIntoView()
      .should('be.visible');
  });

  it('renders data broken down by "Sending Domain"', () => {
    cy.clock(STABLE_UNIX_DATE);
    cy.visit(PAGE_URL);

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/sending-domain**/*',
      fixture: 'metrics/deliverability/sending-domain/200.get.json',
      requestAlias: 'getSendingDomain',
    });
    cy.visit(PAGE_URL);

    cy.findByLabelText('Break Down By')
      .scrollIntoView()
      .select('Sending Domain', { force: true });

    cy.wait('@getSendingDomain');

    cy.get('table').within(() => {
      cy.findByText('Sending Domain').should('be.visible');
    });

    verifyRow({
      rowIndex: 0,
      firstCell: 'sparkpostbox.com',
      secondCell: '5.5K',
      thirdCell: '6.5K',
      fourthCell: '7.5K',
      fifthCell: '8.5K',
    });

    verifyRow({
      rowIndex: 1,
      firstCell: 'ymail.com',
      secondCell: '1',
      thirdCell: '2',
      fourthCell: '3',
      fifthCell: '4',
    });
  });

  it('renders data broken down by "Campaign"', () => {
    cy.clock(STABLE_UNIX_DATE);
    cy.visit(PAGE_URL);

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/campaign**/*',
      fixture: 'metrics/deliverability/campaign/200.get.json',
      requestAlias: 'getCampaign',
    });
    cy.visit(PAGE_URL);

    cy.findByLabelText('Break Down By')
      .scrollIntoView()
      .select('Campaign', { force: true });

    cy.wait('@getCampaign');

    cy.get('table').within(() => {
      cy.findByText('Campaign').should('be.visible');
    });

    verifyRow({
      rowIndex: 0,
      firstCell: 'Free Beer',
      secondCell: '8',
      thirdCell: '0',
      fourthCell: '8',
      fifthCell: '0',
    });
  });

  it('renders data broken down by "Template"', () => {
    cy.clock(STABLE_UNIX_DATE);
    cy.visit(PAGE_URL);

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/template**/*',
      fixture: 'metrics/deliverability/template/200.get.json',
      requestAlias: 'getTemplate',
    });
    cy.visit(PAGE_URL);

    cy.findByLabelText('Break Down By')
      .scrollIntoView()
      .select('Template', { force: true });

    cy.wait('@getTemplate');

    cy.get('table').within(() => {
      cy.findByText('Template').should('be.visible');
    });

    verifyRow({
      rowIndex: 0,
      firstCell: 'my-template-1',
      secondCell: '1',
      thirdCell: '2',
      fourthCell: '3',
      fifthCell: '4',
    });

    verifyRow({
      rowIndex: 1,
      firstCell: 'my-template-2',
      secondCell: '1',
      thirdCell: '2',
      fourthCell: '3',
      fifthCell: '4',
    });
  });

  it('renders data broken down by "Subaccount"', () => {
    cy.clock(STABLE_UNIX_DATE);
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/subaccount**/*',
      fixture: 'metrics/deliverability/subaccount/200.get.json',
      requestAlias: 'getSubaccount',
    });
    cy.visit(PAGE_URL);
    cy.wait('@getSubaccountList');
    cy.findByLabelText('Break Down By')
      .scrollIntoView()
      .select('Subaccount', { force: true });

    cy.wait('@getSubaccount');

    cy.get('table').within(() => {
      cy.findByText('Subaccount').should('be.visible');
    });

    verifyRow({
      rowIndex: 0,
      firstCell: 'Primary Account (ID 0)',
      secondCell: '1.3K',
      thirdCell: '1.4K',
      fourthCell: '1.5K',
      fifthCell: '1.6K',
    });

    verifyRow({
      rowIndex: 1,
      firstCell: 'Subaccount 3',
      secondCell: '900',
      thirdCell: '1K',
      fourthCell: '1.1K',
      fifthCell: '1.2K',
    });

    verifyRow({
      rowIndex: 2,
      firstCell: 'Fake Subaccount 2 (ID 102)',
      secondCell: '500',
      thirdCell: '600',
      fourthCell: '700',
      fifthCell: '800',
    });

    verifyRow({
      rowIndex: 3,
      firstCell: 'Fake Subaccount 1 (ID 101)',
      secondCell: '100',
      thirdCell: '200',
      fourthCell: '300',
      fifthCell: '400',
    });
  });

  it('renders data broken down by "Sending IP"', () => {
    cy.clock(STABLE_UNIX_DATE);
    cy.visit(PAGE_URL);

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/sending-ip**/*',
      fixture: 'metrics/deliverability/sending-ip/200.get.json',
      requestAlias: 'getSendingIP',
    });
    cy.visit(PAGE_URL);

    cy.findByLabelText('Break Down By')
      .scrollIntoView()
      .select('Sending IP', { force: true });

    cy.wait('@getSendingIP');

    cy.get('table').within(() => {
      cy.findByText('Sending IP').should('be.visible');
    });

    verifyRow({
      rowIndex: 0,
      firstCell: 'This is a real sending IP, alright.',
      secondCell: '9K',
      thirdCell: '10K',
      fourthCell: '11K',
      fifthCell: '12K',
    });

    verifyRow({
      rowIndex: 1,
      firstCell: 'Confirmation',
      secondCell: '5K',
      thirdCell: '6K',
      fourthCell: '7K',
      fifthCell: '8K',
    });

    verifyRow({
      rowIndex: 2,
      firstCell: 'Password Reset',
      secondCell: '1K',
      thirdCell: '2K',
      fourthCell: '3K',
      fifthCell: '4K',
    });
  });

  it('renders data broken down by "IP Pool"', () => {
    cy.clock(STABLE_UNIX_DATE);
    cy.visit(PAGE_URL);

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/ip-pool**/*',
      fixture: 'metrics/deliverability/ip-pool/200.get.json',
      requestAlias: 'getIPPool',
    });
    cy.visit(PAGE_URL);

    cy.findByLabelText('Break Down By')
      .scrollIntoView()
      .select('IP Pool', { force: true });

    cy.wait('@getIPPool');

    cy.get('table').within(() => {
      cy.findByText('IP Pool').should('be.visible');
    });

    verifyRow({
      rowIndex: 0,
      firstCell: 'highway',
      secondCell: '5K',
      thirdCell: '6K',
      fourthCell: '7K',
      fifthCell: '8K',
    });

    verifyRow({
      rowIndex: 1,
      firstCell: 'to',
      secondCell: '500',
      thirdCell: '600',
      fourthCell: '700',
      fifthCell: '800',
    });

    verifyRow({
      rowIndex: 2,
      firstCell: 'thedangerzone',
      secondCell: '50',
      thirdCell: '60',
      fourthCell: '70',
      fifthCell: '80',
    });
  });

  it('renders an empty state when no results are returned', () => {
    cy.clock(STABLE_UNIX_DATE);
    cy.visit(PAGE_URL);
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/ip-pool**/*',
      fixture: '200.get.no-results.json',
      requestAlias: 'getIPPool',
    });
    cy.visit(PAGE_URL);

    cy.findByLabelText('Break Down By')
      .scrollIntoView()
      .select('IP Pool', { force: true });

    cy.wait('@getIPPool');

    cy.findByText('There is no data to display').should('be.visible');
  });

  it('clicking on a resource adds it as a filter"', () => {
    cy.clock(STABLE_UNIX_DATE);
    cy.visit(PAGE_URL);
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/template**/*',
      fixture: 'metrics/deliverability/template/200.get.json',
      requestAlias: 'getTemplate',
    });
    cy.visit(PAGE_URL);

    cy.findByLabelText('Break Down By')
      .scrollIntoView()
      .select('Template', { force: true });

    cy.wait('@getTemplate');

    cy.get('table').within(() => {
      cy.findByRole('button', { name: 'my-template-1 (Applies a filter to the report)' }).click({
        force: true,
      });
    });

    cy.findByDataId('report-options').within(() => {
      cy.findByText('Filters').should('be.visible');
      cy.findByText('Template').should('be.visible');
      cy.findByText('is equal to').should('be.visible');
      cy.findByText('my-template-1').should('be.visible');
    });
  });

  it('filters with new comparators when clicking on a resource', () => {
    cy.visit(PAGE_URL);

    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/template**/*',
      fixture: 'metrics/deliverability/template/200.get.json',
      requestAlias: 'getTemplate',
    });
    cy.visit(PAGE_URL);
    cy.wait('@getSubaccountList');

    cy.findByLabelText('Break Down By')
      .scrollIntoView()
      .select('Template', { force: true });

    cy.wait('@getTemplate');

    cy.get('table').within(() => {
      cy.findByRole('button', { name: 'my-template-1 (Applies a filter to the report)' }).click({
        force: true,
      });
    });

    cy.findByDataId('report-options').within(() => {
      cy.findByText('Filters').should('be.visible');
      cy.findByText('Template').should('be.visible');
      cy.findByText('is equal to').should('be.visible');
      cy.findByText('my-template-1').should('be.visible');
    });
  });

  it('filters with new comparators when selecting on a group by option', () => {
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/template**/*',
      fixture: 'metrics/deliverability/template/200.get.json',
      requestAlias: 'getTemplate',
    });
    cy.visit(
      '/signals/analytics?query_filters=%255B%257B%2522AND%2522%3A%257B%2522subaccounts%2522%3A%257B%2522eq%2522%3A%255B101%2C102%255D%257D%257D%257D%2C%257B%2522AND%2522%3A%257B%2522domains%2522%3A%257B%2522like%2522%3A%255B%2522hello%2522%2C%2522there%2522%2C%2522friend%2522%2C%2522these%2522%2C%2522are%2522%2C%2522some%2522%2C%2522tags%2522%255D%257D%257D%257D%255D',
    );
    cy.wait('@getSubaccountList');

    cy.findByLabelText('Break Down By')
      .scrollIntoView()
      .select('Template', { force: true });

    cy.wait('@getTemplate').then(xhr => {
      cy.wrap(xhr.url).should(
        'include',
        'query_filters={"groupings":[{"AND":{"subaccounts":{"eq":["101","102"]}}},{"AND":{"domains":{"like":["hello","there","friend","these","are","some","tags"]}}}]}',
      );
    });
  });

  describe('Compare By - Group By Table', () => {
    it('will show a breakdown including comparisons without the current active comparison type as a "Breakdown By" option', () => {
      cy.stubRequest({
        url: '/api/v1/metrics/deliverability/watched-domain**/*',
        fixture: 'metrics/deliverability/watched-domain/200.get.json',
        requestAlias: 'getWatchedDomains',
      });
      cy.visit(
        '/signals/analytics?comparisons%5B0%5D%5Btype%5D=Subaccount&comparisons%5B0%5D%5Bvalue%5D=Fake%20Subaccount%201%20%28ID%20101%29&comparisons%5B0%5D%5Bid%5D=101&comparisons%5B1%5D%5Btype%5D=Subaccount&comparisons%5B1%5D%5Bvalue%5D=Fake%20Subaccount%203%20%28ID%20103%29&comparisons%5B1%5D%5Bid%5D=103',
      );
      cy.wait('@getSubaccountList');

      cy.findByLabelText('Break Down By')
        .scrollIntoView()
        .within(() => {
          cy.findByRole('option', { name: 'Subaccount' }).should('not.exist');
        })
        .select('Recipient Domain', { force: true });

      cy.wait('@getWatchedDomains');
      cy.wait('@getWatchedDomains');

      cy.get('table').within(() => {
        cy.findAllByText('Fake Subaccount 1 (ID 101)').should('have.length', 3);
        cy.findAllByText('Fake Subaccount 3 (ID 103)').should('have.length', 3);
      });
    });

    it('will render an empty state if no data is available', () => {
      cy.stubRequest({
        url: '/api/v1/metrics/deliverability/watched-domain**/*',
        fixture: 'metrics/deliverability/watched-domain/200.get.no-results.json',
        requestAlias: 'getWatchedDomains',
      });
      cy.visit(
        '/signals/analytics?comparisons%5B0%5D%5Btype%5D=Subaccount&comparisons%5B0%5D%5Bvalue%5D=Fake%20Subaccount%201%20%28ID%20101%29&comparisons%5B0%5D%5Bid%5D=101&comparisons%5B1%5D%5Btype%5D=Subaccount&comparisons%5B1%5D%5Bvalue%5D=Fake%20Subaccount%203%20%28ID%20103%29&comparisons%5B1%5D%5Bid%5D=103',
      );
      cy.wait('@getSubaccountList');

      cy.findByLabelText('Break Down By')
        .scrollIntoView()
        .select('Recipient Domain', { force: true });

      cy.wait('@getWatchedDomains');
      cy.wait('@getWatchedDomains');
      cy.findAllByText('There is no data to display').should('be.visible');
    });

    it('will render an error state the requests fail', () => {
      cy.stubRequest({
        url: '/api/v1/metrics/deliverability/watched-domain**/*',
        fixture: 'metrics/deliverability/watched-domain/400.get.json',
        statusCode: 400,
        requestAlias: 'getWatchedDomains',
      });
      cy.visit(
        '/signals/analytics?comparisons%5B0%5D%5Btype%5D=Subaccount&comparisons%5B0%5D%5Bvalue%5D=Fake%20Subaccount%201%20%28ID%20101%29&comparisons%5B0%5D%5Bid%5D=101&comparisons%5B1%5D%5Btype%5D=Subaccount&comparisons%5B1%5D%5Bvalue%5D=Fake%20Subaccount%203%20%28ID%20103%29&comparisons%5B1%5D%5Bid%5D=103',
      );
      cy.wait('@getSubaccountList');

      cy.findByLabelText('Break Down By')
        .scrollIntoView()
        .select('Recipient Domain', { force: true });

      // Hmmmmmm
      cy.wait(['@getWatchedDomains', '@getWatchedDomains']);
      cy.wait(['@getWatchedDomains', '@getWatchedDomains']);
      cy.wait(['@getWatchedDomains', '@getWatchedDomains']);
      cy.wait(['@getWatchedDomains', '@getWatchedDomains']);

      cy.findAllByText('Unable to load report');
      cy.findAllByText('Please try again');

      cy.stubRequest({
        url: '/api/v1/metrics/deliverability/watched-domain**/*',
        fixture: 'metrics/deliverability/watched-domain/200.get.json',
        requestAlias: 'getWatchedDomains',
      });

      cy.findByRole('button', { name: 'Try Again' }).click();
      cy.wait('@getWatchedDomains');
      cy.wait('@getWatchedDomains');

      cy.get('table').within(() => {
        cy.findAllByText('Fake Subaccount 1 (ID 101)').should('have.length', 3);
        cy.findAllByText('Fake Subaccount 3 (ID 103)').should('have.length', 3);
      });
    });
  });
});
