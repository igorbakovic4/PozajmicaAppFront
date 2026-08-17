import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StatistikaPage } from './statistika.page';

const routes: Routes = [
  {
    path: '',
    component: StatistikaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatistikaPageRoutingModule {}
