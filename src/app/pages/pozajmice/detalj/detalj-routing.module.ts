import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetaljPage } from './detalj.page';

const routes: Routes = [
  {
    path: '',
    component: DetaljPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetaljPageRoutingModule {}
