import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { IonicModule, AlertController, NavController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

import { RegistroPage } from './registro.page';
import { ApiService } from '../services/api.service';

describe('RegistroPage', () => {
  let component: RegistroPage;
  let fixture: ComponentFixture<RegistroPage>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAlertController: any;
  let mockNavController: any;

  beforeEach(async () => {
    // Crear mocks
    mockApiService = jasmine.createSpyObj('ApiService', ['crearUsuario']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    
    // Mock de AlertController
    mockAlertController = {
      create: jasmine.createSpy('create').and.returnValue(
        Promise.resolve({
          present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
        })
      )
    };

    // Mock de NavController
    mockNavController = {
      navigateRoot: jasmine.createSpy('navigateRoot'),
      navigateForward: jasmine.createSpy('navigateForward'),
      navigateBack: jasmine.createSpy('navigateBack'),
      back: jasmine.createSpy('back')
    };

    await TestBed.configureTestingModule({
      declarations: [RegistroPage],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule
      ],
      providers: [
        FormBuilder,
        { provide: ApiService, useValue: mockApiService },
        { provide: Router, useValue: mockRouter },
        { provide: AlertController, useValue: mockAlertController },
        { provide: NavController, useValue: mockNavController }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear la página de registro para nuevos patinadores', () => {
    expect(component).toBeTruthy();
  });

  describe('Validaciones de registro de patinador', () => {
    it('debería validar coincidencia de contraseñas para el patinador', () => {
      // Caso: contraseñas coinciden
      component.registroForm.setValue({
        usuario: 'nuevoPat', // 8 caracteres
        password: '1234',
        confirmPassword: '1234', // Coincide
        correo: 'patinador@email.com'
      });
      
      // Marcar como tocado para activar validaciones
      component.registroForm.markAllAsTouched();
      fixture.detectChanges();
      
      expect(component.registroForm.valid).toBeTrue();

      // Caso: contraseñas NO coinciden
      component.registroForm.setValue({
        usuario: 'nuevoPat', // 8 caracteres
        password: '1234',
        confirmPassword: '5678', // No coincide
        correo: 'patinador@email.com'
      });
      
      component.registroForm.markAllAsTouched();
      fixture.detectChanges();
      
      expect(component.registroForm.valid).toBeFalse();
      expect(component.registroForm.hasError('mismatch')).toBeTrue();
    });

    it('debería validar formato de email para contacto del patinador', () => {
      const correoControl = component.registroForm.get('correo');
      
      // Email inválido
      correoControl?.setValue('email-invalido');
      expect(correoControl?.valid).toBeFalse();
      
      // Email válido
      correoControl?.setValue('patinador@skate.com');
      expect(correoControl?.valid).toBeTrue();
    });
    
    it('debería validar que el usuario tenga entre 3 y 8 caracteres', () => {
      const usuarioControl = component.registroForm.get('usuario');
      
      // Inválido: muy corto
      usuarioControl?.setValue('ab');
      expect(usuarioControl?.valid).toBeFalse();
      
      // Válido
      usuarioControl?.setValue('patina'); // 6 caracteres
      expect(usuarioControl?.valid).toBeTrue();
      
      // Válido: exactamente 8 caracteres
      usuarioControl?.setValue('usuario8'); // 8 caracteres
      expect(usuarioControl?.valid).toBeTrue();
      
      // Inválido: muy largo (9 caracteres)
      usuarioControl?.setValue('usuariolo9'); // 9 caracteres
      expect(usuarioControl?.valid).toBeFalse();
    });
    
    it('debería validar que la contraseña tenga exactamente 4 dígitos', () => {
      const passwordControl = component.registroForm.get('password');
      
      // Inválido: no son 4 dígitos
      passwordControl?.setValue('123');
      expect(passwordControl?.valid).toBeFalse();
      
      // Válido
      passwordControl?.setValue('1234');
      expect(passwordControl?.valid).toBeTrue();
      
      // Inválido: más de 4 dígitos
      passwordControl?.setValue('12345');
      expect(passwordControl?.valid).toBeFalse();
    });
  });

  describe('validarRegistro()', () => {
    beforeEach(() => {
      // Configurar mock de alerta para cada prueba
      mockAlertController.create.calls.reset();
    });

    it('debería registrar exitosamente un nuevo patinador', fakeAsync(() => {
      mockApiService.crearUsuario.and.returnValue(
        of({ id: 1, usuario: 'skateLov', correo: 'skate@patina.com' })
      );

      component.registroForm.setValue({
        usuario: 'skateLov', // 8 caracteres
        password: '8888',
        confirmPassword: '8888',
        correo: 'skate@patina.com'
      });

      // Asegurar que el formulario es válido
      component.registroForm.markAllAsTouched();
      fixture.detectChanges();
      
      expect(component.registroForm.valid).toBeTrue();

      component.validarRegistro();
      tick();

      expect(mockApiService.crearUsuario).toHaveBeenCalledWith({
        usuario: 'skateLov',
        password: '8888',
        correo: 'skate@patina.com'
      });
      
      // Verificar que se creó una alerta de éxito
      expect(mockAlertController.create).toHaveBeenCalled();
      
      // Verificar navegación
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('debería manejar error si el patinador ya está registrado', fakeAsync(() => {
      mockApiService.crearUsuario.and.returnValue(
        throwError(() => ({ 
          error: { detail: 'PatinaPRO: Usuario ya existe' } 
        }))
      );

      // CORREGIDO: Usar usuario con 8 caracteres máximo
      component.registroForm.setValue({
        usuario: 'patExis8', // 8 caracteres (antes patExiste tenía 9)
        password: '1111',
        confirmPassword: '1111',
        correo: 'existente@patina.com'
      });

      // Asegurar que el formulario es válido
      component.registroForm.markAllAsTouched();
      fixture.detectChanges();
      
      // Depuración: mostrar estado del formulario
      console.log('=== DEBUG: Prueba de error ===');
      console.log('Formulario válido?', component.registroForm.valid);
      console.log('Usuario válido?', component.usuario.valid);
      console.log('Errores usuario:', component.usuario.errors);
      console.log('Password válido?', component.password.valid);
      console.log('ConfirmPassword válido?', component.confirmPassword.valid);
      console.log('Correo válido?', component.correo.valid);
      console.log('Errores formulario:', component.registroForm.errors);
      
      expect(component.registroForm.valid).toBeTrue();

      component.validarRegistro();
      tick();

      expect(mockApiService.crearUsuario).toHaveBeenCalled();
      expect(mockAlertController.create).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
    }));

    it('NO debería enviar formulario si es inválido', () => {
      // Configurar formulario inválido
      component.registroForm.setValue({
        usuario: 'ab', // Inválido: menos de 3 caracteres
        password: '123', // Inválido: menos de 4 dígitos
        confirmPassword: '456', // No coincide
        correo: 'email-invalido' // Inválido
      });

      component.registroForm.markAllAsTouched();
      fixture.detectChanges();
      expect(component.registroForm.valid).toBeFalse();

      component.validarRegistro();

      expect(mockApiService.crearUsuario).not.toHaveBeenCalled();
    });

    it('NO debería enviar formulario si isLoading es true', () => {
      component.isLoading = true;
      
      component.registroForm.setValue({
        usuario: 'valido',
        password: '1234',
        confirmPassword: '1234',
        correo: 'valido@email.com'
      });

      component.registroForm.markAllAsTouched();
      fixture.detectChanges();
      expect(component.registroForm.valid).toBeTrue();

      component.validarRegistro();

      expect(mockApiService.crearUsuario).not.toHaveBeenCalled();
    });
  });

  describe('Manejo de isLoading', () => {
    it('debería establecer isLoading en true durante registro', fakeAsync(() => {
      mockApiService.crearUsuario.and.returnValue(
        of({ id: 1, usuario: 'test', correo: 'test@email.com' })
      );

      component.registroForm.setValue({
        usuario: 'testuser', // 8 caracteres
        password: '1234',
        confirmPassword: '1234',
        correo: 'test@email.com'
      });

      expect(component.isLoading).toBeFalse();
      
      component.validarRegistro();
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
      component.registroForm.setValue({
        usuario: 'ab',
        password: '123',
        confirmPassword: '456',
        correo: 'invalido'
      });
      component.registroForm.markAllAsTouched();
      fixture.detectChanges();
      
      const button = fixture.debugElement.query(By.css('ion-button[color="success"]'));
      expect(button.nativeElement.disabled).toBeTruthy();
    });

    it('debería habilitar botón cuando formulario es válido', () => {
      component.registroForm.setValue({
        usuario: 'patina', // 6 caracteres
        password: '1234',
        confirmPassword: '1234',
        correo: 'patina@email.com'
      });
      component.registroForm.markAllAsTouched();
      fixture.detectChanges();
      
      const button = fixture.debugElement.query(By.css('ion-button[color="success"]'));
      expect(button.nativeElement.disabled).toBeFalsy();
    });
  });
});