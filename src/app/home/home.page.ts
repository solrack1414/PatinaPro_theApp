import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonInput } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { lastValueFrom } from 'rxjs';

// 🔥 IMPORTAR PLUGINS DE CAPACITOR
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, AfterViewInit {
  usuario: string = '';
  infoForm: FormGroup;
  isLoading: boolean = false;
  fotoBase64: string | null = null;

  @ViewChild('nombreInput', { static: false }) nombreInput!: IonInput;
  @ViewChild('apellidoInput', { static: false }) apellidoInput!: IonInput;

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
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params && params['usuario']) {
        this.usuario = params['usuario'];
        this.cargarDatosUsuario();
      }
    });
  }

  ngAfterViewInit() {
    // No hace falta bandera aquí
  }

  // 🔥 MÉTODOS PARA LA CÁMARA
  async tomarFoto() {
    try {
      const imagen = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        promptLabelHeader: 'Tomar Foto',
        promptLabelPhoto: 'Desde Galería',
        promptLabelPicture: 'Tomar Foto'
      });

      this.fotoBase64 = `data:image/jpeg;base64,${imagen.base64String}`;
      console.log('Foto tomada exitosamente');

    } catch (error) {
      console.error('Error al tomar foto:', error);
      // El usuario canceló la operación, no es un error crítico
    }
  }

  async seleccionarFoto() {
    try {
      const imagen = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });

      this.fotoBase64 = `data:image/jpeg;base64,${imagen.base64String}`;
      console.log('Foto seleccionada exitosamente');

    } catch (error) {
      console.error('Error al seleccionar foto:', error);
      // El usuario canceló la operación
    }
  }

  eliminarFoto() {
    this.fotoBase64 = null;
    console.log('Foto eliminada');
  }

  async cargarDatosUsuario() {
    try {
      const usuarioData = await lastValueFrom(this.apiService.obtenerUsuario(this.usuario));
      console.log('✅ Datos del usuario obtenidos:', usuarioData);
      
      this.infoForm.patchValue({
        nombre: usuarioData.nombre || '',
        apellido: usuarioData.apellido || '',
        nivelEducacion: usuarioData.nivel_educacion || '',
        fechaNacimiento: usuarioData.fecha_nacimiento || ''
      });

      // Cargar foto si existe
      if (usuarioData.foto) {
        this.fotoBase64 = usuarioData.foto;
      }
      
    } catch (error) {
      console.log('ℹ️ Usuario nuevo, sin datos previos');
    }
  }

  async onSubmit() {
    if (this.infoForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const datos = this.infoForm.value;
      
      // Formatear fecha para la API
      let fechaFormateada = datos.fechaNacimiento;
      if (datos.fechaNacimiento && datos.fechaNacimiento.includes('T')) {
        fechaFormateada = datos.fechaNacimiento.split('T')[0];
      }
      
      const datosParaAPI = {
        nombre: datos.nombre,
        apellido: datos.apellido,
        nivel_educacion: datos.nivelEducacion,
        fecha_nacimiento: fechaFormateada,
        foto: this.fotoBase64 // 🔥 INCLUIR LA FOTO
      };

      console.log('Datos a enviar al servidor (incluye foto):', {
        ...datosParaAPI,
        foto: this.fotoBase64 ? 'Sí (base64)' : 'No'
      });

      try {
        const respuesta = await lastValueFrom(this.apiService.actualizarUsuario(this.usuario, datosParaAPI));
        console.log('✅ Datos guardados exitosamente - Respuesta:', respuesta);

        const alert = await this.alertController.create({
          header: 'Datos guardados',
          message: `Nombre: ${datos.nombre}\nApellido: ${datos.apellido}\n${this.fotoBase64 ? '✓ Foto incluida' : ''}`,
          buttons: [{
            text: 'OK',
            handler: () => {
              this.router.navigate(['/menu']);
            }
          }]
        });
        
        await alert.present();
        
      } catch (error: any) {
        console.error('❌ Error al guardar datos:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'No se pudieron guardar los datos.',
          buttons: ['OK']
        });
        await alert.present();
      } finally {
        this.isLoading = false;
      }
    }
  }

  onCancelar() {
    this.infoForm.reset();
    this.fotoBase64 = null;
  }

  formatFecha(fechaISO: string): string {
    if (!fechaISO) return '';
    
    try {
      const fecha = new Date(fechaISO);
      if (isNaN(fecha.getTime())) {
        return 'Fecha inválida';
      }
      
      const opciones: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      
      return fecha.toLocaleDateString('es-ES', opciones);
    } catch (error) {
      return fechaISO;
    }
  }
}