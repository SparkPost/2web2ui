describe('The log in page', () => {
  beforeEach(() => {
    cy.clearCookies(); // Clear auth-related cookies for this particular test
    cy.visit('/auth');
  });

  it('renders a "Required" error message when no email address is entered', () => {
    cy.findByText('Required').should('not.exist');
    cy.findByRole('button', { name: 'Log In' })
      .should('be.visible')
      .click();

    cy.findByText('Required').should('be.visible');
  });

  it('renders a "Keep me logged in" checkbox and has a link to the forgot password flow', () => {
    cy.findByLabelText('Keep me logged in').should('be.visible');
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
    cy.stubRequest({
      url: '/api/v1/authenticate',
      method: 'POST',
      statusCode: 400,
      fixture: 'authenticate/400.post.json',
      requestAlias: 'authenticatePostInvalidCredentials',
    });
    cy.findByLabelText('Email or Username').type('baduser123');
    cy.findByLabelText('Password').type('badpassword123');
    cy.findByRole('button', { name: 'Log In' }).click();
    cy.findByText('User credentials are invalid').should('be.visible');
  });

  it('logs in and redirects to the dashboard', () => {
    cy.stubAuth();
    cy.login({ isStubbed: true });
    cy.title().should('include', 'Dashboard');
  });
});
