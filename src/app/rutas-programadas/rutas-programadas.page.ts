import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Geolocation } from '@capacitor/geolocation';

// Declarar Leaflet como any para evitar problemas de tipos
declare var L: any;

@Component({
  selector: 'app-rutas-programadas',
  templateUrl: './rutas-programadas.page.html',
  styleUrls: ['./rutas-programadas.page.scss'],
  standalone: false
})
export class RutasProgramadasPage implements OnInit, OnDestroy {
  map: any;
  userMarker: any;
  rutas: any[] = [];
  rutaSeleccionada: any = null;

  constructor(private alertCtrl: AlertController) {}

  ngOnInit() {
    this.inicializarRutas();
    // 🔥 CAMBIAR: Esperar más tiempo para asegurar que el DOM esté listo
    setTimeout(() => {
      this.inicializarMapa();
    }, 800);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  inicializarRutas() {
    this.rutas = [
      {
        id: 1,
        nombre: 'RUTA 1 - Parque Bicentenario',
        dia: 'Martes',
        hora: '15:00 hrs',
        nivel: 'Intermedio',
        ubicacion: 'Vitacura',
        puntoEncuentro: 'Entrada principal del Parque Bicentenario',
        coordenadas: [-33.396, -70.579]
      },
      {
        id: 2,
        nombre: 'RUTA 2 - Parque Padre Hurtado',
        dia: 'Jueves',
        hora: '17:00 hrs',
        nivel: 'Básico',
        ubicacion: 'La Reina',
        puntoEncuentro: 'Anfiteatro del parque',
        coordenadas: [-33.452, -70.536]
      },
      {
        id: 3,
        nombre: 'RUTA 3 - Parque Juan XXIII',
        dia: 'Viernes',
        hora: '19:00 hrs',
        nivel: 'Avanzado',
        ubicacion: 'Ñuñoa',
        puntoEncuentro: 'Canchas de patinaje',
        coordenadas: [-33.456, -70.587]
      },
      {
        id: 4,
        nombre: 'RUTA 4 - Parque Forestal',
        dia: 'Sábados',
        hora: '10:00 hrs',
        nivel: 'Iniciante',
        ubicacion: 'Santiago Centro',
        puntoEncuentro: 'Frente al Museo de Bellas Artes',
        coordenadas: [-33.437, -70.634]
      }
    ];
  }

  inicializarMapa() {
    // Verificar que el contenedor del mapa exista
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('❌ Contenedor del mapa no encontrado');
      setTimeout(() => {
        this.inicializarMapa();
      }, 500);
      return;
    }

    // Verificar que Leaflet esté disponible
    if (typeof L === 'undefined') {
      console.error('❌ Leaflet no está cargado');
      setTimeout(() => {
        this.inicializarMapa();
      }, 500);
      return;
    }

    try {
      // 🔥 CAMBIAR: Esperar un frame más para asegurar que el contenedor tenga dimensiones
      setTimeout(() => {
        try {
          // Centrar el mapa en Santiago
          this.map = L.map('map').setView([-33.448, -70.669], 12);

          // Agregar capa de OpenStreetMap
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
          }).addTo(this.map);

          // 🔥 AGREGAR: Forzar redimensionamiento del mapa
          setTimeout(() => {
            if (this.map) {
              this.map.invalidateSize();
            }
          }, 100);

          // Agregar marcadores para cada ruta
          this.rutas.forEach(ruta => {
            const customIcon = L.divIcon({
              html: `<div style="background-color: #667eea; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${ruta.id}</div>`,
              className: 'custom-marker',
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            });

            const marker = L.marker(ruta.coordenadas, { icon: customIcon })
              .addTo(this.map)
              .bindPopup(`
                <div style="min-width: 200px;">
                  <b style="color: #667eea;">${ruta.nombre}</b><br>
                  <b>Día:</b> ${ruta.dia} - ${ruta.hora}<br>
                  <b>Nivel:</b> ${ruta.nivel}<br>
                  <b>Punto de encuentro:</b> ${ruta.puntoEncuentro}
                </div>
              `);

            // Asignar el marker a la ruta
            ruta.marker = marker;
          });

          console.log('✅ Mapa inicializado correctamente');

        } catch (mapError) {
          console.error('❌ Error al inicializar el mapa:', mapError);
        }
      }, 100);

    } catch (error) {
      console.error('❌ Error general en inicializarMapa:', error);
    }
  }

  seleccionarRuta(ruta: any) {
    this.rutaSeleccionada = ruta;
    
    // Centrar el mapa en la ruta seleccionada
    if (this.map) {
      this.map.setView(ruta.coordenadas, 15);
      
      // 🔥 AGREGAR: Asegurar que el mapa se redimensione
      setTimeout(() => {
        this.map.invalidateSize();
      }, 50);
      
      // Abrir popup del marcador
      if (ruta.marker) {
        ruta.marker.openPopup();
      }
    }
  }

  getColorByNivel(nivel: string): string {
    switch (nivel.toLowerCase()) {
      case 'iniciante': return 'success';
      case 'básico': return 'primary';
      case 'intermedio': return 'warning';
      case 'avanzado': return 'danger';
      default: return 'medium';
    }
  }

  async obtenerUbicacionActual() {
    try {
      console.log('📍 Solicitando permisos de ubicación...');
      
      // 🔥 CAMBIAR: Solicitar permisos primero
      const permiso = await Geolocation.requestPermissions();
      
      console.log('📋 Estado del permiso:', permiso.location);
      
      if (permiso.location !== 'granted') {
        const alert = await this.alertCtrl.create({
          header: 'Permisos requeridos',
          message: 'Necesitas permitir el acceso a la ubicación para usar esta función. Ve a Configuración de la app y activa los permisos de ubicación.',
          buttons: [
            {
              text: 'OK',
              handler: () => {
                // Opcional: Abrir configuración de la app
                // (Requiere plugin adicional)
              }
            }
          ]
        });
        await alert.present();
        return;
      }

      console.log('🎯 Obteniendo ubicación actual...');
      
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      });
      
      const lat = coordinates.coords.latitude;
      const lng = coordinates.coords.longitude;
      
      console.log('📍 Ubicación actual obtenida:', lat, lng);

      // Remover marcador anterior si existe
      if (this.userMarker) {
        this.map.removeLayer(this.userMarker);
      }

      // Crear icono personalizado para ubicación actual
      const userIcon = L.divIcon({
        html: `<div style="background-color: #28a745; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); animation: pulse 1.5s infinite;">
                <ion-icon name="navigate" style="font-size: 12px;"></ion-icon>
              </div>`,
        className: 'user-location-marker',
        iconSize: [25, 25],
        iconAnchor: [12, 12]
      });

      // Agregar nuevo marcador de ubicación actual
      this.userMarker = L.marker([lat, lng], { icon: userIcon })
        .addTo(this.map)
        .bindPopup('<b style="color: #28a745;">🎯 Tu ubicación actual</b>')
        .openPopup();

      // Centrar mapa en la ubicación actual
      this.map.setView([lat, lng], 15);

      // 🔥 AGREGAR: Asegurar redimensionamiento
      setTimeout(() => {
        this.map.invalidateSize();
      }, 50);

      // Mostrar distancia a la ruta seleccionada
      if (this.rutaSeleccionada) {
        const distancia = this.calcularDistancia(
          lat, lng,
          this.rutaSeleccionada.coordenadas[0],
          this.rutaSeleccionada.coordenadas[1]
        );

        const tiempoEstimado = this.calcularTiempoEstimado(distancia);

        const alert = await this.alertCtrl.create({
          header: '📍 Ubicación Encontrada',
          message: `
            <div style="text-align: center;">
              <p><strong>Estás a ${distancia.toFixed(1)} km</strong> del punto de encuentro</p>
              <p><strong>${this.rutaSeleccionada.nombre}</strong></p>
              <p>Tiempo estimado: ${tiempoEstimado}</p>
              <p><small>📍 ${this.rutaSeleccionada.puntoEncuentro}</small></p>
            </div>
          `,
          buttons: ['OK']
        });
        await alert.present();
      } else {
        const alert = await this.alertCtrl.create({
          header: '📍 Ubicación Encontrada',
          message: 'Tu ubicación se ha marcado en el mapa. Selecciona una ruta para ver la distancia.',
          buttons: ['OK']
        });
        await alert.present();
      }

    } catch (error: any) {
      console.error('❌ Error obteniendo ubicación:', error);
      
      let mensajeError = 'No se pudo obtener tu ubicación. ';
      
      if (error.message?.includes('timeout')) {
        mensajeError += 'El tiempo de espera se agotó. Asegúrate de tener buena señal GPS.';
      } else if (error.message?.includes('permission')) {
        mensajeError += 'Los permisos de ubicación no fueron concedidos.';
      } else {
        mensajeError += 'Asegúrate de que los permisos de ubicación estén activados y el GPS esté encendido.';
      }
      
      const alert = await this.alertCtrl.create({
        header: '❌ Error de Geolocalización',
        message: mensajeError,
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  // Calcular distancia entre dos puntos en kilómetros
  calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  }

  // Calcular tiempo estimado de viaje
  calcularTiempoEstimado(distanciaKm: number): string {
    // Asumiendo velocidad promedio de patinaje: 10-15 km/h
    const velocidadPromedio = 12; // km/h
    const tiempoHoras = distanciaKm / velocidadPromedio;
    
    if (tiempoHoras < 1) {
      const minutos = Math.round(tiempoHoras * 60);
      return `${minutos} min en patines`;
    } else {
      const horas = Math.floor(tiempoHoras);
      const minutos = Math.round((tiempoHoras - horas) * 60);
      return `${horas}h ${minutos}min en patines`;
    }
  }

  toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // 🔥 AGREGAR: Método para forzar redimensionamiento del mapa
  ionViewDidEnter() {
    // Redimensionar mapa cuando la página esté completamente cargada
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        console.log('🔄 Mapa redimensionado');
      }
    }, 300);
  }
}