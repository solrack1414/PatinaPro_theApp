// cypress/support/commands.ts
// Importa los tipos si es necesario
/// <reference types="cypress" />
/// <reference types="./index.d.ts" />

// Comando 1: Escribir en input de Ionic
Cypress.Commands.add('fillIonicInput', (selector: string, text: string) => {
  cy.get(selector).then(($el) => {
    const el = $el[0];
    
    // Método directo que funciona con Ionic
    if (el) {
      // Usar el setter de value si existe
      if ('value' in el) {
        (el as any).value = text;
      }
      
      // Establecer atributos
      el.setAttribute('value', text);
      el.setAttribute('ng-reflect-value', text);
      
      // Disparar eventos
      const events = ['input', 'change', 'ionChange', 'ionInput', 'focus', 'blur'];
      events.forEach(eventType => {
        el.dispatchEvent(new Event(eventType, { bubbles: true }));
      });
    }
  });
  
  // Esperar un momento para que Angular procese
  cy.wait(300);
});

// Comando 2: Limpiar input de Ionic
Cypress.Commands.add('clearIonicInput', (selector: string) => {
  cy.get(selector).then(($el) => {
    const el = $el[0];
    
    if (el) {
      // Limpiar valores
      if ('value' in el) {
        (el as any).value = '';
      }
      
      el.setAttribute('value', '');
      el.setAttribute('ng-reflect-value', '');
      
      // Disparar eventos
      const events = ['input', 'change', 'ionChange', 'ionInput', 'blur'];
      events.forEach(eventType => {
        el.dispatchEvent(new Event(eventType, { bubbles: true }));
      });
    }
  });
  
  cy.wait(300);
});

// Comando 3: Hacer clic en elemento Ionic
Cypress.Commands.add('clickIonic', (selector: string) => {
  cy.get(selector).click({ force: true });
});

// Exportar vacío para evitar errores de módulo
export {};