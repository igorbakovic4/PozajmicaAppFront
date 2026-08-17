import { Component, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-nova-rata',
  templateUrl: './nova-rata.component.html',
  standalone: false
})
export class NovaRataComponent {
  @Input() ostatak = 0;

  iznos: number | null = null;
  datum = new Date().toISOString();
  napomena = '';

  constructor(private modalController: ModalController) {}

  odustani(): void {
    this.modalController.dismiss(null, 'odustani');
  }

  uplatiCeoIznos(): void {
    this.iznos = this.ostatak;
  }

  potvrdi(forma: NgForm): void {
    if (!forma.valid) {
      return;
    }

    this.modalController.dismiss(
      {
        iznos: +forma.value.iznos,
        datum: forma.value.datum.substring(0, 10),
        napomena: forma.value.napomena ?? ''
      },
      'potvrdi'
    );
  }
}