describe('Alerts Page - Edit', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });

    cy.stubRequest({
      url: '/api/v1/sending-domains',
      fixture: 'sending-domains/200.get.json',
    });
    cy.stubRequest({
      url: '/api/v1/ip-pools',
      fixture: 'ip-pools/200.get.json',
    });
    cy.stubRequest({
      url: '/api/v1/sending-ips',
      fixture: 'sending-ips/200.get.json',
    });
    cy.stubRequest({
      url: '/api/v1/subaccounts',
      fixture: 'subaccounts/200.get.json',
    });

    cy.stubRequest({
      url: '/api/v1/alerts/101',
      fixture: 'alerts/single/200.get.json',
      requestAlias: 'getAlert',
    });

    cy.visit('/alerts/edit/101');
  });

  it('Existing alert populates field with correct initial values', () => {
    cy.get('[name="metric"]').should('have.attr', 'disabled');
    cy.findByLabelText('Evaluated').should('have.attr', 'disabled');
    cy.get('[data-id="alert-filters"]').within(() => {
      cy.findByText('Primary and all subaccounts').should('be.visible');
      cy.findByLabelText('Facet').should('have.value', 'mailbox_provider');
      cy.findByText('Gmail').should('be.visible');
      cy.findByText('Apple').should('be.visible');
    });
    cy.get('[name="slack"]').should('have.value', 'my slack');
  });

  it('On health score metric, changing filter facet resets the filter values', () => {
    cy.get('[data-id="alert-filters"]').within(() => {
      cy.findByLabelText('Facet').should('have.value', 'mailbox_provider');
      cy.findByText('Gmail').should('be.visible');
      cy.findByText('Apple').should('be.visible');
      cy.findByLabelText('Facet').select('ip_pool');
      cy.findByText('Gmail').should('not.exist');
      cy.findByText('Apple').should('not.exist');
    });
  });

  it('handles alert update successfully and redirect to details afterwards', () => {
    cy.stubRequest({
      method: 'PUT',
      url: '/api/v1/alerts/**',
      fixture: 'alerts/single/200.get.json',
      requestAlias: 'postNewAlert',
    });
    cy.stubRequest({
      url: '/api/v1/alerts/**/incidents',
      fixture: 'alerts/incidents/200.get.empty.json',
      requestAlias: 'getAlertIncidents',
    });

    cy.wait('@getAlert');
    cy.findByRole('button', { name: 'Update Alert' }).should('have.attr', 'disabled');
    cy.get('[name="emails"]').type('sparkky@sparkpost.io', { force: true });
    cy.findByRole('button', { name: 'Update Alert' }).click();

    cy.wait(['@postNewAlert', '@getAlert', '@getAlertIncidents']).then(xhrs => {
      const [postRequest, alert] = xhrs;
      const { requestBody } = postRequest;
      const {
        responseBody: { results: originalAlertObj },
      } = alert;
      //Update the original alert object with the new notification channel and remove unneeded fields
      const { last_triggered, any_subaccount, ...expectedRequestBody } = {
        ...originalAlertObj,
        channels: {
          emails: ['sparkky@sparkpost.io'],
          slack: {
            target: 'my slack',
          },
        },
      };
      expect(requestBody).to.deep.equal(expectedRequestBody);
    });

    cy.url().should('include', '/alerts/details/101');
    cy.findByText('Alert updated').should('be.visible');
  });
});
