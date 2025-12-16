describe('Home Page', () => {
  beforeEach(() => {
    // ✅ MOCK para obtener usuario
    cy.intercept('GET', '**/usuarios/testuser*', {
      statusCode: 404, // Simula usuario nuevo
      body: { detail: 'Usuario no encontrado' }
    }).as('mockGetUsuario');

    // ✅ MOCK para actualizar usuario
    cy.intercept('PUT', '**/usuarios/testuser', {
      statusCode: 200,
      body: { mensaje: 'Datos actualizados' }
    }).as('mockUpdateUsuario');

    // Ir directamente a home con usuario
    cy.visit('/home?usuario=testuser');
    cy.wait(2000);
  });

  it('1. Muestra bienvenida', () => {
    cy.contains('Bienvenido, testuser').should('be.visible');
  });

  it('2. Puede llenar formulario', () => {
    cy.get('ion-input[formControlName="nombre"] input').type('Juan', { force: true });
    cy.get('ion-input[formControlName="apellido"] input').type('Pérez', { force: true });
    
    // Seleccionar nivel
    cy.get('ion-select[formControlName="nivelEducacion"]').click();
    cy.get('ion-select-option[value="Principiante"]').click();
    
    // Botón guardar debe estar habilitado
    cy.get('ion-button[type="submit"]').should('not.have.attr', 'disabled');
  });

  it('3. Guarda datos', () => {
    // Llenar formulario
    cy.get('ion-input[formControlName="nombre"] input').type('Juan', { force: true });
    cy.get('ion-input[formControlName="apellido"] input').type('Pérez', { force: true });
    cy.get('ion-select[formControlName="nivelEducacion"]').click();
    cy.get('ion-select-option[value="Principiante"]').click();
    
    // Guardar
    cy.get('ion-button[type="submit"]').click({ force: true });
    
    // ✅ Verificar que se llamó al mock de actualización
    cy.wait('@mockUpdateUsuario').then((interception) => {
      expect(interception.request.body.nombre).to.equal('Juan');
      expect(interception.request.body.apellido).to.equal('Pérez');
    });
    
    // Verificar alerta
    cy.get('ion-alert').should('be.visible');
  });
});