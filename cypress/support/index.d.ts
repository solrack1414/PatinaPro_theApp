// cypress/support/index.d.ts
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Escribe en un input de Ionic
     * @example cy.fillIonicInput('ion-input[formControlName="usuario"]', 'testuser')
     */
    fillIonicInput(selector: string, text: string): Chainable<Element>
    
    /**
     * Limpia un input de Ionic
     */
    clearIonicInput(selector: string): Chainable<Element>
    
    /**
     * Hace clic en un elemento Ionic
     */
    clickIonic(selector: string): Chainable<Element>
  }
}