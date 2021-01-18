import { commonBeforeSteps } from './helpers';

const oldBouncePage = '/reports/bounce';
const oldSummaryPage = '/reports/summary';
const oldRejectionsPage = '/reports/rejections';
const oldAcceptedPage = '/reports/accepted';
const oldDelayedPage = '/reports/delayed';
const oldEngagementPage = '/reports/engagement';
const signalsAnalyticsPage = '/signals/analytics';

describe('Analytics Report Redirects', () => {
  beforeEach(() => {
    commonBeforeSteps();
  });

  it('should redirect from old summary to signals analytics', () => {
    cy.visit(oldSummaryPage);
    cy.url().should('include', signalsAnalyticsPage);
  });

  it('should redirect from old bounce to signals analytics', () => {
    cy.visit(oldBouncePage);
    cy.url().should('include', signalsAnalyticsPage);
    cy.findByText('Bounce Report');
  });

  it('should redirect from old rejected to signals analytics', () => {
    cy.visit(oldRejectionsPage);
    cy.url().should('include', signalsAnalyticsPage);
    cy.findByText('Rejections Report');
  });

  it('should redirect from old accepted to signals analytics', () => {
    cy.visit(oldAcceptedPage);
    cy.url().should('include', signalsAnalyticsPage);
    cy.findByText('Accepted Report');
  });

  it('should redirect from old delayed to signals analytics', () => {
    cy.visit(oldDelayedPage);
    cy.url().should('include', signalsAnalyticsPage);
    cy.findByText('Delayed Report');
  });

  it('should redirect from old engagement to signals analytics', () => {
    cy.visit(oldEngagementPage);
    cy.url().should('include', signalsAnalyticsPage);
    cy.findByText('Engagement Report');
  });
});
