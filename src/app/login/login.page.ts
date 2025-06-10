import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false, // Indica que este componente no es independiente
})
export class LoginPage {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private navCtrl: NavController) {
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
  }

  get usuario() {
    return this.loginForm.get('usuario')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const datos = this.loginForm.value;
      // Navegar a la página Home pasando los datos por queryParams
      this.navCtrl.navigateRoot('/home', {
        queryParams: { usuario: datos.usuario, password: datos.password },
      });
    }
  }
}