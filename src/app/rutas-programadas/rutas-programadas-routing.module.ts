import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RutasProgramadasPage } from './rutas-programadas.page';

const routes: Routes = [
  {
    path: '',
    component: RutasProgramadasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RutasProgramadasPageRoutingModule {}
