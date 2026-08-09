import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  meniStavke = [
    { naslov: 'Pozajmice', url: '/pozajmice', ikonica: 'wallet-outline' },
    { naslov: 'Statistika', url: '/statistika', ikonica: 'stats-chart-outline' }
  ];

  prijavljen = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.automatskaPrijava();
    this.authService.prijavljen$.subscribe(stanje => {
      this.prijavljen = stanje;
    });
  }

  odjaviSe(): void {
    this.authService.odjava();
    this.router.navigateByUrl('/auth', { replaceUrl: true });
  }
}