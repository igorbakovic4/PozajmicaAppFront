import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PozajmicePage } from './pozajmice.page';

const routes: Routes = [
  {
    path: '',
    component: PozajmicePage
  },
  {
    path: ':id',
    loadChildren: () =>
      import('./detalj/detalj.module').then(m => m.DetaljPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PozajmicePageRoutingModule {}