/// <reference types="cypress" />

// Solución específica para Ionic 7
Cypress.Commands.add('ionicType', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>, text: string) => {
  // Estrategia para Ionic: usar el evento nativo del elemento
  const el = subject[0];
  
  // 1. Primero intentar establecer el valor directamente
  (el as any).value = text;
  
  // 2. Disparar eventos para que Angular detecte los cambios
  el.dispatchEvent(new Event('ionChange', { bubbles: true }));
  el.dispatchEvent(new Event('ionInput', { bubbles: true }));
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  
  // 3. También disparar eventos de foco/blur para validaciones
  el.dispatchEvent(new Event('focus', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));
  
  return cy.wrap(subject);
});

Cypress.Commands.add('ionicClear', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>) => {
  const el = subject[0];
  (el as any).value = '';
  
  el.dispatchEvent(new Event('ionChange', { bubbles: true }));
  el.dispatchEvent(new Event('ionInput', { bubbles: true }));
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  
  return cy.wrap(subject);
});

// Comando para hacer clic en elementos Ionic
Cypress.Commands.add('ionicClick', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>) => {
  const el = subject[0];
  el.click();
  return cy.wrap(subject);
});

declare global {
  namespace Cypress {
    interface Chainable {
      ionicType(text: string): Chainable<JQuery<HTMLElement>>;
      ionicClear(): Chainable<JQuery<HTMLElement>>;
      ionicClick(): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};