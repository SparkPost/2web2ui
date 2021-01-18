describe('Seedlist Page', () => {
  beforeEach(() => {
    cy.stubAuth();
    cy.login({ isStubbed: true });

    cy.stubRequest({
      url: '/api/v1/inbox-placement/seeds',
      fixture: 'inbox-placement/200.get.seeds.json',
      requestAlias: 'getInboxPlacementSeeds',
    });

    cy.visit('inbox-placement/seedlist');
    cy.wait('@getInboxPlacementSeeds');
  });

  it('renders seedlist', () => {
    cy.findByText('test1@reference-seed.sparkpost.com test2@gmail.com').should('be.visible');
    cy.findByText('Download CSV').should('be.visible');
  });

  it.skip('has link to documentation website', () => {
    // Skip for now because documentation does not exist yet
    cy.verifyLink({
      content: 'Learn more about Automatic Seeding',
      href: 'https://www.sparkpost.com/docs/getting-started/getting-started-sparkpost',
    });
  });
});
