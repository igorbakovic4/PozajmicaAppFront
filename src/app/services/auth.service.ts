import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Korisnik, AuthOdgovor } from '../models/korisnik.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private korisnikSubject = new BehaviorSubject<Korisnik | null>(null);
  private tajmerOdjave: any = null;

  constructor(private http: HttpClient) {}

  get korisnik$(): Observable<Korisnik | null> {
    return this.korisnikSubject.asObservable();
  }

  get prijavljen$(): Observable<boolean> {
    return this.korisnikSubject.pipe(map(korisnik => !!korisnik));
  }

  get token(): string | null {
    const korisnik = this.korisnikSubject.value;
    if (!korisnik || korisnik.istekTokena <= new Date()) {
      return null;
    }
    return korisnik.token;
  }

  get korisnikId(): string | null {
    return this.korisnikSubject.value?.id ?? null;
  }

  registracija(email: string, lozinka: string): Observable<AuthOdgovor> {
    const url = `${environment.firebaseAuthUrl}:signUp?key=${environment.firebaseApiKey}`;
    return this.http
      .post<AuthOdgovor>(url, {
        email,
        password: lozinka,
        returnSecureToken: true
      })
      .pipe(
        tap(odgovor => this.obradiAutentifikaciju(odgovor)),
        catchError(greska => this.obradiGresku(greska))
      );
  }

  prijava(email: string, lozinka: string): Observable<AuthOdgovor> {
    const url = `${environment.firebaseAuthUrl}:signInWithPassword?key=${environment.firebaseApiKey}`;
    return this.http
      .post<AuthOdgovor>(url, {
        email,
        password: lozinka,
        returnSecureToken: true
      })
      .pipe(
        tap(odgovor => this.obradiAutentifikaciju(odgovor)),
        catchError(greska => this.obradiGresku(greska))
      );
  }

  odjava(): void {
    this.korisnikSubject.next(null);
    localStorage.removeItem('korisnikPodaci');
    if (this.tajmerOdjave) {
      clearTimeout(this.tajmerOdjave);
      this.tajmerOdjave = null;
    }
  }

  automatskaPrijava(): boolean {
    const sacuvano = localStorage.getItem('korisnikPodaci');
    if (!sacuvano) {
      return false;
    }

    const podaci: {
      id: string;
      email: string;
      token: string;
      istekTokena: string;
    } = JSON.parse(sacuvano);

    const istek = new Date(podaci.istekTokena);
    if (istek <= new Date()) {
      localStorage.removeItem('korisnikPodaci');
      return false;
    }

    const korisnik: Korisnik = {
      id: podaci.id,
      email: podaci.email,
      token: podaci.token,
      istekTokena: istek
    };

    this.korisnikSubject.next(korisnik);
    this.pokreniTajmerOdjave(istek.getTime() - new Date().getTime());
    return true;
  }

  private obradiAutentifikaciju(odgovor: AuthOdgovor): void {
    const trajanje = +odgovor.expiresIn * 1000;
    const istekTokena = new Date(new Date().getTime() + trajanje);

    const korisnik: Korisnik = {
      id: odgovor.localId,
      email: odgovor.email,
      token: odgovor.idToken,
      istekTokena
    };

    this.korisnikSubject.next(korisnik);
    localStorage.setItem('korisnikPodaci', JSON.stringify(korisnik));
    this.pokreniTajmerOdjave(trajanje);
  }

  private pokreniTajmerOdjave(trajanje: number): void {
    if (this.tajmerOdjave) {
      clearTimeout(this.tajmerOdjave);
    }
    this.tajmerOdjave = setTimeout(() => this.odjava(), trajanje);
  }

  private obradiGresku(greska: HttpErrorResponse): Observable<never> {
    let poruka = 'Došlo je do greške. Pokušajte ponovo.';

    const kod = greska.error?.error?.message;
    switch (kod) {
      case 'EMAIL_EXISTS':
        poruka = 'Nalog sa ovom email adresom već postoji.';
        break;
      case 'INVALID_EMAIL':
        poruka = 'Email adresa nije ispravna.';
        break;
      case 'WEAK_PASSWORD : Password should be at least 6 characters':
        poruka = 'Lozinka mora imati najmanje 6 karaktera.';
        break;
      case 'EMAIL_NOT_FOUND':
      case 'INVALID_PASSWORD':
      case 'INVALID_LOGIN_CREDENTIALS':
        poruka = 'Pogrešan email ili lozinka.';
        break;
      case 'USER_DISABLED':
        poruka = 'Ovaj nalog je onemogućen.';
        break;
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        poruka = 'Previše pokušaja. Pokušajte kasnije.';
        break;
    }

    return throwError(() => new Error(poruka));
  }
}