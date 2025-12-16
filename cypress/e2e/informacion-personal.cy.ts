describe('Información Personal', () => {
  beforeEach(() => {
    // Mock datos de usuario
    cy.intercept('GET', '**/usuarios/patinador_test', {
      statusCode: 200,
      body: {
        usuario: 'patinador_test',
        correo: 'patinador@email.com',
        nombre: 'Carlos',
        apellido: 'Skater',
        nivel_educacion: 'Intermedio',
        fecha_nacimiento: '1995-05-15'
      }
    });

    // Mock actualización
    cy.intercept('PUT', '**/usuarios/patinador_test', {
      statusCode: 200,
      body: { mensaje: 'Actualizado' }
    });

    // Set usuario en localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('usuarioActual', 'patinador_test');
    });

    cy.visit('/informacion-personal');
    cy.wait(1000);
  });

  it('debe cargar datos del usuario', () => {
    cy.get('[formControlName="usuario"]').should('have.value', 'patinador_test');
    cy.get('[formControlName="nombre"]').should('have.value', 'Carlos');
    cy.get('[formControlName="apellido"]').should('have.value', 'Skater');
  });

  it('debe permitir actualizar información personal', () => {
    // Modificar datos
    cy.get('[formControlName="nombre"]').clear().type('Luis');
    cy.get('[formControlName="correo"]').clear().type('luis@email.com');

    // Guardar
    cy.contains('Actualizar Información').click();

    // Verificar que se llamó al mock
    cy.wait('@PUT');
    cy.get('ion-alert').should('exist');
  });

  it('debe validar contraseñas', () => {
    // Llenar contraseñas diferentes
    cy.get('[formControlName="nuevaPassword"]').type('1234');
    cy.get('[formControlName="confirmarPassword"]').type('5678');
    cy.get('[formControlName="confirmarPassword"]').blur();

    // Debe mostrar error
    cy.contains('coincidir').should('be.visible');
    cy.contains('Cambiar Contraseña').should('be.disabled');
  });

  it('debe cambiar contraseña exitosamente', () => {
    // Llenar contraseñas iguales
    cy.get('[formControlName="nuevaPassword"]').type('9999');
    cy.get('[formControlName="confirmarPassword"]').type('9999');

    // Cambiar
    cy.contains('Cambiar Contraseña').click();
    
    cy.get('ion-alert').should('exist');
  });

  it('debe mostrar confirmación al cerrar sesión', () => {
    cy.contains('Cerrar Sesión').click();
    cy.get('ion-alert').should('be.visible');
    cy.contains('¿Estás seguro').should('be.visible');
  });
});