/**
 * The following tests have some funky behavior between each test. Since we do not clear the auth
 * cookies between tests, the logged in state is preserved after finishing the final test. In order to successfully
 * re-run the tests (typically while editing them), stopping the test runner and restarting will
 * help clear the application state. This preservation of state between tests is very helpful with other features,
 * and mainly painful on this one. A necessary tradeoff!
 */
import { IS_HIBANA_ENABLED, USERNAME } from 'cypress/constants';

describe('The log in page', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.visit('/auth');
  });

  it('renders a "Required" error message when no email address is entered', () => {
    cy.findByText('Required').should('not.exist');
    cy.get('[data-id="button-log-in"]').click();

    cy.findByText('Required').should('be.visible');
  });

  it('renders a "Keep me logged in" checkbox', () => {
    cy.findByLabelText('Keep me logged in').should('be.visible');
  });

  it('has a link to the forgot password flow', () => {
    cy.findByText('Forgot your password?').click();

    cy.title().should('include', 'Reset Password');
    cy.findByText('Reset Your Password').should('be.visible');
  });

  it('has a link to the forgot password, sign up, and single sign-on flows', () => {
    cy.verifyLink({
      content: 'Forgot your password?',
      href: '/forgot-password',
    });

    cy.verifyLink({
      content: 'Sign up',
      href: '/join',
    });

    cy.verifyLink({
      content: 'Single Sign-On',
      href: '/auth/sso',
    });
  });

  it('does not log in with an invalid username and password', () => {
    cy.server();
    cy.fixture('authenticate/400.post.json').as('authenticatePostInvalidCredentials');
    cy.route({
      method: 'POST',
      url: '/api/v1/authenticate',
      status: 400,
      response: '@authenticatePostInvalidCredentials',
    });
    cy.findByLabelText('Email or Username').type('baduser123');
    cy.findByLabelText('Password').type('badpassword123');
    cy.get('[data-id="button-log-in"]').click();
    cy.findByText('User credentials are invalid').should('be.visible');
  });

  it('logs in and redirects to the dashboard for admin users', () => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
    cy.title().should('include', 'Dashboard');
  });
  if (IS_HIBANA_ENABLED) {
    it('logs in and redirects to the dashboard page for reporting users', () => {
      cy.stubAuth();
      stubGrantsRequest({ role: 'reporting' });
      stubUsersRequest({ access_level: 'reporting' });

      cy.login({ isStubbed: true });
      cy.wait(['@getGrants', '@stubbedUsersRequest']);
      cy.title().should('include', 'Dashboard');
    });
  }
  if (!IS_HIBANA_ENABLED) {
    it('logs in and redirects to the summary report page for reporting users', () => {
      cy.stubAuth();
      stubGrantsRequest({ role: 'reporting' });
      stubUsersRequest({ access_level: 'reporting' });

      cy.login({ isStubbed: true });
      cy.wait(['@getGrants', '@stubbedUsersRequest']);
      cy.title().should('include', 'Summary Report');
    });
  }
});

function stubGrantsRequest({ role }) {
  cy.stubRequest({
    url: '/api/v1/authenticate/grants*',
    fixture: `authenticate/grants/200.get.${role}.json`,
    requestAlias: 'getGrants',
  });
}

// this is an override of the stub set by stubAuth
function stubUsersRequest({ access_level }) {
  cy.stubRequest({
    url: `/api/v1/users/${USERNAME}`,
    fixture: `users/200.get.${access_level}.json`,
    requestAlias: 'stubbedUsersRequest',
  });
}
