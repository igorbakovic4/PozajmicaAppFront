import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DetaljPageRoutingModule } from './detalj-routing.module';
import { DetaljPage } from './detalj.page';
import { NovaRataComponent } from './nova-rata/nova-rata.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetaljPageRoutingModule
  ],
  declarations: [DetaljPage, NovaRataComponent]
})
export class DetaljPageModule {}