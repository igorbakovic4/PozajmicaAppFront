import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-nova-pozajmica',
  templateUrl: './nova-pozajmica.component.html',
  standalone: false
})
export class NovaPozajmicaComponent {
  danas = new Date().toISOString();

  constructor(private modalController: ModalController) {}

  odustani(): void {
    this.modalController.dismiss(null, 'odustani');
  }

  potvrdi(forma: NgForm): void {
    if (!forma.valid) {
      return;
    }

    this.modalController.dismiss(
      {
        duznik: forma.value.duznik,
        iznos: +forma.value.iznos,
        datum: forma.value.datum.substring(0, 10),
        opis: forma.value.opis
      },
      'potvrdi'
    );
  }
}