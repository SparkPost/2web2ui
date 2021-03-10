import { commonBeforeSteps } from './helpers';

const BASE_URL = '/signals/analytics';

describe('Analytics Report URL redirects from old Signals Analytics features', () => {
  it('Allow UTC+0 timezones', () => {
    //regression test
    commonBeforeSteps();
    cy.visit(`${BASE_URL}?timezone=Europe/London`);
    cy.findByText('Invalid Timezone').should('not.exist');
    cy.findByLabelText('Time Zone').should('have.value', '(UTC) Europe/London');
  });
  it('renders an alert for invalid metric', () => {
    commonBeforeSteps();
    cy.visit(`${BASE_URL}?metrics%5B0%5D=count_sent&metrics%5B1%5D=not_a_real_metric`);
    cy.findByText('Invalid Metric').should('be.visible');
  });
  it('renders an alert for invalid date', () => {
    commonBeforeSteps();
    cy.visit(`${BASE_URL}?from=2021-02-02T00%3A00%3A00Z&to=2021-01-09T00%3A41%3A57Z&range=custom`);
    //to is before from in ^
    cy.findByText('Invalid Date').should('be.visible');
  });
  it('renders an alert for invalid filter', () => {
    commonBeforeSteps();
    cy.visit(
      `${BASE_URL}?&query_filters=%5B%7B"XOR"%3A%7B"UserID"%3A%7B"foo"%3A%5B"Christmas%20Sale"%5D%7D%7D%7D%5D`,
    );
    cy.findByText('Invalid Filter').should('be.visible');
  });
  it('renders an alert for invalid comparison with an invalid type', () => {
    commonBeforeSteps();
    cy.visit(
      `${BASE_URL}?&&comparisons%5B0%5D%5Btype%5D=campaigns&comparisons%5B0%5D%5Bvalue%5D=Black%20Friday&comparisons%5B1%5D%5Btype%5D=foo&comparisons%5B1%5D%5Bvalue%5D=Christmas`,
    );
    cy.findByText('Invalid Comparison').should('be.visible');
  });
  it('renders an alert for invalid comparison with only 1 comparison', () => {
    commonBeforeSteps();
    cy.visit(
      `${BASE_URL}?&&comparisons%5B0%5D%5Btype%5D=campaigns&comparisons%5B0%5D%5Bvalue%5D=Black%20Friday`,
    );
    cy.findByText('Invalid Comparison').should('be.visible');
  });
});
