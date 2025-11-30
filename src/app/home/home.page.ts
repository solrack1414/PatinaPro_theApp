import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { lastValueFrom } from 'rxjs'; // 🔥 IMPORTAR lastValueFrom

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  usuario: string = '';
  infoForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private apiService: ApiService
  ) {
    this.infoForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      nivelEducacion: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
    });

    console.log('HomePage inicializado - Formulario creado');
  }

  ngOnInit() {
    console.log('ngOnInit() ejecutado - Suscribiendo a queryParams');
    
    this.route.queryParams.subscribe(params => {
      console.log('QueryParams recibidos:', params);
      
      if (params && params['usuario']) {
        this.usuario = params['usuario'];
        console.log('Usuario establecido:', this.usuario);
        this.cargarDatosUsuario();
      } else {
        console.warn('⚠️ No se recibió usuario en queryParams');
      }
    });
  }

  // 🔥 AGREGAR ESTA FUNCIÓN A LA CLASE
  formatFecha(fechaISO: string): string {
    if (!fechaISO) return '';
    
    try {
      const fecha = new Date(fechaISO);
      
      // Verificar si la fecha es válida
      if (isNaN(fecha.getTime())) {
        console.warn('Fecha inválida:', fechaISO);
        return 'Fecha inválida';
      }
      
      const opciones: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      
      return fecha.toLocaleDateString('es-ES', opciones);
    } catch (error) {
      console.error('Error formateando fecha:', error, 'Fecha original:', fechaISO);
      return fechaISO; // Retorna la fecha original si hay error
    }
  }

  async cargarDatosUsuario() {
  console.log('cargarDatosUsuario() llamado para usuario:', this.usuario);
  
  try {
    // 🔥 CAMBIAR: usar lastValueFrom en lugar de toPromise
    const usuarioData = await lastValueFrom(this.apiService.obtenerUsuario(this.usuario));
    console.log('✅ Datos del usuario obtenidos:', usuarioData);
    
    this.infoForm.patchValue({
      nombre: usuarioData.nombre || '',
      apellido: usuarioData.apellido || '',
      nivelEducacion: usuarioData.nivel_educacion || '',
      fechaNacimiento: usuarioData.fecha_nacimiento || ''
    });
    
  } catch (error) {
    console.log('ℹ️ Usuario nuevo o error al cargar datos:', error);
  }
}

async onSubmit() {
  if (this.infoForm.valid && !this.isLoading) {
    this.isLoading = true;
    
    const datos = this.infoForm.value;
    let fechaFormateada = datos.fechaNacimiento;
    if (datos.fechaNacimiento && datos.fechaNacimiento.includes('T')) {
      fechaFormateada = datos.fechaNacimiento.split('T')[0];
    }
    
    const datosParaAPI = {
      nombre: datos.nombre,
      apellido: datos.apellido,
      nivel_educacion: datos.nivelEducacion,
      fecha_nacimiento: fechaFormateada
    };

    try {
      // 🔥 CAMBIAR: usar lastValueFrom en lugar de toPromise
      const respuesta = await lastValueFrom(this.apiService.actualizarUsuario(this.usuario, datosParaAPI));
      console.log('✅ Datos guardados exitosamente - Respuesta:', respuesta);

        const alert = await this.alertController.create({
          header: 'Datos guardados',
          message: `Nombre: ${datos.nombre}\nApellido: ${datos.apellido}\nFecha de nacimiento: ${this.formatFecha(datos.fechaNacimiento)}`,
          buttons: [{
            text: 'OK',
            handler: () => {
              console.log('Navegando a /menu');
              this.router.navigate(['/menu']);
            }
          }]
        });
        
        await alert.present();
        
      } catch (error: any) {
        console.error('❌ Error al guardar datos:', error);
        console.error('Detalles del error:', error.error);
        
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'No se pudieron guardar los datos. Verifica tu conexión.',
          buttons: ['OK']
        });
        await alert.present();
      } finally {
        this.isLoading = false;
        console.log('Proceso de guardado finalizado - isLoading:', this.isLoading);
      }
    } else {
      console.warn('⚠️ Formulario inválido - No se puede guardar');
      console.log('Estado del formulario:', this.infoForm.status);
      console.log('Errores del formulario:', this.infoForm.errors);
    }
  }

  onCancelar() {
    console.log('onCancelar() llamado - Reiniciando formulario');
    this.infoForm.reset();
    console.log('Formulario reiniciado - Valores actuales:', this.infoForm.value);
  }
}