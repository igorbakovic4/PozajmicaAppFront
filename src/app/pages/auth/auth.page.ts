import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: false
})
export class AuthPage {
  ucitavanje = false;
  rezimPrijave = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  promeniRezim(): void {
    this.rezimPrijave = !this.rezimPrijave;
  }

  async posaljiFormu(forma: NgForm): Promise<void> {
    if (!forma.valid) {
      return;
    }

    const email = forma.value.email;
    const lozinka = forma.value.lozinka;

    this.ucitavanje = true;
    const ucitavac = await this.loadingController.create({
      message: this.rezimPrijave ? 'Prijavljivanje...' : 'Registracija...'
    });
    await ucitavac.present();

    const zahtev = this.rezimPrijave
      ? this.authService.prijava(email, lozinka)
      : this.authService.registracija(email, lozinka);

    zahtev.subscribe({
      next: async () => {
        this.ucitavanje = false;
        await ucitavac.dismiss();
        forma.reset();
        this.router.navigateByUrl('/pozajmice', { replaceUrl: true });
      },
      error: async (greska: Error) => {
        this.ucitavanje = false;
        await ucitavac.dismiss();
        await this.prikaziGresku(greska.message);
      }
    });
  }

  private async prikaziGresku(poruka: string): Promise<void> {
    const upozorenje = await this.alertController.create({
      header: 'Neuspešno',
      message: poruka,
      buttons: ['U redu']
    });
    await upozorenje.present();
  }
}