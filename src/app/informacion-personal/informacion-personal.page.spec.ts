
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormControl, AbstractControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { IonicModule, NavController, AlertController } from '@ionic/angular';

import { InformacionPersonalPage } from './informacion-personal.page';
import { ApiService } from '../services/api.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('InformacionPersonalPage', () => {
  let component: InformacionPersonalPage;
  let fixture: ComponentFixture<InformacionPersonalPage>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockNavController: jasmine.SpyObj<NavController>;
  let mockAlertController: jasmine.SpyObj<AlertController>;

  // Variables para spies que se reutilizan
  let localStorageRemoveItemSpy: jasmine.Spy;
  let sessionStorageClearSpy: jasmine.Spy;

  beforeEach(async () => {
    // Crear mocks con métodos que devuelvan observables
    mockApiService = jasmine.createSpyObj('ApiService', [
      'obtenerUsuario', 
      'actualizarUsuario', 
      'eliminarUsuario'
    ]);
    
    // Configurar mocks para devolver observables por defecto
    mockApiService.obtenerUsuario.and.returnValue(of({}));
    mockApiService.actualizarUsuario.and.returnValue(of({}));
    mockApiService.eliminarUsuario.and.returnValue(of({}));
    
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockNavController = jasmine.createSpyObj('NavController', ['navigateRoot']);
    mockAlertController = jasmine.createSpyObj('AlertController', ['create']);

    // Configurar mock de alerta
    const mockAlert = {
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
    } as any;
    mockAlertController.create.and.returnValue(Promise.resolve(mockAlert));

    // Configurar spies globales
    localStorageRemoveItemSpy = spyOn(localStorage, 'removeItem');
    sessionStorageClearSpy = spyOn(sessionStorage, 'clear');

    await TestBed.configureTestingModule({
      declarations: [InformacionPersonalPage],
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

    fixture = TestBed.createComponent(InformacionPersonalPage);
    component = fixture.componentInstance;
    
    // Inicializar formularios manualmente para evitar problemas
    fixture.detectChanges();
  });

  afterEach(() => {
    // Limpiar todos los spies después de cada test
    Object.keys(localStorage).forEach(key => {
      if (localStorage[key] && (localStorage[key] as any).calls) {
        (localStorage[key] as jasmine.Spy).calls.reset();
      }
    });
    
    Object.keys(sessionStorage).forEach(key => {
      if (sessionStorage[key] && (sessionStorage[key] as any).calls) {
        (sessionStorage[key] as jasmine.Spy).calls.reset();
      }
    });
  });

  it('debería crear la página de información personal', () => {
    expect(component).toBeTruthy();
  });

  // Prueba 2: Verificar que los formularios se inicializan con los campos correctos
  describe('Inicialización de formularios', () => {
    it('debería inicializar el formulario de información personal', () => {
      expect(component.infoForm.contains('usuario')).toBeTrue();
      expect(component.infoForm.contains('correo')).toBeTrue();
      expect(component.infoForm.contains('nombre')).toBeTrue();
      expect(component.infoForm.contains('apellido')).toBeTrue();
      expect(component.infoForm.contains('nivelEducacion')).toBeTrue();
      expect(component.infoForm.contains('fechaNacimiento')).toBeTrue();
    });

    it('debería inicializar el formulario de cambio de contraseña', () => {
      expect(component.passwordForm.contains('nuevaPassword')).toBeTrue();
      expect(component.passwordForm.contains('confirmarPassword')).toBeTrue();
    });

    it('debería tener validadores en el formulario de información personal', () => {
      const correoControl = component.infoForm.get('correo');
      expect(correoControl).toBeTruthy();
      expect(correoControl?.hasValidator(Validators.required)).toBeTrue();
      expect(correoControl?.hasValidator(Validators.email)).toBeTrue();
      
      // Verificar que otros campos tengan validadores requeridos
      const usuarioControl = component.infoForm.get('usuario');
      expect(usuarioControl?.hasValidator(Validators.required)).toBeTrue();
      
      const nombreControl = component.infoForm.get('nombre');
      expect(nombreControl?.hasValidator(Validators.required)).toBeTrue();
      
      const apellidoControl = component.infoForm.get('apellido');
      expect(apellidoControl?.hasValidator(Validators.required)).toBeTrue();
      
      const nivelEducacionControl = component.infoForm.get('nivelEducacion');
      expect(nivelEducacionControl?.hasValidator(Validators.required)).toBeTrue();
      
      const fechaNacimientoControl = component.infoForm.get('fechaNacimiento');
      expect(fechaNacimientoControl?.hasValidator(Validators.required)).toBeTrue();
    });

    it('debería tener validadores en el formulario de contraseña', () => {
      const passwordControl = component.passwordForm.get('nuevaPassword');
      expect(passwordControl).toBeTruthy();
      
      // Verificar validadores específicos
      expect(passwordControl?.hasValidator(Validators.required)).toBeTrue();
      
      // Para verificar el patrón, podemos probar validaciones
      passwordControl?.setValue('123');
      expect(passwordControl?.errors?.['pattern']).toBeTruthy();
      
      passwordControl?.setValue('1234');
      expect(passwordControl?.valid).toBeTrue();
    });
  });

  // Prueba 3: Verificar la carga de datos del usuario
  describe('cargarDatosUsuario()', () => {
    let localStorageGetItemSpy: jasmine.Spy;

    beforeEach(() => {
      // Mock localStorage
      localStorageGetItemSpy = spyOn(localStorage, 'getItem').and.returnValue('patinador123');
      // Resetear el mock de obtenerUsuario para cada test
      mockApiService.obtenerUsuario.calls.reset();
    });

    it('debería cargar datos del usuario desde la API', fakeAsync(() => {
      const datosMock = {
        usuario: 'patinador123',
        correo: 'patinador@email.com',
        nombre: 'Carlos',
        apellido: 'Skater',
        nivel_educacion: 'Intermedio',
        fecha_nacimiento: '1995-05-15'
      };

      mockApiService.obtenerUsuario.and.returnValue(of(datosMock));

      component.cargarDatosUsuario();
      tick();

      expect(mockApiService.obtenerUsuario).toHaveBeenCalledWith('patinador123');
      expect(component.usuarioData).toEqual(datosMock);
      expect(component.infoForm.get('usuario')?.value).toBe('patinador123');
      expect(component.infoForm.get('correo')?.value).toBe('patinador@email.com');
      expect(component.infoForm.get('nombre')?.value).toBe('Carlos');
      expect(component.infoForm.get('apellido')?.value).toBe('Skater');
      expect(component.infoForm.get('nivelEducacion')?.value).toBe('Intermedio');
      expect(component.infoForm.get('fechaNacimiento')?.value).toBe('1995-05-15');
    }));

    it('debería usar "solrack1" si no hay usuario en localStorage', fakeAsync(() => {
      localStorageGetItemSpy.and.returnValue(null);
      const datosMock = { usuario: 'solrack1', correo: 'solrack1@email.com' };
      mockApiService.obtenerUsuario.and.returnValue(of(datosMock));

      component.cargarDatosUsuario();
      tick();

      expect(mockApiService.obtenerUsuario).toHaveBeenCalledWith('solrack1');
    }));

    it('debería manejar error al cargar datos del usuario', fakeAsync(() => {
      mockApiService.obtenerUsuario.and.returnValue(throwError(() => new Error('Error de API')));

      component.cargarDatosUsuario();
      tick();

      expect(mockApiService.obtenerUsuario).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
      // Verificar que se llamó a mostrarAlerta
      expect(mockAlertController.create).toHaveBeenCalled();
    }));

    it('debería establecer isLoading en true durante la carga', fakeAsync(() => {
      const datosMock = { usuario: 'test' };
      mockApiService.obtenerUsuario.and.returnValue(of(datosMock));

      expect(component.isLoading).toBeFalse();
      
      component.cargarDatosUsuario();
      expect(component.isLoading).toBeTrue();
      
      tick();
      expect(component.isLoading).toBeFalse();
    }));
  });

  // Prueba 4: Verificar validaciones del formulario de información personal
  describe('Validaciones de información personal', () => {
    it('debería validar formato de correo electrónico', () => {
      const correoControl = component.infoForm.get('correo');
      
      correoControl?.setValue('correo-invalido');
      expect(correoControl?.valid).toBeFalse();
      expect(correoControl?.errors?.['email']).toBeTruthy();
      
      correoControl?.setValue('patinador@skate.com');
      expect(correoControl?.valid).toBeTrue();
    });

    it('debería requerir todos los campos obligatorios', () => {
      const form = component.infoForm;
      
      // Formulario vacío debería ser inválido
      expect(form.valid).toBeFalse();
      
      // Completar todos los campos
      form.setValue({
        usuario: 'patinador123',
        correo: 'patinador@email.com',
        nombre: 'Ana',
        apellido: 'Patina',
        nivelEducacion: 'Principiante',
        fechaNacimiento: '2000-01-01'
      });
      
      expect(form.valid).toBeTrue();
    });

    it('debería marcar campos como touched al interactuar', () => {
      const nombreControl = component.infoForm.get('nombre');
      expect(nombreControl?.touched).toBeFalse();
      
      nombreControl?.markAsTouched();
      expect(nombreControl?.touched).toBeTrue();
    });
  });

  // Prueba 5: Verificar el validador de contraseñas
  describe('passwordMatchValidator()', () => {
    it('debería devolver null cuando las contraseñas coinciden', () => {
      const control = {
        get: (key: string) => ({
          value: key === 'nuevaPassword' ? '1234' : '1234'
        })
      } as any;
      
      const result = component.passwordMatchValidator(control);
      expect(result).toBeNull();
    });

    it('debería devolver error cuando las contraseñas no coinciden', () => {
      const control = {
        get: (key: string) => ({
          value: key === 'nuevaPassword' ? '1234' : '5678'
        })
      } as any;
      
      const result = component.passwordMatchValidator(control);
      expect(result).toEqual({ mismatch: true });
    });

    it('debería manejar valores undefined', () => {
      const control = {
        get: () => undefined
      } as any;
      
      const result = component.passwordMatchValidator(control);
      expect(result).toBeNull();
    });
  });

  // Prueba 6: Verificar cambio de contraseña
  describe('cambiarPassword()', () => {
    beforeEach(() => {
      component.usuarioData = { usuario: 'patinador123' };
      // Resetear el mock para cada test
      mockApiService.actualizarUsuario.calls.reset();
    });

    it('debería cambiar contraseña cuando el formulario es válido', fakeAsync(() => {
      component.passwordForm.setValue({
        nuevaPassword: '8888',
        confirmarPassword: '8888'
      });

      const respuestaMock = { mensaje: 'Contraseña actualizada' };
      mockApiService.actualizarUsuario.and.returnValue(of(respuestaMock));

      component.cambiarPassword();
      tick();

      expect(mockApiService.actualizarUsuario).toHaveBeenCalledWith('patinador123', {
        password: '8888'
      });
      expect(component.passwordForm.pristine).toBeTrue();
      expect(mockAlertController.create).toHaveBeenCalled();
    }));

    it('debería validar coincidencia de contraseñas', () => {
      component.passwordForm.setValue({
        nuevaPassword: '1234',
        confirmarPassword: '5678'
      });

      expect(component.passwordForm.hasError('mismatch')).toBeTrue();
      expect(component.passwordForm.valid).toBeFalse();
    });

    it('debería validar que la contraseña tenga 4 dígitos', () => {
      const passwordControl = component.passwordForm.get('nuevaPassword');
      
      passwordControl?.setValue('123');
      expect(passwordControl?.valid).toBeFalse();
      expect(passwordControl?.errors?.['pattern']).toBeTruthy();
      
      passwordControl?.setValue('1234');
      expect(passwordControl?.valid).toBeTrue();
      
      passwordControl?.setValue('abcd');
      expect(passwordControl?.valid).toBeFalse();
    });

    it('no debería ejecutarse si el formulario es inválido', () => {
      component.passwordForm.setValue({
        nuevaPassword: '123',
        confirmarPassword: '123'
      });

      component.cambiarPassword();
      
      expect(mockApiService.actualizarUsuario).not.toHaveBeenCalled();
    });

    it('no debería ejecutarse si ya está en proceso', () => {
      component.isChangingPassword = true;
      component.passwordForm.setValue({
        nuevaPassword: '1234',
        confirmarPassword: '1234'
      });

      component.cambiarPassword();
      
      expect(mockApiService.actualizarUsuario).not.toHaveBeenCalled();
    });

    it('debería manejar error al cambiar contraseña', fakeAsync(() => {
      component.passwordForm.setValue({
        nuevaPassword: '1234',
        confirmarPassword: '1234'
      });

      mockApiService.actualizarUsuario.and.returnValue(throwError(() => new Error('Error de API')));

      component.cambiarPassword();
      tick();

      expect(mockApiService.actualizarUsuario).toHaveBeenCalled();
      expect(component.isChangingPassword).toBeFalse();
      expect(mockAlertController.create).toHaveBeenCalled();
    }));
  });

  // Prueba 7: Verificar actualización de información personal
  describe('actualizarInformacion()', () => {
    beforeEach(() => {
      component.usuarioData = { usuario: 'patinador123' };
      mockApiService.actualizarUsuario.calls.reset();
    });

    it('debería actualizar información personal correctamente', fakeAsync(() => {
      component.infoForm.setValue({
        usuario: 'patinador123',
        correo: 'nuevo@email.com',
        nombre: 'NuevoNombre',
        apellido: 'NuevoApellido',
        nivelEducacion: 'Avanzado',
        fechaNacimiento: '1998-08-20T00:00:00.000Z'
      });

      const respuestaMock = { mensaje: 'Actualizado' };
      mockApiService.actualizarUsuario.and.returnValue(of(respuestaMock));

      component.actualizarInformacion();
      tick();

      expect(mockApiService.actualizarUsuario).toHaveBeenCalledWith('patinador123', {
        nombre: 'NuevoNombre',
        apellido: 'NuevoApellido',
        correo: 'nuevo@email.com',
        nivel_educacion: 'Avanzado',
        fecha_nacimiento: '1998-08-20'
      });
      expect(mockAlertController.create).toHaveBeenCalled();
    }));

    it('debería formatear fecha con formato ISO', fakeAsync(() => {
      component.infoForm.setValue({
        usuario: 'patinador123',
        correo: 'test@test.com',
        nombre: 'Test',
        apellido: 'User',
        nivelEducacion: 'Principiante',
        fechaNacimiento: '1998-08-20T14:30:00.000Z'
      });

      mockApiService.actualizarUsuario.and.returnValue(of({}));

      component.actualizarInformacion();
      tick();

      expect(mockApiService.actualizarUsuario).toHaveBeenCalledWith('patinador123', {
        nombre: 'Test',
        apellido: 'User',
        correo: 'test@test.com',
        nivel_educacion: 'Principiante',
        fecha_nacimiento: '1998-08-20'
      });
    }));

    it('debería mantener fecha ya formateada', fakeAsync(() => {
      component.infoForm.setValue({
        usuario: 'patinador123',
        correo: 'test@test.com',
        nombre: 'Test',
        apellido: 'User',
        nivelEducacion: 'Principiante',
        fechaNacimiento: '1998-08-20'
      });

      mockApiService.actualizarUsuario.and.returnValue(of({}));

      component.actualizarInformacion();
      tick();

      expect(mockApiService.actualizarUsuario).toHaveBeenCalledWith('patinador123', {
        nombre: 'Test',
        apellido: 'User',
        correo: 'test@test.com',
        nivel_educacion: 'Principiante',
        fecha_nacimiento: '1998-08-20'
      });
    }));

    it('no debería ejecutarse si el formulario es inválido', () => {
      component.infoForm.setValue({
        usuario: '',
        correo: 'correo-invalido',
        nombre: '',
        apellido: '',
        nivelEducacion: '',
        fechaNacimiento: ''
      });

      component.actualizarInformacion();
      
      expect(mockApiService.actualizarUsuario).not.toHaveBeenCalled();
    });

    it('no debería ejecutarse si ya está cargando', () => {
      component.isLoading = true;
      component.infoForm.setValue({
        usuario: 'test',
        correo: 'test@test.com',
        nombre: 'Test',
        apellido: 'User',
        nivelEducacion: 'Principiante',
        fechaNacimiento: '2000-01-01'
      });

      component.actualizarInformacion();
      
      expect(mockApiService.actualizarUsuario).not.toHaveBeenCalled();
    });

    it('debería manejar error al actualizar información', fakeAsync(() => {
      component.infoForm.setValue({
        usuario: 'patinador123',
        correo: 'test@test.com',
        nombre: 'Test',
        apellido: 'User',
        nivelEducacion: 'Principiante',
        fechaNacimiento: '2000-01-01'
      });

      mockApiService.actualizarUsuario.and.returnValue(throwError(() => new Error('Error de API')));

      component.actualizarInformacion();
      tick();

      expect(mockApiService.actualizarUsuario).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
      expect(mockAlertController.create).toHaveBeenCalled();
    }));
  });

  // Prueba 8: Verificar formato de fecha
  describe('formatFecha()', () => {
    it('debería formatear fecha ISO a formato legible', () => {
      const fechaFormateada = component.formatFecha('1998-08-20T00:00:00.000Z');
      // En español, debería contener el mes "agosto"
      expect(fechaFormateada).toContain('1998');
      expect(fechaFormateada).toContain('agosto');
      // NOTA: La fecha se formatea según la zona horaria local
      // Puede ser 19 o 20 dependiendo de la zona horaria
      // Solo verificar que sea una fecha válida
      expect(fechaFormateada).toMatch(/\d{1,2} de agosto de 1998/);
    });

    it('debería manejar fecha inválida retornando "Fecha inválida"', () => {
      const fechaFormateada = component.formatFecha('fecha-invalida');
      expect(fechaFormateada).toBe('Fecha inválida');
    });

    it('debería retornar cadena vacía para fecha vacía', () => {
      const fechaFormateada = component.formatFecha('');
      expect(fechaFormateada).toBe('');
    });

    it('debería manejar fecha null o undefined', () => {
      const fechaFormateada1 = component.formatFecha(null as any);
      const fechaFormateada2 = component.formatFecha(undefined as any);
      
      expect(fechaFormateada1).toBe('');
      expect(fechaFormateada2).toBe('');
    });

    it('debería manejar objeto Date inválido retornando "Fecha inválida"', () => {
      const fechaFormateada = component.formatFecha('Invalid Date');
      expect(fechaFormateada).toBe('Fecha inválida');
    });
  });

  // Prueba 9: Verificar cierre de sesión
  describe('cerrarSesion()', () => {
    beforeEach(() => {
      // Resetear los spies antes de cada test en este describe
      localStorageRemoveItemSpy.calls.reset();
      sessionStorageClearSpy.calls.reset();
      mockNavController.navigateRoot.calls.reset();
    });

    it('debería mostrar alerta de confirmación', async () => {
      await component.cerrarSesion();
      
      expect(mockAlertController.create).toHaveBeenCalledWith({
        header: 'Cerrar Sesión',
        message: '¿Estás seguro de que quieres cerrar sesión?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Cerrar Sesión',
            role: 'confirm',
            handler: jasmine.any(Function)
          }
        ]
      });
    });

    it('debería limpiar almacenamiento local al cerrar sesión', () => {
      component.ejecutarCerrarSesion();
      
      expect(localStorageRemoveItemSpy).toHaveBeenCalledWith('usuarioActual');
      expect(sessionStorageClearSpy).toHaveBeenCalled();
      expect(mockNavController.navigateRoot).toHaveBeenCalledWith('/login');
    });
  });

  // Prueba 10: Verificar eliminación de cuenta
  describe('confirmarEliminarCuenta() y eliminarCuenta()', () => {
    beforeEach(() => {
      component.usuarioData = { usuario: 'patinador123' };
      mockApiService.eliminarUsuario.calls.reset();
      
      // Resetear los spies antes de cada test
      localStorageRemoveItemSpy.calls.reset();
      sessionStorageClearSpy.calls.reset();
      mockNavController.navigateRoot.calls.reset();
    });

    it('debería mostrar alerta de confirmación con input', async () => {
      await component.confirmarEliminarCuenta();
      
      expect(mockAlertController.create).toHaveBeenCalledWith({
        header: 'Eliminar Cuenta',
        message: '¿Estás SEGURO de que quieres eliminar tu cuenta? Esta acción NO se puede deshacer.',
        inputs: [
          {
            name: 'confirmacion',
            type: 'text',
            placeholder: 'Escribe "ELIMINAR" para confirmar'
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Eliminar',
            role: 'destructive',
            handler: jasmine.any(Function)
          }
        ]
      });
    });

    it('debería eliminar cuenta del usuario cuando se confirma', fakeAsync(() => {
      mockApiService.eliminarUsuario.and.returnValue(of({ mensaje: 'Cuenta eliminada' }));
      
      component.eliminarCuenta();
      tick();

      expect(mockApiService.eliminarUsuario).toHaveBeenCalledWith('patinador123');
      expect(localStorageRemoveItemSpy).toHaveBeenCalledWith('usuarioActual');
      expect(sessionStorageClearSpy).toHaveBeenCalled();
      expect(mockAlertController.create).toHaveBeenCalled();
    }));

    it('debería manejar error al eliminar cuenta', fakeAsync(() => {
      mockApiService.eliminarUsuario.and.returnValue(throwError(() => new Error('Error de API')));
      
      component.eliminarCuenta();
      tick();

      expect(mockApiService.eliminarUsuario).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
      expect(mockAlertController.create).toHaveBeenCalled();
    }));

    it('debería establecer isLoading durante la eliminación', fakeAsync(() => {
      mockApiService.eliminarUsuario.and.returnValue(of({}));
      
      expect(component.isLoading).toBeFalse();
      
      component.eliminarCuenta();
      expect(component.isLoading).toBeTrue();
      
      tick();
      expect(component.isLoading).toBeFalse();
    }));
  });

  // Prueba 11: Verificar función mostrarAlerta()
  describe('mostrarAlerta()', () => {
    it('debería crear y mostrar una alerta', async () => {
      const titulo = 'Test Título';
      const mensaje = 'Test Mensaje';
      
      await component.mostrarAlerta(titulo, mensaje);
      
      expect(mockAlertController.create).toHaveBeenCalledWith({
        header: titulo,
        message: mensaje,
        buttons: ['OK']
      });
    });
  });

  // Prueba 12: Verificar estados de carga
  describe('Estados de carga', () => {
    it('debería establecer isLoading true durante actualización', fakeAsync(() => {
      component.usuarioData = { usuario: 'test' };
      mockApiService.actualizarUsuario.and.returnValue(of({}));
      
      component.infoForm.setValue({
        usuario: 'test',
        correo: 'test@test.com',
        nombre: 'Test',
        apellido: 'User',
        nivelEducacion: 'Principiante',
        fechaNacimiento: '2000-01-01'
      });

      expect(component.isLoading).toBeFalse();
      
      component.actualizarInformacion();
      expect(component.isLoading).toBeTrue();
      
      tick();
      expect(component.isLoading).toBeFalse();
    }));

    it('debería establecer isChangingPassword true durante cambio de contraseña', fakeAsync(() => {
      component.usuarioData = { usuario: 'test' };
      component.passwordForm.setValue({
        nuevaPassword: '1234',
        confirmarPassword: '1234'
      });
      mockApiService.actualizarUsuario.and.returnValue(of({}));

      expect(component.isChangingPassword).toBeFalse();
      
      component.cambiarPassword();
      expect(component.isChangingPassword).toBeTrue();
      
      tick();
      expect(component.isChangingPassword).toBeFalse();
    }));
  });

  // Prueba 13: Verificar métodos del ciclo de vida
  describe('Métodos del ciclo de vida', () => {
    it('debería cargar datos en ngOnInit', () => {
      spyOn(component, 'cargarDatosUsuario');
      
      component.ngOnInit();
      
      expect(component.cargarDatosUsuario).toHaveBeenCalled();
    });

    it('debería recargar datos en ionViewWillEnter', () => {
      spyOn(component, 'cargarDatosUsuario');
      
      component.ionViewWillEnter();
      
      expect(component.cargarDatosUsuario).toHaveBeenCalled();
    });
  });

  // Prueba 14: Verificar getters
  describe('Getters', () => {
    it('debería retornar control de correo', () => {
      const correoControl = component.correo;
      const expectedControl = component.infoForm.get('correo');
      
      // Verificar que ambos controles existen
      expect(correoControl).toBeDefined();
      expect(expectedControl).toBeDefined();
      
      // Comparar propiedades clave
      expect(correoControl.value).toEqual(expectedControl!.value);
      expect(correoControl.valid).toBe(expectedControl!.valid);
    });

    it('debería retornar control de nuevaPassword', () => {
      const passwordControl = component.nuevaPassword;
      const expectedControl = component.passwordForm.get('nuevaPassword');
      
      expect(passwordControl).toBeDefined();
      expect(expectedControl).toBeDefined();
      
      expect(passwordControl.value).toEqual(expectedControl!.value);
      expect(passwordControl.valid).toBe(expectedControl!.valid);
    });

    it('debería retornar control de confirmarPassword', () => {
      const confirmControl = component.confirmarPassword;
      const expectedControl = component.passwordForm.get('confirmarPassword');
      
      expect(confirmControl).toBeDefined();
      expect(expectedControl).toBeDefined();
      
      expect(confirmControl.value).toEqual(expectedControl!.value);
      expect(confirmControl.valid).toBe(expectedControl!.valid);
    });

    it('debería usar operador de aserción no nula', () => {
      // Los getters deberían retornar controles válidos (no null)
      expect(component.correo).toBeDefined();
      expect(component.nuevaPassword).toBeDefined();
      expect(component.confirmarPassword).toBeDefined();
      
      // Los getters no deberían lanzar errores
      expect(() => component.correo).not.toThrow();
      expect(() => component.nuevaPassword).not.toThrow();
      expect(() => component.confirmarPassword).not.toThrow();
    });
  });
});
