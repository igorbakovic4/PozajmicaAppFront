import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PozajmicePageRoutingModule } from './pozajmice-routing.module';
import { PozajmicePage } from './pozajmice.page';
import { NovaPozajmicaComponent } from './nova-pozajmica/nova-pozajmica.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PozajmicePageRoutingModule
  ],
  declarations: [PozajmicePage, NovaPozajmicaComponent]
})
export class PozajmicePageModule {}