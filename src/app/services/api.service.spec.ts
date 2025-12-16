import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const API_URL = 'http://10.0.2.2:8000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('login()', () => {
    it('debería enviar POST al endpoint /login/ con credenciales de patinador', () => {
      const credenciales = { 
        usuario: 'patinadorPro', 
        password: '4321' 
      };
      
      const respuestaMock = { 
        mensaje: 'Login exitoso', 
        usuario: 'patinadorPro' 
      };

      service.login(credenciales).subscribe(respuesta => {
        expect(respuesta).toEqual(respuestaMock);
      });

      const req = httpMock.expectOne(`${API_URL}/login/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credenciales);
      req.flush(respuestaMock);
    });

    it('debería manejar error cuando las credenciales son incorrectas', () => {
      const credenciales = { 
        usuario: 'usuarioInvalido', 
        password: '0000' 
      };

      service.login(credenciales).subscribe({
        next: () => fail('Debería haber fallado con credenciales incorrectas'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/login/`);
      req.flush({ detail: 'Credenciales inválidas' }, { 
        status: 401, 
        statusText: 'Unauthorized' 
      });
    });
  });

  describe('crearUsuario()', () => {
    it('debería registrar nuevo usuario patinador en /usuarios/', () => {
      const nuevoPatinador = {
        usuario: 'nuevoPatinador',
        password: '9999',
        correo: 'patinador@email.com'
      };
      
      const respuestaMock = { 
        id: 1, 
        usuario: 'nuevoPatinador',
        correo: 'patinador@email.com'
      };

      service.crearUsuario(nuevoPatinador).subscribe(respuesta => {
        expect(respuesta.usuario).toBe('nuevoPatinador');
        expect(respuesta.correo).toBe('patinador@email.com');
      });

      const req = httpMock.expectOne(`${API_URL}/usuarios/`);
      expect(req.request.method).toBe('POST');
      req.flush(respuestaMock);
    });
  });

  describe('obtenerUsuario()', () => {
    it('debería obtener datos de un patinador registrado', () => {
      const usuario = 'patinadorExperto';
      const datosPatinador = {
        id: 5,
        usuario: 'patinadorExperto',
        correo: 'experto@patina.com',
        nivel_educacion: 'Avanzado'
      };

      service.obtenerUsuario(usuario).subscribe(datos => {
        expect(datos.usuario).toBe('patinadorExperto');
        expect(datos.nivel_educacion).toBe('Avanzado');
      });

      const req = httpMock.expectOne(`${API_URL}/usuarios/${usuario}`);
      expect(req.request.method).toBe('GET');
      req.flush(datosPatinador);
    });
  });
});