import { commonBeforeSteps } from './helpers';

const PAGE_URL = '/signals/analytics';

describe('Date Time Section on Summary Report & Report Builder', () => {
  const timestamp = 1580392800000; //01/30/2020 @ 2:00pm (UTC)
  let getDatePickerText;

  beforeEach(() => {
    commonBeforeSteps();

    cy.stubRequest({
      url: '/api/v1/reports',
      fixture: '200.get.no-results',
    });

    cy.clock(timestamp);
    const now = Cypress.moment(timestamp)
      .local()
      .format('MMM Do YYYY h:mma');
    getDatePickerText = startDateTime => `${startDateTime} – ${now}`; // Correctly uses the en dash rather than the em dash - https://www.thepunctuationguide.com/en-dash.html
  });

  it('default date and precision is applied correctly', () => {
    cy.visit(PAGE_URL);

    const weekAgo = Cypress.moment(timestamp).subtract(7, 'day');
    cy.findByDataId('report-options').within(() => {
      cy.findByLabelText('Date Range').should(
        'have.value',
        getDatePickerText(weekAgo.local().format('MMM Do YYYY h:mma')),
      );
    });
    cy.wait('@getTimeSeries').should(xhr => {
      expect(xhr.url).to.contain('precision=hour');
      expect(xhr.url).to.contain(`from=${weekAgo.local().format('YYYY-MM-DDTHH:mm')}`);
    });
    cy.findByLabelText('Precision').should('have.value', 'hour');
  });

  it('changing date picker values changes the precision correctly', () => {
    cy.visit(PAGE_URL);
    cy.findByLabelText('Precision').should('have.value', 'hour');
    cy.findByLabelText('Date Range').click();

    //Check mouseover
    cy.get('[aria-label="Wed Jan 29 2020"]').click({ force: true });
    cy.get('[aria-label="Tue Dec 03 2019"]').trigger('mouseover', { force: true });
    cy.findByLabelText('Precision').should('have.value', 'day');

    //Check clicking picks current precision if available
    cy.get('[aria-label="Thu Jan 16 2020"]').click({ force: true });
    cy.findByLabelText('Precision').should('have.value', 'hour');
    cy.findByText('Cancel').click({ force: true });

    //Check date-range; picks recommended precision if current precision in unavailable
    cy.findByLabelText('Precision').select('week', { force: true }); //Change precision so that it's no longer an option for "last 24 hours"
    cy.findByLabelText('Date Range').click();
    cy.findByText('Last 24 Hours').click({ force: true });
    cy.findByLabelText('Precision').should('have.value', 'hour');

    cy.findByLabelText('From Date').should('have.value', '2020-01-29');
    cy.findByLabelText('From Time').should('have.value', '2:00pm');
    //Re-stub so I can get the url params from the second call
    cy.stubRequest({
      url: '/api/v1/metrics/deliverability/time-series**',
      fixture: 'metrics/deliverability/time-series/200.get.json',
      requestAlias: 'getTimeSeries2',
    });
    cy.findByText('Apply').click({ force: true });
    cy.wait('@getTimeSeries2').should(xhr => {
      expect(xhr.url).to.contain('precision=hour');
      expect(xhr.url).to.contain(`from=2020-01-29T14:00`);
    });
  });

  it('should show appropriate date ranges based on timezone (and not local timezone)', () => {
    cy.visit(
      `/signals/analytics?from=2021-01-13T23%3A00%3A00-06%3A00&to=2021-01-29T22%3A59%3A59-06%3A00&range=custom`,
    );
    cy.wait('@getSubaccounts');
    cy.findByDataId('aggregate-metrics-date-range').within(() => {
      cy.findByText('Jan 14th - Jan 29th, 2021').should('be.visible');
    });
    cy.findByLabelText('Time Zone')
      .focus()
      .clear()
      .type('Belize');
    cy.tick(300);
    cy.findByRole('option', { name: '(UTC-06:00) America/Belize' }).click({ force: true });
    cy.findByDataId('aggregate-metrics-date-range').within(() => {
      cy.findByText('Jan 13th - Jan 29th, 2021').should('be.visible');
    });
  });
});
