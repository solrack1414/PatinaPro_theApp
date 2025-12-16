// This file is required by karma.conf.js and loads recursively all the .spec and framework files
import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

TestBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Mock para localStorage
class MockLocalStorage {
  private store: { [key: string]: string } = {};
  
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  
  removeItem(key: string): void {
    delete this.store[key];
  }
  
  clear(): void {
    this.store = {};
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new MockLocalStorage()
});

// Mock para console.log para no ensuciar las pruebas
const originalConsoleLog = console.log;
console.log = (...args) => {
  // Solo muestra logs importantes durante pruebas
  if (args[0]?.includes('ERROR') || args[0]?.includes('WARN')) {
    originalConsoleLog.apply(console, args);
  }
};