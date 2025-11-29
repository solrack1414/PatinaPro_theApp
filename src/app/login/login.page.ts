import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  loginForm: FormGroup;
  isLoading: boolean = false;

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

  async onSubmit() {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      const datos = this.loginForm.value;
      
      // Simular carga de 2 segundos
      setTimeout(() => {
        this.navCtrl.navigateRoot('/home', {
          queryParams: { usuario: datos.usuario, password: datos.password },
        });
        this.isLoading = false;
      }, 2000);
    }
  }
}