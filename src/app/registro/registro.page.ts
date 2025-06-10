import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false, // Indica que este componente no es independiente
})
export class RegistroPage {
  registroForm: FormGroup;

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
    });
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

  async validarRegistro() {
    if (this.registroForm.valid) {
      if (this.password.value !== this.confirmPassword.value) {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Las contraseñas no coinciden.',
          buttons: ['OK'],
        });
        await alert.present();
        return;
      }

      const alert = await this.alertCtrl.create({
        header: 'Registro exitoso',
        message: '¡Cuenta creada con éxito!',
        buttons: ['OK'],
      });
      await alert.present();

      this.router.navigate(['/home']);
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

