/// <reference types="cypress" />

describe('Login Page - Pruebas Reales CORREGIDAS', () => {
  beforeEach(() => {
    // Mockear API de login
    cy.intercept('POST', '**/login/', {
      statusCode: 200,
      body: { mensaje: 'Login exitoso', usuario: 'testuser' }
    }).as('mockLogin');
    
    // Mockear API de usuario
    cy.intercept('GET', '**/usuarios/testuser', {
      statusCode: 200,
      body: {
        usuario: 'testuser',
        nombre: 'Test',
        apellido: 'User',
        nivel_educacion: 'Principiante',
        fecha_nacimiento: '1990-01-01'
      }
    }).as('mockUserData');
    
    cy.visit('/login');
    cy.wait(2000); // Más tiempo para Ionic
  });

  it('1. Debería cargar la página de login correctamente', () => {
    // Verificar elementos
    cy.get('ion-title').should('contain.text', 'PatinaPRO');
    cy.contains('¡Bienvenido a PatinaPRO!').should('exist');
    
    // Verificar campos - usar selectores específicos para Ionic
    cy.get('ion-input[formControlName="usuario"]').should('exist');
    cy.get('ion-input[formControlName="password"]').should('exist');
    
    // Verificar botón - Ionic buttons tienen clase 'button-disabled'
    cy.get('ion-button[type="submit"]')
      .invoke('attr', 'class')
      .should('contain', 'button-disabled');
    
    // Verificar enlace a registro
    cy.contains('¿No tienes una cuenta?').should('exist');
    cy.contains('¡Créala ahora gratis!').should('exist');
    
    cy.screenshot('login-page-loaded');
  });

  it('2. Login exitoso con credenciales válidas', () => {
    // Llenar formulario - usar force:true para Ionic inputs
    cy.get('ion-input[formControlName="usuario"]')
      .find('input')
      .type('testuser', { force: true });
    
    cy.get('ion-input[formControlName="password"]')
      .find('input')
      .type('1234', { force: true });
    
    // Verificar que el botón NO tiene clase 'button-disabled'
    cy.get('ion-button[type="submit"]')
      .invoke('attr', 'class')
      .should('not.contain', 'button-disabled');
    
    // Hacer clic con force:true (Ionic a veces tiene overlays)
    cy.get('ion-button[type="submit"]').click({ force: true });
    
    // Verificar llamadas API
    cy.wait('@mockLogin');
    cy.wait('@mockUserData');
    
    // Verificar redirección
    cy.url().should('include', '/home');
    cy.url().should('include', 'usuario=testuser');
    
    // Verificar localStorage
    cy.window().then(win => {
      expect(win.localStorage.getItem('usuarioActual')).to.equal('testuser');
    });
    
    // Verificar que estamos en home
    cy.wait(3000); // Tiempo para renderizar home
    cy.get('h2').should('contain.text', 'Bienvenido, testuser');
    
    cy.screenshot('login-exitoso');
  });

  it('3. Login fallido con credenciales inválidas - VERSIÓN FINAL', () => {
    // 1. Mockear respuesta de error
    cy.intercept('POST', '**/login/', {
        statusCode: 401,
        body: { detail: 'Credenciales incorrectas' }
    }).as('mockLoginError');

    // 2. Visitar página (sobreescribe el beforeEach)
    cy.visit('/login');
    cy.wait(2000);

    // 3. Usar credenciales que SÍ sean válidas para el formulario
    // Pero que fallarán en el servidor (mockeado)
    cy.get('ion-input[formControlName="usuario"]')
        .find('input')
        .type('test456', { force: true });  // 7 caracteres ✓ cumple regex 3-8
    
    cy.get('ion-input[formControlName="password"]')
        .find('input')
        .type('8888', { force: true });     // 4 dígitos ✓ cumple regex
    
    cy.wait(1000); // Esperar validación

    // 4. Verificar que el botón está habilitado
    cy.get('ion-button[type="submit"]')
        .should('not.have.attr', 'aria-disabled', 'true')
        .and('not.have.class', 'button-disabled');

    // 5. Hacer clic
    cy.get('ion-button[type="submit"]').click();

    // 6. Esperar la respuesta mockeada de error
    cy.wait('@mockLoginError');

    // 7. Verificar que seguimos en login
    cy.url().should('include', '/login');
    cy.url().should('not.include', '/home');
    
    cy.screenshot('login-fallido-version-final');
});

  it('4. Validaciones de formulario - CORREGIDO', () => {
    // 1. Formulario vacío - botón deshabilitado
    cy.get('ion-button[type="submit"]')
        .should('have.attr', 'aria-disabled', 'true')
        .and('have.class', 'button-disabled');

    // 2. Solo usuario válido (3-8 caracteres alfanuméricos)
    cy.get('ion-input[formControlName="usuario"]')
        .find('input')
        .type('abc', { force: true });
    cy.wait(500); // Esperar actualización
    cy.get('ion-button[type="submit"]')
        .should('have.attr', 'aria-disabled', 'true'); // Falta password

    // 3. Solo password válido (4 dígitos)
    cy.get('ion-input[formControlName="usuario"]')
        .find('input')
        .clear({ force: true });
    cy.get('ion-input[formControlName="password"]')
        .find('input')
        .type('1234', { force: true });
    cy.wait(500);
    cy.get('ion-button[type="submit"]')
        .should('have.attr', 'aria-disabled', 'true'); // Falta usuario

    // 4. Usuario inválido (menos de 3 caracteres)
    cy.get('ion-input[formControlName="usuario"]')
        .find('input')
        .type('ab', { force: true }); // 2 caracteres - inválido
    cy.wait(500);
    cy.get('ion-button[type="submit"]')
        .should('have.attr', 'aria-disabled', 'true'); // Usuario inválido

    // 5. Password inválido (no 4 dígitos)
    cy.get('ion-input[formControlName="usuario"]')
        .find('input')
        .clear({ force: true })
        .type('testuser', { force: true }); // válido
    cy.get('ion-input[formControlName="password"]')
        .find('input')
        .clear({ force: true })
        .type('123', { force: true }); // 3 dígitos - inválido
    cy.wait(500);
    cy.get('ion-button[type="submit"]')
        .should('have.attr', 'aria-disabled', 'true'); // Password inválido

    // 6. Ambos válidos - botón habilitado
    cy.get('ion-input[formControlName="password"]')
        .find('input')
        .clear({ force: true })
        .type('1234', { force: true });
    cy.wait(500);
    cy.get('ion-button[type="submit"]')
        .should('not.have.attr', 'aria-disabled', 'true')
        .and('not.have.class', 'button-disabled');

    cy.screenshot('validaciones-corregidas');
  });

  it('5. Navegación a página de registro - CORREGIDO CON SELECTORES EXACTOS', () => {
    // 1. Hacer clic en el botón de registro desde login
    // El botón en login tiene: fill="clear", color="light"
    cy.get('ion-button[fill="clear"][color="light"]')
        .contains('¡Créala ahora gratis!')
        .click({ force: true });
    
    // Esperar navegación a registro
    cy.url().should('include', '/registro');
    cy.wait(2000);
    
    // 2. Verificar que estamos en registro
    cy.contains('Crear Cuenta').should('exist');
    cy.get('ion-input[formControlName="usuario"]').should('exist');
    
    // 3. Hacer clic en "Volver al Login" desde registro
    // El botón en registro tiene: fill="outline", color="medium"
    cy.get('ion-button[fill="outline"][color="medium"]')
        .contains('Volver al Login')
        .click({ force: true });
    
    // Esperar regreso a login
    cy.wait(2000);
    cy.url().should('include', '/login');
    
    cy.screenshot('navegacion-corregida-exacta');
  });

  it('6. Prueba de edge cases - LÓGICA CORREGIDA', () => {
    const testCases = [
        { user: 'abc', pass: '1234', shouldBeEnabled: true },
        { user: 'abcdefgh', pass: '0000', shouldBeEnabled: true },
        { user: 'user123', pass: '9876', shouldBeEnabled: true },
        { user: 'ab', pass: '1234', shouldBeEnabled: false },
        { user: 'testuser', pass: '123', shouldBeEnabled: false },
    ];
    
    testCases.forEach((testCase, index) => {
        cy.log(`Test ${index + 1}: usuario="${testCase.user}", password="${testCase.pass}"`);
        
        // Limpiar
        cy.get('ion-input[formControlName="usuario"]')
            .find('input')
            .clear({ force: true });
        
        cy.get('ion-input[formControlName="password"]')
            .find('input')
            .clear({ force: true });
        
        cy.wait(300); // Pequeña pausa
        
        // Llenar
        cy.get('ion-input[formControlName="usuario"]')
            .find('input')
            .type(testCase.user, { force: true });
        
        cy.get('ion-input[formControlName="password"]')
            .find('input')
            .type(testCase.pass, { force: true });
        
        cy.wait(500); // Esperar validación
        
        // LÓGICA CORREGIDA:
        if (testCase.shouldBeEnabled) {
            // Cuando DEBE estar habilitado:
            // - NO debe tener aria-disabled="true"
            // - NO debe tener clase button-disabled
            cy.get('ion-button[type="submit"]')
                .should('not.have.attr', 'aria-disabled', 'true')
                .and('not.have.class', 'button-disabled');
        } else {
            // Cuando DEBE estar deshabilitado:
            // - DEBE tener aria-disabled="true" O clase button-disabled
            cy.get('ion-button[type="submit"]').then(($btn) => {
                const isDisabled = 
                    $btn.attr('aria-disabled') === 'true' || 
                    $btn.hasClass('button-disabled');
                
                expect(isDisabled, `El botón debería estar deshabilitado para ${testCase.user}/${testCase.pass}`).to.be.true;
            });
        }
        
        cy.wait(300); // Pausa entre tests
    });
    
    cy.screenshot('edge-cases-logica-corregida');
  });

  it('7. DEBUG: Ver estructura real de la página', () => {
    // Imprimir info para debug
    cy.get('body').then($body => {
      console.log('=== DEBUG LOGIN PAGE ===');
      
      // Botones
      const buttons = $body.find('ion-button, button');
      console.log('Total botones:', buttons.length);
      
      buttons.each((index, btn) => {
        console.log(`Botón ${index}:`, {
          text: btn.textContent?.trim(),
          type: btn.getAttribute('type'),
          disabled: btn.getAttribute('aria-disabled'),
          classes: btn.className
        });
      });
      
      // Inputs
      const inputs = $body.find('ion-input');
      console.log('Total ion-input:', inputs.length);
      
      inputs.each((index, input) => {
        console.log(`Input ${index}:`, {
          formControlName: input.getAttribute('formControlName'),
          type: input.getAttribute('type')
        });
      });
    });
    
    cy.screenshot('debug-structure');
  });
});