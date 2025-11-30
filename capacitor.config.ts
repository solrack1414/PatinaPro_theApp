import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.patinapro',
  appName: 'PatinaPRO',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    cleartext: true
  },
  android: {
    allowMixedContent: true  // ✅ Permitir contenido mixto
  },
  plugins: {
    Camera: {
      enable: true
    },
    Geolocation: {
      enableHighAccuracy: true
    }
  }
};

export default config;