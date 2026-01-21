describe('Auth guard', () => {
  it('redirects to login when no token is present', () => {
    cy.visit('/gallery');
    cy.location('pathname').should('eq', '/login');
  });
});
