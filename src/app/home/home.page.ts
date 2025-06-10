import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonInput } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, AfterViewInit {
  usuario: string = '';
  infoForm: FormGroup;

  @ViewChild('nombreInput', { static: false }) nombreInput!: IonInput;
  @ViewChild('apellidoInput', { static: false }) apellidoInput!: IonInput;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController
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
      }
    });
  }

  ngAfterViewInit() {
    // No hace falta bandera aquí, @ViewChild con static false se inicializa después de vista
  }

  async onSubmit() {
    if (this.infoForm.valid) {
      const datos = this.infoForm.value;
      console.log('Datos guardados:', datos);

      // Mostrar alerta confirmando nombre y apellido
      const alert = await this.alertController.create({
        header: 'Datos guardados',
        message: `Nombre: ${datos.nombre}\nApellido: ${datos.apellido}`,
        buttons: [{
          text: 'OK',
          handler: () => {
            // Navegar a Menu después de cerrar alerta
            this.router.navigate(['/menu']);
          }
        }]
      });
      await alert.present();
    }
  }

  async onCancelar() {
    this.infoForm.reset();

    if (this.nombreInput) {
      const nombreEl = await this.nombreInput.getInputElement();
      if (nombreEl) this.animarInput(nombreEl);
    }

    if (this.apellidoInput) {
      const apellidoEl = await this.apellidoInput.getInputElement();
      if (apellidoEl) this.animarInput(apellidoEl);
    }
  }

  animarInput(element: HTMLElement | null) {
    if (!element) return;
    element.classList.remove('slide-right');
    void element.offsetWidth; // fuerza reflow para reiniciar animación
    element.classList.add('slide-right');
  }
}