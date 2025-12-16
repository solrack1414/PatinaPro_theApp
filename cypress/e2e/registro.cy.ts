describe('Registro Page', () => {
  beforeEach(() => {
    // ✅ MOCK DEL REGISTRO
    cy.intercept('POST', '**/usuarios/', {
      statusCode: 201,
      body: { 
        mensaje: 'Usuario creado exitosamente',
        usuario: 'nuevoUsuario'
      }
    }).as('mockRegistro');

    cy.visit('/registro');
    cy.wait(2000);
  });

  it('1. Carga de página', () => {
    cy.contains('Crear Cuenta').should('be.visible');
    cy.get('ion-button[color="success"]').should('have.attr', 'disabled');
  });

  it('2. Registro exitoso', () => {
    // Escribir en campos
    cy.get('ion-input[formControlName="usuario"] input').type('nuevoUsuario', { force: true });
    cy.get('ion-input[formControlName="password"] input').type('1234', { force: true });
    cy.get('ion-input[formControlName="confirmPassword"] input').type('1234', { force: true });
    cy.get('ion-input[formControlName="correo"] input').type('nuevo@test.com', { force: true });
    
    // Verificar que botón está habilitado
    cy.get('ion-button[color="success"]').should('not.have.attr', 'disabled');
    
    // Click en validar
    cy.get('ion-button[color="success"]').click({ force: true });
    
    // ✅ Verificar mock
    cy.wait('@mockRegistro').then((interception) => {
      expect(interception.request.body).to.deep.equal({
        usuario: 'nuevoUsuario',
        password: '1234',
        correo: 'nuevo@test.com'
      });
    });
    
    // Verificar alerta de éxito
    cy.get('ion-alert').should('be.visible');
    cy.get('ion-alert .alert-message').should('contain.text', 'Cuenta creada');
  });

  it('3. Validaciones de formulario', () => {
    // Contraseñas no coinciden
    cy.get('ion-input[formControlName="usuario"] input').type('test', { force: true });
    cy.get('ion-input[formControlName="password"] input').type('1234', { force: true });
    cy.get('ion-input[formControlName="confirmPassword"] input').type('5678', { force: true });
    cy.get('ion-input[formControlName="correo"] input').type('test@test.com', { force: true });
    
    // Botón debe estar deshabilitado
    cy.get('ion-button[color="success"]').should('have.attr', 'disabled');
  });
});