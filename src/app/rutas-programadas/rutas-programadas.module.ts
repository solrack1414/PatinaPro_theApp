import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RutasProgramadasPageRoutingModule } from './rutas-programadas-routing.module';

import { RutasProgramadasPage } from './rutas-programadas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RutasProgramadasPageRoutingModule
  ],
  declarations: [RutasProgramadasPage]
})
export class RutasProgramadasPageModule {}
