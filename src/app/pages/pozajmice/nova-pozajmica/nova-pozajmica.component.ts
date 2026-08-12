import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';

import { Pozajmica } from '../../../models/pozajmica.model';

@Component({
  selector: 'app-nova-pozajmica',
  templateUrl: './nova-pozajmica.component.html',
  standalone: false
})
export class NovaPozajmicaComponent implements OnInit {
  @Input() postojeca?: Pozajmica;

  duznik = '';
  iznos: number | null = null;
  datum = new Date().toISOString();
  opis = '';

  najmanjiIznos = 1;

  ngOnInit(): void {
    if (!this.postojeca) {
      return;
    }

    this.duznik = this.postojeca.duznik;
    this.iznos = this.postojeca.iznos;
    this.datum = new Date(this.postojeca.datum).toISOString();
    this.opis = this.postojeca.opis ?? '';

    // Iznos ne sme pasti ispod već vraćenog dela
    const vraceno = this.postojeca.rate.reduce((zbir, rata) => zbir + rata.iznos, 0);
    this.najmanjiIznos = Math.max(1, vraceno);
  }

  constructor(private modalController: ModalController) {}

  get rezimIzmene(): boolean {
    return !!this.postojeca;
  }

  get naslov(): string {
    return this.rezimIzmene ? 'Izmena pozajmice' : 'Nova pozajmica';
  }

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
        opis: forma.value.opis ?? ''
      },
      'potvrdi'
    );
  }
}