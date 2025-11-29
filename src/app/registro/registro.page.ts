import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

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
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]{3,8}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      confirmPassword: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
    }, { validators: this.passwordMatchValidator });
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
    return password === confirmPassword ? null : { mismatch: true };
  }

  async validarRegistro() {
    if (this.registroForm.valid && !this.isLoading) {
      
      if (this.password.value !== this.confirmPassword.value) {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Las contraseñas no coinciden.',
          buttons: ['OK'],
        });
        await alert.present();
        return;
      }

      this.isLoading = true;

      // Simular validación por 2 segundos
      setTimeout(async () => {
        const alert = await this.alertCtrl.create({
          header: 'Registro exitoso',
          message: '¡Cuenta creada con éxito!',
          buttons: ['OK'],
        });
        await alert.present();

        this.router.navigate(['/home']);
        this.isLoading = false;
      }, 2000);
      
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Formulario incompleto',
        message: 'Por favor, completa todos los campos correctamente.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }
}