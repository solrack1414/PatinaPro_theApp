import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { lastValueFrom } from 'rxjs'; // 🔥 IMPORTAR lastValueFrom

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false,
})
export class RegistroPage {
  registroForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private router: Router,
    private apiService: ApiService
  ) {
    this.registroForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]{3,8}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      confirmPassword: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
    }, { validators: this.passwordMatchValidator });

    console.log('RegistroPage inicializado - Formulario creado');
  }

  get usuario() {
    return this.registroForm.get('usuario')!;
  }

  get password() {
    return this.registroForm.get('password')!;
  }

  get confirmPassword() {
    return this.registroForm.get('confirmPassword')!;
  }

  get correo() {
    return this.registroForm.get('correo')!;
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    const isValid = password === confirmPassword;
    
    console.log('Validación de contraseñas - Coinciden:', isValid);
    return isValid ? null : { mismatch: true };
  }

  async validarRegistro() {
    if (this.registroForm.valid && !this.isLoading) {
      this.isLoading = true;

      const usuarioData = {
        usuario: this.usuario.value,
        password: this.password.value,
        correo: this.correo.value
      };

      try {
        // 🔥 CAMBIAR: usar lastValueFrom en lugar de toPromise
        await lastValueFrom(this.apiService.crearUsuario(usuarioData));
        
        const alert = await this.alertCtrl.create({
          header: 'Registro exitoso',
          message: '¡Cuenta creada con éxito! Ahora puedes iniciar sesión.',
          buttons: ['OK'],
        });
        await alert.present();

        this.router.navigate(['/login']);
        
      } catch (error: any) {
        const alert = await this.alertCtrl.create({
          header: 'Error en registro',
          message: error.error?.detail || 'Error al crear usuario',
          buttons: ['OK'],
        });
        await alert.present();
      } finally {
        this.isLoading = false;
      }
    }
  }
}