import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { PozajmicaService } from '../../../services/pozajmica.service';
import {
  Pozajmica,
  preostaliDug,
  ukupnoVraceno,
  procenatVracenog
} from '../../../models/pozajmica.model';
import { Rata } from '../../../models/rata.model';
import { NovaRataComponent } from './nova-rata/nova-rata.component';

@Component({
  selector: 'app-detalj',
  templateUrl: './detalj.page.html',
  styleUrls: ['./detalj.page.scss'],
  standalone: false
})
export class DetaljPage implements OnInit, OnDestroy {
  pozajmica?: Pozajmica;
  ucitavanje = true;

  private pozajmicaId = '';
  private pretplata?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pozajmicaService: PozajmicaService,
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.pozajmicaId = this.route.snapshot.paramMap.get('id') ?? '';

    this.pretplata = this.pozajmicaService.pozajmice$.subscribe(pozajmice => {
      this.pozajmica = pozajmice.find(p => p.id === this.pozajmicaId);
      if (this.pozajmica) {
        this.ucitavanje = false;
      }
    });
  }

  ionViewWillEnter(): void {
    if (this.pozajmica) {
      return;
    }
    // Korisnik je došao direktno na ovu adresu — lokalna lista je prazna
    this.ucitavanje = true;
    this.pozajmicaService.ucitajPozajmice().subscribe({
      next: () => {
        this.ucitavanje = false;
        if (!this.pozajmica) {
          this.vratiSeNaListu('Pozajmica nije pronađena.');
        }
      },
      error: async (greska: Error) => {
        this.ucitavanje = false;
        await this.prikaziGresku(greska.message);
      }
    });
  }

  ngOnDestroy(): void {
    this.pretplata?.unsubscribe();
  }

  // ---------- RATE ----------

  async otvoriFormuRate(): Promise<void> {
    if (!this.pozajmica) {
      return;
    }

    const modal = await this.modalController.create({
      component: NovaRataComponent,
      componentProps: { ostatak: this.preostalo }
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role !== 'potvrdi' || !data) {
      return;
    }

    const ucitavac = await this.loadingController.create({ message: 'Čuvanje...' });
    await ucitavac.present();

    this.pozajmicaService
      .dodajRatu(this.pozajmicaId, data.iznos, data.datum, data.napomena)
      .subscribe({
        next: async () => {
          await ucitavac.dismiss();
        },
        error: async (greska: Error) => {
          await ucitavac.dismiss();
          await this.prikaziGresku(greska.message);
        }
      });
  }

  async potvrdiBrisanjeRate(rata: Rata, klizac: any): Promise<void> {
    await klizac.close();

    const upozorenje = await this.alertController.create({
      header: 'Brisanje rate',
      message: `Obrisati uplatu od ${rata.iznos} RSD?`,
      buttons: [
        { text: 'Odustani', role: 'cancel' },
        {
          text: 'Obriši',
          role: 'destructive',
          handler: () => this.obrisiRatu(rata.id)
        }
      ]
    });
    await upozorenje.present();
  }

  // ---------- IZRAČUNATE VREDNOSTI ----------

  get vraceno(): number {
    return this.pozajmica ? ukupnoVraceno(this.pozajmica) : 0;
  }

  get preostalo(): number {
    return this.pozajmica ? preostaliDug(this.pozajmica) : 0;
  }

  get procenat(): number {
    return this.pozajmica ? procenatVracenog(this.pozajmica) / 100 : 0;
  }

  get procenatTekst(): number {
    return Math.round(this.procenat * 100);
  }

  get sortiraneRate(): Rata[] {
    if (!this.pozajmica) {
      return [];
    }
    return [...this.pozajmica.rate].sort((a, b) => b.datum.localeCompare(a.datum));
  }

  // ---------- POMOĆNE ----------

  private obrisiRatu(rataId: string): void {
    this.pozajmicaService.obrisiRatu(this.pozajmicaId, rataId).subscribe({
      error: async (greska: Error) => this.prikaziGresku(greska.message)
    });
  }

  private vratiSeNaListu(poruka: string): void {
    this.prikaziGresku(poruka);
    this.router.navigateByUrl('/pozajmice', { replaceUrl: true });
  }

  private async prikaziGresku(poruka: string): Promise<void> {
    const upozorenje = await this.alertController.create({
      header: 'Greška',
      message: poruka,
      buttons: ['U redu']
    });
    await upozorenje.present();
  }
}