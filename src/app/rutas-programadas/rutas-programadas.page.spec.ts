
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { RutasProgramadasPage } from './rutas-programadas.page';
import { AlertController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// Mock para Geolocation de Capacitor
const mockGeolocation = {
  requestPermissions: jasmine.createSpy('requestPermissions').and.returnValue(Promise.resolve({ location: 'granted' })),
  getCurrentPosition: jasmine.createSpy('getCurrentPosition').and.returnValue(Promise.resolve({
    coords: {
      latitude: -33.4489,
      longitude: -70.6693,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null
    },
    timestamp: Date.now()
  }))
};

// Mock para Leaflet
class MockMap {
  setView = jasmine.createSpy('setView');
  remove = jasmine.createSpy('remove');
  invalidateSize = jasmine.createSpy('invalidateSize');
  addLayer = jasmine.createSpy('addLayer');
  removeLayer = jasmine.createSpy('removeLayer');
}

class MockMarker {
  addTo = jasmine.createSpy('addTo').and.returnValue(this);
  bindPopup = jasmine.createSpy('bindPopup').and.returnValue(this);
  openPopup = jasmine.createSpy('openPopup');
}

const mockLeaflet = {
  map: jasmine.createSpy('map').and.callFake(() => new MockMap()),
  tileLayer: jasmine.createSpy('tileLayer').and.returnValue({
    addTo: jasmine.createSpy('addTo')
  }),
  marker: jasmine.createSpy('marker').and.callFake(() => new MockMarker()),
  divIcon: jasmine.createSpy('divIcon').and.returnValue({}),
  setView: jasmine.createSpy('setView'),
  invalidateSize: jasmine.createSpy('invalidateSize'),
  remove: jasmine.createSpy('remove')
};

describe('RutasProgramadasPage', () => {
  let component: RutasProgramadasPage;
  let fixture: ComponentFixture<RutasProgramadasPage>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;

  beforeEach(waitForAsync(() => {
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);
    alertSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve(),
      onDidDismiss: () => Promise.resolve({ data: null, role: 'cancel' })
    }));

    // Configurar mocks globales
    (window as any).L = mockLeaflet;
    (window as any).Geolocation = mockGeolocation;

    TestBed.configureTestingModule({
      declarations: [RutasProgramadasPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AlertController, useValue: alertSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RutasProgramadasPage);
    component = fixture.componentInstance;
    alertControllerSpy = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
    
    // Mock document.getElementById para el mapa
    spyOn(document, 'getElementById').and.returnValue(document.createElement('div'));
  }));

  afterEach(() => {
    // Limpiar mocks
    mockGeolocation.requestPermissions.calls.reset();
    mockGeolocation.getCurrentPosition.calls.reset();
    mockLeaflet.map.calls.reset();
  });

  it('debería crear la página de rutas programadas', () => {
    expect(component).toBeTruthy();
  });

  describe('inicializarRutas()', () => {
    it('debería inicializar las 4 rutas de patinaje', () => {
      component.inicializarRutas();
      expect(component.rutas.length).toBe(4);
      
      const ruta1 = component.rutas[0];
      expect(ruta1.nombre).toContain('Parque Bicentenario');
      expect(ruta1.dia).toBe('Martes');
      expect(ruta1.hora).toBe('15:00 hrs');
      expect(ruta1.nivel).toBe('Intermedio');
      expect(ruta1.ubicacion).toBe('Vitacura');
      expect(ruta1.coordenadas).toEqual([-33.396, -70.579]);
      
      const ruta4 = component.rutas[3];
      expect(ruta4.nivel).toBe('Iniciante');
      expect(ruta4.dia).toBe('Sábados');
    });

    it('debería tener rutas con coordenadas válidas', () => {
      component.inicializarRutas();
      component.rutas.forEach(ruta => {
        expect(ruta.coordenadas).toBeDefined();
        expect(ruta.coordenadas.length).toBe(2);
        expect(typeof ruta.coordenadas[0]).toBe('number');
        expect(typeof ruta.coordenadas[1]).toBe('number');
      });
    });
  });

  describe('seleccionarRuta()', () => {
    beforeEach(() => {
      component.inicializarRutas();
      component.map = new MockMap() as any;
    });

    it('debería seleccionar una ruta y centrar el mapa', () => {
      const ruta = component.rutas[0];
      ruta.marker = new MockMarker() as any;
      
      component.seleccionarRuta(ruta);
      
      expect(component.rutaSeleccionada).toBe(ruta);
      expect(component.map.setView).toHaveBeenCalledWith(ruta.coordenadas, 15);
      expect(ruta.marker.openPopup).toHaveBeenCalled();
    });

    it('debería manejar selección cuando no hay mapa', () => {
      component.map = null;
      const ruta = component.rutas[0];
      
      expect(() => component.seleccionarRuta(ruta)).not.toThrow();
      expect(component.rutaSeleccionada).toBe(ruta);
    });
  });

  describe('getColorByNivel()', () => {
    it('debería retornar color "success" para nivel Iniciante', () => {
      expect(component.getColorByNivel('Iniciante')).toBe('success');
      expect(component.getColorByNivel('iniciante')).toBe('success');
    });

    it('debería retornar color "primary" para nivel Básico', () => {
      expect(component.getColorByNivel('Básico')).toBe('primary');
      expect(component.getColorByNivel('básico')).toBe('primary');
    });

    it('debería retornar color "warning" para nivel Intermedio', () => {
      expect(component.getColorByNivel('Intermedio')).toBe('warning');
      expect(component.getColorByNivel('intermedio')).toBe('warning');
    });

    it('debería retornar color "danger" para nivel Avanzado', () => {
      expect(component.getColorByNivel('Avanzado')).toBe('danger');
      expect(component.getColorByNivel('avanzado')).toBe('danger');
    });

    it('debería retornar color "medium" para nivel desconocido', () => {
      expect(component.getColorByNivel('Desconocido')).toBe('medium');
      expect(component.getColorByNivel('')).toBe('medium');
    });
  });

  describe('calcularDistancia()', () => {
    it('debería calcular distancia entre dos puntos en kilómetros', () => {
      const lat1 = -33.4489;
      const lon1 = -70.6693;
      const lat2 = -33.396;
      const lon2 = -70.579;
      
      const distancia = component.calcularDistancia(lat1, lon1, lat2, lon2);
      
      expect(typeof distancia).toBe('number');
      expect(distancia).toBeGreaterThan(0);
      expect(distancia).toBeLessThan(100);
    });

    it('debería calcular distancia cero para mismos puntos', () => {
      const distancia = component.calcularDistancia(0, 0, 0, 0);
      expect(distancia).toBe(0);
    });
  });

  describe('calcularTiempoEstimado()', () => {
    it('debería calcular tiempo en minutos para distancias cortas', () => {
      const tiempo = component.calcularTiempoEstimado(2);
      expect(tiempo).toContain('min en patines');
    });

    it('debería calcular tiempo en horas para distancias largas', () => {
      const tiempo = component.calcularTiempoEstimado(25);
      expect(tiempo).toContain('h');
      expect(tiempo).toContain('min en patines');
    });
  });

  describe('toRad()', () => {
    it('debería convertir grados a radianes', () => {
      expect(component.toRad(0)).toBe(0);
      expect(component.toRad(180)).toBeCloseTo(Math.PI, 5);
      expect(component.toRad(360)).toBeCloseTo(2 * Math.PI, 5);
    });

    it('debería manejar valores negativos', () => {
      expect(component.toRad(-90)).toBeCloseTo(-Math.PI / 2, 5);
    });
  });

  describe('ngOnDestroy()', () => {
    it('debería remover el mapa al destruir el componente', () => {
      const mockMap = new MockMap();
      component.map = mockMap as any;
      
      component.ngOnDestroy();
      
      expect(mockMap.remove).toHaveBeenCalled();
    });

    it('debería manejar ngOnDestroy sin mapa', () => {
      component.map = null;
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  it('debería tener rutaSeleccionada null al inicio', () => {
    expect(component.rutaSeleccionada).toBeNull();
  });

  it('debería tener array de rutas vacío hasta inicialización', () => {
    component.rutas = [];
    expect(component.rutas.length).toBe(0);
    component.inicializarRutas();
    expect(component.rutas.length).toBe(4);
  });
});
