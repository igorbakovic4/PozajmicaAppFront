import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { PozajmicaService } from '../../services/pozajmica.service';
import {
  Pozajmica,
  preostaliDug,
  ukupnoVraceno
} from '../../models/pozajmica.model';

interface StavkaDuznika {
  duznik: string;
  ukupno: number;
  vraceno: number;
  preostalo: number;
  brojPozajmica: number;
}

@Component({
  selector: 'app-statistika',
  templateUrl: './statistika.page.html',
  styleUrls: ['./statistika.page.scss'],
  standalone: false
})
export class StatistikaPage implements OnInit, OnDestroy {
  pozajmice: Pozajmica[] = [];
  ucitavanje = true;

  private pretplata?: Subscription;

  constructor(
    private pozajmicaService: PozajmicaService,
    private router: Router,
    private alertController: AlertController
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

  // ---------- UKUPNI IZNOSI ----------

  get ukupnoPozajmljeno(): number {
    return this.pozajmice.reduce((zbir, p) => zbir + p.iznos, 0);
  }

  get ukupnoVraceno(): number {
    return this.pozajmice.reduce((zbir, p) => zbir + ukupnoVraceno(p), 0);
  }

  get ukupnoPreostalo(): number {
    return this.pozajmice.reduce((zbir, p) => zbir + preostaliDug(p), 0);
  }

  get procenatNaplacenog(): number {
    if (this.ukupnoPozajmljeno === 0) {
      return 0;
    }
    return this.ukupnoVraceno / this.ukupnoPozajmljeno;
  }

  get procenatTekst(): number {
    return Math.round(this.procenatNaplacenog * 100);
  }

  // ---------- BROJAČI ----------

  get brojUkupno(): number {
    return this.pozajmice.length;
  }

  get brojAktivnih(): number {
    return this.pozajmice.filter(p => !p.zatvorena).length;
  }

  get brojIzmirenih(): number {
    return this.pozajmice.filter(p => p.zatvorena).length;
  }

  get brojUplata(): number {
    return this.pozajmice.reduce((zbir, p) => zbir + p.rate.length, 0);
  }

  get prosecnaPozajmica(): number {
    if (this.brojUkupno === 0) {
      return 0;
    }
    return this.ukupnoPozajmljeno / this.brojUkupno;
  }

  // ---------- PO DUŽNICIMA ----------

  get poDuznicima(): StavkaDuznika[] {
    const mapa = new Map<string, StavkaDuznika>();

    for (const p of this.pozajmice) {
      const kljuc = p.duznik.trim().toLowerCase();
      const postojeca = mapa.get(kljuc);

      if (postojeca) {
        postojeca.ukupno += p.iznos;
        postojeca.vraceno += ukupnoVraceno(p);
        postojeca.preostalo += preostaliDug(p);
        postojeca.brojPozajmica += 1;
      } else {
        mapa.set(kljuc, {
          duznik: p.duznik,
          ukupno: p.iznos,
          vraceno: ukupnoVraceno(p),
          preostalo: preostaliDug(p),
          brojPozajmica: 1
        });
      }
    }

    return Array.from(mapa.values()).sort((a, b) => b.preostalo - a.preostalo);
  }

  get najveciDuznik(): StavkaDuznika | null {
    const lista = this.poDuznicima.filter(s => s.preostalo > 0);
    return lista.length > 0 ? lista[0] : null;
  }

  udeo(stavka: StavkaDuznika): number {
    if (stavka.ukupno === 0) {
      return 0;
    }
    return stavka.vraceno / stavka.ukupno;
  }

  private ucitajPodatke(): void {
    this.ucitavanje = true;
    this.pozajmicaService.ucitajPozajmice().subscribe({
      next: () => (this.ucitavanje = false),
      error: async (greska: Error) => {
        this.ucitavanje = false;
        if (greska.message === 'Niste prijavljeni.') {
          this.router.navigateByUrl('/auth', { replaceUrl: true });
          return;
        }
        await this.prikaziGresku(greska.message);
      }
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