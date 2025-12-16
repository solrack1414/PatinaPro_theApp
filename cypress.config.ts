import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    viewportWidth: 390,
    viewportHeight: 844,
    defaultCommandTimeout: 15000, // Aumentar timeout
    requestTimeout: 15000,
    responseTimeout: 15000,
    video: false,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false, // IMPORTANTE para Ionic
    experimentalModifyObstructiveThirdPartyCode: true, // Para Ionic
    retries: {
      runMode: 1,
      openMode: 0
    },
    
    setupNodeEvents(on, config) {
      return config;
    },
  },
});