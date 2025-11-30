import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, AlertController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  loginForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private navCtrl: NavController,
    private apiService: ApiService,
    private alertCtrl: AlertController
  ) {
    this.loginForm = this.fb.group({
      usuario: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z0-9]{3,8}$/)],
      ],
      password: [
        '',
        [Validators.required, Validators.pattern(/^\d{4}$/)],
      ],
    });

    console.log('LoginPage inicializado - Formulario creado');
  }

  get usuario() {
    return this.loginForm.get('usuario')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  async onSubmit() {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      const datos = this.loginForm.value;
      
      console.log('Datos del formulario:', datos);
      console.log('Realizando petición al endpoint /login/');

      try {
        // 🔥 CAMBIAR: usar lastValueFrom en lugar de toPromise
        const respuesta = await lastValueFrom(this.apiService.login(datos));
        console.log('✅ Login exitoso - Respuesta del servidor:', respuesta);
        
        // Guardar usuario en localStorage para uso posterior
        localStorage.setItem('usuarioActual', datos.usuario);
        
        this.navCtrl.navigateRoot('/home', {
          queryParams: { usuario: datos.usuario }
        });
        
      } catch (error: any) {
        console.error('❌ Error en login:', error);
        const alert = await this.alertCtrl.create({
          header: 'Error de Login',
          message: error.error?.detail || 'Credenciales incorrectas',
          buttons: ['OK'],
        });
        await alert.present();
      } finally {
        this.isLoading = false;
      }
    }
  }
}