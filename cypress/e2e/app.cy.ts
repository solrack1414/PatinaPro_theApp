describe('App PatinaPRO', () => {
  it('debería cargar la página principal', () => {
    cy.visit('/');
    cy.url().should('include', 'localhost:4200');
  });
});

