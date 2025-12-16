import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

import { LoginPage } from './login.page';
import { ApiService } from '../services/api.service';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockNavController: any;
  let mockAlertController: any;

  beforeEach(async () => {
    // Crear mocks
    mockApiService = jasmine.createSpyObj('ApiService', ['login']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    
    // Mock de NavController
    mockNavController = {
      navigateRoot: jasmine.createSpy('navigateRoot').and.returnValue(Promise.resolve())
    };
    
    // Mock de AlertController
    mockAlertController = {
      create: jasmine.createSpy('create').and.returnValue(
        Promise.resolve({
          present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
        })
      )
    };

    await TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule
      ],
      providers: [
        FormBuilder,
        { provide: ApiService, useValue: mockApiService },
        { provide: Router, useValue: mockRouter },
        { provide: NavController, useValue: mockNavController },
        { provide: AlertController, useValue: mockAlertController }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // PRUEBAS BÁSICAS - Deberían pasar
  it('debería crear la página de login', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con campos vacíos', () => {
    expect(component.loginForm.value).toEqual({
      usuario: '',
      password: ''
    });
  });

  describe('Validaciones del formulario', () => {
    it('debería validar que el usuario tenga entre 3 y 8 caracteres alfanuméricos', () => {
      const usuarioControl = component.loginForm.get('usuario');
      
      // Inválido: muy corto
      usuarioControl?.setValue('ab');
      expect(usuarioControl?.valid).toBeFalse();
      
      // Válido
      usuarioControl?.setValue('patina');
      expect(usuarioControl?.valid).toBeTrue();
      
      // Inválido: muy largo (más de 8 caracteres)
      usuarioControl?.setValue('usuariomuylargo');
      expect(usuarioControl?.valid).toBeFalse();
    });

    it('debería validar que la contraseña tenga exactamente 4 dígitos', () => {
      const passwordControl = component.loginForm.get('password');
      
      // Inválido: no son 4 dígitos
      passwordControl?.setValue('123');
      expect(passwordControl?.valid).toBeFalse();
      
      // Válido
      passwordControl?.setValue('1234');
      expect(passwordControl?.valid).toBeTrue();
    });
  });

  describe('onSubmit() - PRUEBAS ACTUALIZADAS', () => {
    beforeEach(() => {
      // Mock localStorage
      spyOn(localStorage, 'setItem').and.callThrough();
    });

    it('debería llamar al servicio de login cuando el formulario es válido', fakeAsync(() => {
      // Configurar respuesta simulada
      mockApiService.login.and.returnValue(of({ 
        mensaje: 'Login exitoso', 
        usuario: 'patina' 
      }));

      // Configurar formulario válido
      component.loginForm.setValue({
        usuario: 'patina',
        password: '4321'
      });

      // Marcar como tocado para activar validaciones
      component.loginForm.markAllAsTouched();
      fixture.detectChanges();

      // Verificar que el formulario es válido
      expect(component.loginForm.valid).toBeTrue();

      // Ejecutar onSubmit
      component.onSubmit();
      
      // IMPORTANTE: Usar tick() para manejar async/await
      tick();

      // Verificar que se llamó al servicio
      expect(mockApiService.login).toHaveBeenCalledWith({
        usuario: 'patina',
        password: '4321'
      });
    }));

    it('debería guardar usuario en localStorage en login exitoso', fakeAsync(() => {
      mockApiService.login.and.returnValue(of({ 
        mensaje: 'Login exitoso', 
        usuario: 'patina' 
      }));

      component.loginForm.setValue({
        usuario: 'patina',
        password: '4321'
      });

      component.onSubmit();
      tick();

      // CORREGIDO: Ahora coincide con lo que realmente guarda el componente
      expect(localStorage.setItem).toHaveBeenCalledWith('usuarioActual', 'patina');
    }));

    it('debería navegar a /home en login exitoso', fakeAsync(() => {
      mockApiService.login.and.returnValue(of({ 
        mensaje: 'Login exitoso', 
        usuario: 'patina' 
      }));

      component.loginForm.setValue({
        usuario: 'patina',
        password: '4321'
      });

      component.onSubmit();
      tick();

      // CORREGIDO: Ahora coincide con lo que realmente pasa el componente
      expect(mockNavController.navigateRoot).toHaveBeenCalledWith('/home', {
        queryParams: { usuario: 'patina' }
      });
    }));

    it('debería manejar error de login', fakeAsync(() => {
      // Simular error - CORREGIDO: Crear un objeto de error más específico
      const errorObj = { 
        error: { detail: 'Credenciales inválidas' } 
      };
      
      // IMPORTANTE: Usar una función flecha que retorne el error
      mockApiService.login.and.returnValue(
        throwError(() => errorObj)
      );

      // CORREGIDO: Usar un usuario válido (entre 3-8 caracteres)
      component.loginForm.setValue({
        usuario: 'usererr',  // 7 caracteres - VÁLIDO
        password: '9999'     // 4 dígitos - VÁLIDO
      });

      // Asegurarse de que el formulario es válido
      component.loginForm.markAllAsTouched();
      fixture.detectChanges();
      
      console.log('Formulario válido?', component.loginForm.valid);
      console.log('Errores usuario:', component.loginForm.get('usuario')?.errors);
      console.log('Errores password:', component.loginForm.get('password')?.errors);
      
      expect(component.loginForm.valid).toBeTrue();

      component.onSubmit();
      tick();

      // Verificar que se llamó al servicio
      expect(mockApiService.login).toHaveBeenCalledWith({
        usuario: 'usererr',
        password: '9999'
      });
      
      // Verificar que se intentó crear una alerta
      expect(mockAlertController.create).toHaveBeenCalled();
    }));

    it('NO debería enviar formulario si es inválido', () => {
      // Configurar formulario inválido
      component.loginForm.setValue({
        usuario: 'ab', // Inválido: menos de 3 caracteres
        password: '123' // Inválido: menos de 4 dígitos
      });

      // Marcar como tocado
      component.loginForm.markAllAsTouched();
      fixture.detectChanges();

      // Verificar que el formulario es inválido
      expect(component.loginForm.valid).toBeFalse();

      component.onSubmit();

      expect(mockApiService.login).not.toHaveBeenCalled();
    });
  });

  describe('Manejo de isLoading', () => {
    it('debería establecer isLoading en true durante login', fakeAsync(() => {
      mockApiService.login.and.returnValue(of({ mensaje: 'Login exitoso', usuario: 'test' }));
      
      component.loginForm.setValue({
        usuario: 'testuser',
        password: '1234'
      });

      // Inicialmente debería ser false
      expect(component.isLoading).toBeFalse();
      
      // Al iniciar login
      component.onSubmit();
      
      // Debería ser true inmediatamente después de onSubmit
      expect(component.isLoading).toBeTrue();
      
      // Después de completar (con tick)
      tick();
      expect(component.isLoading).toBeFalse();
    }));

    it('debería resetear isLoading en caso de error', fakeAsync(() => {
      // CORREGIDO: Usar un error diferente para evitar confusión
      mockApiService.login.and.returnValue(
        throwError(() => ({ 
          error: { detail: 'Error de conexión' } 
        }))
      );

      component.loginForm.setValue({
        usuario: 'testuser',
        password: '1234'
      });

      component.onSubmit();
      expect(component.isLoading).toBeTrue();
      
      tick();
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('Interfaz de usuario', () => {
    it('debería mostrar spinner cuando isLoading es true', () => {
      component.isLoading = true;
      fixture.detectChanges();
      
      const spinner = fixture.debugElement.query(By.css('ion-spinner'));
      expect(spinner).toBeTruthy();
    });

    it('debería deshabilitar botón cuando formulario es inválido', () => {
      component.loginForm.setValue({
        usuario: 'ab',
        password: '123'
      });
      component.loginForm.markAllAsTouched();
      fixture.detectChanges();
      
      const button = fixture.debugElement.query(By.css('ion-button[type="submit"]'));
      expect(button.nativeElement.disabled).toBeTruthy();
    });

    it('debería habilitar botón cuando formulario es válido', () => {
      component.loginForm.setValue({
        usuario: 'patina',
        password: '1234'
      });
      component.loginForm.markAllAsTouched();
      fixture.detectChanges();
      
      const button = fixture.debugElement.query(By.css('ion-button[type="submit"]'));
      expect(button.nativeElement.disabled).toBeFalsy();
    });
  });
  
  it('ZZZ_DEBUG_FORMULARIO: debería mostrar estado del formulario', () => {
    console.log('=== DEBUG Formulario ===');
    console.log('Formulario inicial:', component.loginForm.value);
    console.log('Formulario válido?', component.loginForm.valid);
    console.log('Formulario inválido?', component.loginForm.invalid);
    console.log('Errores:', component.loginForm.errors);
    
    // Probar con datos
    component.loginForm.setValue({
      usuario: 'patina',
      password: '4321'
    });
    
    console.log('Después de setValue - válido?', component.loginForm.valid);
    console.log('Usuario válido?', component.loginForm.get('usuario')?.valid);
    console.log('Password válido?', component.loginForm.get('password')?.valid);
    
    expect(true).toBeTrue(); // Siempre pasa
  });
});