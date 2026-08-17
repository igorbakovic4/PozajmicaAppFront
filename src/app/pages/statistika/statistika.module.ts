import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StatistikaPageRoutingModule } from './statistika-routing.module';

import { StatistikaPage } from './statistika.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatistikaPageRoutingModule
  ],
  declarations: [StatistikaPage]
})
export class StatistikaPageModule {}
