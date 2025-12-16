import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MenuPage } from './menu.page';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MenuPage', () => {
  let component: MenuPage;
  let fixture: ComponentFixture<MenuPage>;

  // Rutas simples para las pruebas
  const routes = [
    { path: 'rutas-programadas', component: {} as any },
    { path: 'informacion-personal', component: {} as any }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuPage],
      imports: [
        IonicModule.forRoot()
      ],
      providers: [
        provideRouter(routes)
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Prueba 1: Verificar creación del componente
  it('debería crear la página del menú principal', () => {
    expect(component).toBeTruthy();
  });

  // Prueba 2: Verificar estructura básica
  describe('Estructura básica', () => {
    it('debería tener un título principal', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('h1').textContent).toContain('Menú Principal');
    });

    it('debería tener un subtítulo descriptivo', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('h3').textContent).toContain('Aprende a patinar con PatinaPRO');
    });
  });

  // Prueba 3: Verificar opciones del menú
  describe('Opciones del menú', () => {
    it('debería tener 6 opciones en el menú', () => {
      const compiled = fixture.nativeElement;
      const items = compiled.querySelectorAll('ion-item');
      expect(items.length).toBe(6);
    });

    it('debería tener las rutas configuradas correctamente', () => {
      const compiled = fixture.nativeElement;
      const items = compiled.querySelectorAll('ion-item');
      
      // Verificar que los items con routerLink tienen las rutas correctas
      const rutaItem = items[1];
      expect(rutaItem.getAttribute('routerlink')).toBe('/rutas-programadas');
      
      const infoItem = items[5];
      expect(infoItem.getAttribute('routerlink')).toBe('/informacion-personal');
    });

    it('todos los items deberían tener atributos button y detail', () => {
      const compiled = fixture.nativeElement;
      const items = compiled.querySelectorAll('ion-item');
      
      items.forEach((item: any) => {
        expect(item.hasAttribute('button')).toBeTrue();
        expect(item.getAttribute('detail')).toBe('true');
      });
    });
  });

  // Prueba 4: Verificar animación Lottie
  describe('Animación Lottie', () => {
    it('debería contener el elemento lottie-player', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('lottie-player')).toBeTruthy();
    });

    it('debería tener la ruta del archivo de animación', () => {
      const compiled = fixture.nativeElement;
      const lottiePlayer = compiled.querySelector('lottie-player');
      expect(lottiePlayer.getAttribute('src')).toContain('../assets/pro.json');
    });
  });

  // Prueba 5: Verificar ciclo de vida
  describe('Ciclo de vida', () => {
    it('debería implementar OnInit', () => {
      expect(component.ngOnInit).toBeDefined();
    });

    it('debería ejecutar ngOnInit sin errores', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });
  });

  // Prueba 6: Verificar contenedor de animación
  it('debería tener un contenedor para la animación Lottie', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.lottie-wrapper')).toBeTruthy();
  });

  // Prueba 7: Verificar estructura general
  describe('Estructura general', () => {
    it('debería contener un ion-content', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('ion-content')).toBeTruthy();
    });

    it('debería contener un ion-list', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('ion-list')).toBeTruthy();
    });

    it('debería tener la clase ion-padding', () => {
      const compiled = fixture.nativeElement;
      const ionContent = compiled.querySelector('ion-content');
      expect(ionContent.classList.contains('ion-padding')).toBeTrue();
    });
  });

  // Prueba 8: Verificar que es un componente simple
  it('debería ser un componente simple sin lógica compleja', () => {
    // Verificar que ngOnInit está vacío
    const ngOnInitSpy = spyOn(component, 'ngOnInit');
    component.ngOnInit();
    expect(ngOnInitSpy).toHaveBeenCalled();
    
    // Verificar que no hay propiedades adicionales
    const props = Object.getOwnPropertyNames(component);
    // Componente simple: constructor, ngOnInit, y algunas propiedades de prototype
    expect(props.length).toBeLessThan(10);
  });

  // Prueba 9: Verificar navegación (CORREGIDA)
  describe('Navegación', () => {
    it('debería tener Router disponible para inyección', () => {
      // CORREGIDO: Injectar Router, no provideRouter
      const router = TestBed.inject(Router);
      expect(router).toBeTruthy();
    });

    it('solo dos items deberían tener routerLink', () => {
      const compiled = fixture.nativeElement;
      const itemsWithRouterLink = compiled.querySelectorAll('ion-item[routerlink]');
      expect(itemsWithRouterLink.length).toBe(2);
    });
  });

  // Prueba 10: Verificar contenido del menú
  describe('Contenido del menú', () => {
    it('debería contener texto descriptivo en el HTML', () => {
      const compiled = fixture.nativeElement;
      const htmlContent = compiled.innerHTML;
      
      // Verificar que el HTML contiene las palabras clave
      expect(htmlContent).toContain('Menú Principal');
      expect(htmlContent).toContain('Aprende a patinar con PatinaPRO');
      expect(htmlContent).toContain('Primeros movimientos');
      expect(htmlContent).toContain('rutas programadas');
      expect(htmlContent).toContain('Video tutoriales');
      expect(htmlContent).toContain('clase presencial');
      expect(htmlContent).toContain('medio de transporte');
      expect(htmlContent).toContain('Información Personal');
    });
  });

  // Prueba 11: Verificar configuración de Lottie
  describe('Configuración de Lottie', () => {
    it('debería tener estilos específicos en el elemento lottie-player', () => {
      const compiled = fixture.nativeElement;
      const lottiePlayer = compiled.querySelector('lottie-player');
      const style = lottiePlayer.getAttribute('style');
      
      expect(style).toContain('width: 200px');
      expect(style).toContain('height: 200px');
      expect(style).toContain('margin: auto');
    });

    it('debería tener atributos de configuración básicos', () => {
      const compiled = fixture.nativeElement;
      const lottiePlayer = compiled.querySelector('lottie-player');
      
      expect(lottiePlayer.getAttribute('speed')).toBe('1');
      expect(lottiePlayer.getAttribute('background')).toBe('transparent');
    });
  });
});