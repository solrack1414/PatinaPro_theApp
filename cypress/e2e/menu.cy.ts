describe('Menú Principal', () => {
  beforeEach(() => {
    cy.visit('/menu');
    cy.wait(500);
  });

  it('debe mostrar título principal', () => {
    cy.contains('Aprende a patinar con PatinaPRO').should('be.visible');
  });

  it('debe tener 6 opciones en el menú', () => {
    cy.get('ion-item').should('have.length', 6);
  });

  it('debe navegar a rutas programadas', () => {
    cy.contains('rutas programadas').click();
    cy.url().should('include', '/rutas-programadas');
  });

  it('debe navegar a información personal', () => {
    // Primero setear usuario
    cy.window().then((win) => {
      win.localStorage.setItem('usuarioActual', 'test');
    });
    
    cy.contains('Información Personal').click();
    cy.url().should('include', '/informacion-personal');
  });

  it('debe tener animación Lottie', () => {
    cy.get('lottie-player').should('exist');
  });
});