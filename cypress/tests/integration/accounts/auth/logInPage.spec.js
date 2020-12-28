/**
 * The following tests have some funky behavior between each test. Since we do not clear the auth
 * cookies between tests, the logged in state is preserved after finishing the final test. In order to successfully
 * re-run the tests (typically while editing them), stopping the test runner and restarting will
 * help clear the application state. This preservation of state between tests is very helpful with other features,
 * and mainly painful on this one. A necessary tradeoff!
 */

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

  it('logs in and redirects to the dashboard', () => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
    cy.title().should('include', 'Dashboard');
  });
});
