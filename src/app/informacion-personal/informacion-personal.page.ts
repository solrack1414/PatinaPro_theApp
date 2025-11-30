import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AlertController, NavController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-informacion-personal',
  templateUrl: './informacion-personal.page.html',
  styleUrls: ['./informacion-personal.page.scss'],
  standalone: false,
})
export class InformacionPersonalPage implements OnInit {
  usuarioData: any = null;
  isLoading: boolean = false;
  isChangingPassword: boolean = false;

  infoForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private router: Router
  ) {
    // Formulario de información personal
    this.infoForm = this.fb.group({
      usuario: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      nivelEducacion: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
    });

    // Formulario de cambio de contraseña
    this.passwordForm = this.fb.group({
      nuevaPassword: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      confirmarPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  // Getters para validación
  get correo() {
    return this.infoForm.get('correo')!;
  }

  get nuevaPassword() {
    return this.passwordForm.get('nuevaPassword')!;
  }

  get confirmarPassword() {
    return this.passwordForm.get('confirmarPassword')!;
  }

  ngOnInit() {
    console.log('InformacionPersonalPage inicializado');
    this.cargarDatosUsuario();
  }

  ionViewWillEnter() {
    console.log('Recargando datos de usuario...');
    this.cargarDatosUsuario();
  }

  async cargarDatosUsuario() {
    console.log('Cargando datos del usuario...');
    this.isLoading = true;

    try {
      const usuario = localStorage.getItem('usuarioActual') || 'solrack1';
      console.log('Obteniendo datos para usuario:', usuario);
      
      const usuarioData = await lastValueFrom(this.apiService.obtenerUsuario(usuario));
      console.log('✅ Datos del usuario cargados:', usuarioData);
      this.usuarioData = usuarioData;

      this.infoForm.patchValue({
        usuario: usuarioData.usuario,
        correo: usuarioData.correo,
        nombre: usuarioData.nombre || '',
        apellido: usuarioData.apellido || '',
        nivelEducacion: usuarioData.nivel_educacion || '',
        fechaNacimiento: usuarioData.fecha_nacimiento || ''
      });

    } catch (error: any) {
      console.error('❌ Error al cargar datos del usuario:', error);
      this.mostrarAlerta('Error', 'No se pudieron cargar los datos del usuario.');
    } finally {
      this.isLoading = false;
    }
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

  passwordMatchValidator(control: AbstractControl) {
    const nuevaPassword = control.get('nuevaPassword')?.value;
    const confirmarPassword = control.get('confirmarPassword')?.value;
    return nuevaPassword === confirmarPassword ? null : { mismatch: true };
  }

  async actualizarInformacion() {
    console.log('Actualizando información personal...');
    
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
        correo: datos.correo,
        nivel_educacion: datos.nivelEducacion,
        fecha_nacimiento: fechaFormateada
      };

      try {
        const respuesta = await lastValueFrom(this.apiService.actualizarUsuario(datos.usuario, datosParaAPI));
        console.log('✅ Información actualizada exitosamente:', respuesta);
        this.mostrarAlerta('Éxito', 'Información personal actualizada correctamente.');
        
      } catch (error: any) {
        console.error('❌ Error al actualizar información:', error);
        this.mostrarAlerta('Error', 'No se pudo actualizar la información.');
      } finally {
        this.isLoading = false;
      }
    }
  }

  async cambiarPassword() {
    console.log('Cambiando contraseña...');
    
    if (this.passwordForm.valid && !this.isChangingPassword) {
      this.isChangingPassword = true;

      const nuevaPassword = this.nuevaPassword.value;

      const datosParaAPI = {
        password: nuevaPassword
      };

      try {
        const respuesta = await lastValueFrom(this.apiService.actualizarUsuario(this.usuarioData.usuario, datosParaAPI));
        console.log('✅ Contraseña cambiada exitosamente:', respuesta);
        
        this.passwordForm.reset();
        this.mostrarAlerta('Éxito', 'Contraseña cambiada correctamente.');
        
      } catch (error: any) {
        console.error('❌ Error al cambiar contraseña:', error);
        this.mostrarAlerta('Error', 'No se pudo cambiar la contraseña.');
      } finally {
        this.isChangingPassword = false;
      }
    }
  }

  async cerrarSesion() {
    const alert = await this.alertCtrl.create({
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
          handler: () => {
            this.ejecutarCerrarSesion();
          }
        }
      ]
    });

    await alert.present();
  }

  ejecutarCerrarSesion() {
    localStorage.removeItem('usuarioActual');
    sessionStorage.clear();
    this.navCtrl.navigateRoot('/login');
  }

  async confirmarEliminarCuenta() {
    const alert = await this.alertCtrl.create({
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
          handler: (data) => {
            if (data.confirmacion === 'ELIMINAR') {
              this.eliminarCuenta();
              return true;
            } else {
              this.mostrarAlerta('Error', 'Debes escribir "ELIMINAR" para confirmar.');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarCuenta() {
    console.log('Eliminando cuenta...');
    this.isLoading = true;

    try {
      await lastValueFrom(this.apiService.eliminarUsuario(this.usuarioData.usuario));
      console.log('✅ Cuenta eliminada exitosamente');
      
      localStorage.removeItem('usuarioActual');
      sessionStorage.clear();
      
      this.mostrarAlerta('Cuenta Eliminada', 'Tu cuenta ha sido eliminada exitosamente.')
        .then(() => {
          this.navCtrl.navigateRoot('/login');
        });
        
    } catch (error: any) {
      console.error('❌ Error al eliminar cuenta:', error);
      this.mostrarAlerta('Error', 'No se pudo eliminar la cuenta.');
    } finally {
      this.isLoading = false;
    }
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
    return alert;
  }
}