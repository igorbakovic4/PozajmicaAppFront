import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';

import { PozajmicaService } from '../../services/pozajmica.service';
import { AuthService } from '../../services/auth.service';
import {
  Pozajmica,
  preostaliDug,
  ukupnoVraceno,
  procenatVracenog
} from '../../models/pozajmica.model';
import { NovaPozajmicaComponent } from './nova-pozajmica/nova-pozajmica.component';

@Component({
  selector: 'app-pozajmice',
  templateUrl: './pozajmice.page.html',
  styleUrls: ['./pozajmice.page.scss'],
  standalone: false
})
export class PozajmicePage implements OnInit, OnDestroy {
  pozajmice: Pozajmica[] = [];
  ucitavanje = true;

  private pretplata?: Subscription;

  constructor(
    private pozajmicaService: PozajmicaService,
    private authService: AuthService,
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.pretplata = this.pozajmicaService.pozajmice$.subscribe(pozajmice => {
      this.pozajmice = pozajmice;
    });
  }

  ionViewWillEnter(): void {
    this.ucitajPodatke();
  }

  ngOnDestroy(): void {
    this.pretplata?.unsubscribe();
  }

  osvezi(dogadjaj: any): void {
    this.pozajmicaService.ucitajPozajmice().subscribe({
      next: () => dogadjaj.target.complete(),
      error: async (greska: Error) => {
        dogadjaj.target.complete();
        await this.prikaziGresku(greska.message);
      }
    });
  }

  otvoriDetalj(pozajmica: Pozajmica): void {
    this.router.navigate(['/pozajmice', pozajmica.id]);
  }

  async otvoriFormu(postojeca?: Pozajmica, klizac?: any): Promise<void> {
    if (klizac) {
      await klizac.close();
    }

    const modal = await this.modalController.create({
      component: NovaPozajmicaComponent,
      componentProps: { postojeca }
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role !== 'potvrdi' || !data) {
      return;
    }

    const ucitavac = await this.loadingController.create({ message: 'Čuvanje...' });
    await ucitavac.present();

    const zahtev: Observable<unknown> = postojeca
      ? this.pozajmicaService.izmeniPozajmicu(postojeca.id, {
          duznik: data.duznik,
          iznos: data.iznos,
          datum: data.datum,
          opis: data.opis
        })
      : this.pozajmicaService.dodajPozajmicu(
          data.duznik,
          data.iznos,
          data.datum,
          data.opis
        );

    zahtev.subscribe({
      next: async () => {
        await ucitavac.dismiss();
        if (postojeca) {
          this.pozajmicaService.osveziStatus(postojeca.id).subscribe();
        }
      },
      error: async (greska: Error) => {
        await ucitavac.dismiss();
        await this.prikaziGresku(greska.message);
      }
    });
  }

  async potvrdiBrisanje(pozajmica: Pozajmica, klizac: any): Promise<void> {
    await klizac.close();

    const upozorenje = await this.alertController.create({
      header: 'Brisanje pozajmice',
      message: `Obrisati pozajmicu za ${pozajmica.duznik}? Rate će takođe biti obrisane.`,
      buttons: [
        { text: 'Odustani', role: 'cancel' },
        {
          text: 'Obriši',
          role: 'destructive',
          handler: () => this.obrisi(pozajmica.id)
        }
      ]
    });
    await upozorenje.present();
  }

  odjaviSe(): void {
    this.authService.odjava();
    this.router.navigateByUrl('/auth', { replaceUrl: true });
  }

  preostalo(pozajmica: Pozajmica): number {
    return preostaliDug(pozajmica);
  }

  vraceno(pozajmica: Pozajmica): number {
    return ukupnoVraceno(pozajmica);
  }

  procenat(pozajmica: Pozajmica): number {
    return procenatVracenog(pozajmica) / 100;
  }

  private ucitajPodatke(): void {
    this.ucitavanje = true;
    this.pozajmicaService.ucitajPozajmice().subscribe({
      next: () => (this.ucitavanje = false),
      error: async (greska: Error) => {
        this.ucitavanje = false;
        await this.prikaziGresku(greska.message);
      }
    });
  }

  private obrisi(id: string): void {
    this.pozajmicaService.obrisiPozajmicu(id).subscribe({
      error: async (greska: Error) => this.prikaziGresku(greska.message)
    });
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