import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import {
  Pozajmica,
  PozajmicaDto,
  preostaliDug
} from '../models/pozajmica.model';
import { Rata, RataDto } from '../models/rata.model';

@Injectable({ providedIn: 'root' })
export class PozajmicaService {
  private pozajmiceSubject = new BehaviorSubject<Pozajmica[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) {}

  get pozajmice$(): Observable<Pozajmica[]> {
    return this.pozajmiceSubject.asObservable();
  }

  // ---------- ČITANJE ----------

  ucitajPozajmice(): Observable<Pozajmica[]> {
    return this.saTokenom(({ token, korisnikId }) =>
      this.http
        .get<{ [id: string]: PozajmicaDto } | null>(
          `${environment.firebaseDatabaseUrl}/pozajmice/${korisnikId}.json?auth=${token}`
        )
        .pipe(
          map(odgovor => this.mapirajPozajmice(odgovor)),
          tap(pozajmice => this.pozajmiceSubject.next(pozajmice))
        )
    );
  }

  dohvatiPozajmicu(id: string): Observable<Pozajmica> {
    return this.saTokenom(({ token, korisnikId }) =>
      this.http
        .get<PozajmicaDto | null>(
          `${environment.firebaseDatabaseUrl}/pozajmice/${korisnikId}/${id}.json?auth=${token}`
        )
        .pipe(
          map(dto => {
            if (!dto) {
              throw new Error('Pozajmica nije pronađena.');
            }
            return this.mapirajPozajmicu(id, dto);
          })
        )
    );
  }

  // ---------- POZAJMICE ----------

  dodajPozajmicu(
    duznik: string,
    iznos: number,
    datum: string,
    opis?: string
  ): Observable<Pozajmica> {
    const dto: PozajmicaDto = {
      duznik,
      iznos,
      datum,
      opis: opis ?? '',
      zatvorena: false
    };

    return this.saTokenom(({ token, korisnikId }) =>
      this.http
        .post<{ name: string }>(
          `${environment.firebaseDatabaseUrl}/pozajmice/${korisnikId}.json?auth=${token}`,
          dto
        )
        .pipe(
          map(odgovor => ({ ...dto, id: odgovor.name, rate: [] } as Pozajmica)),
          tap(nova => {
            const trenutne = this.pozajmiceSubject.value;
            this.pozajmiceSubject.next([...trenutne, nova]);
          })
        )
    );
  }

  izmeniPozajmicu(
    id: string,
    izmene: Partial<Omit<PozajmicaDto, 'rate'>>
  ): Observable<void> {
    return this.saTokenom(({ token, korisnikId }) =>
      this.http
        .patch<unknown>(
          `${environment.firebaseDatabaseUrl}/pozajmice/${korisnikId}/${id}.json?auth=${token}`,
          izmene
        )
        .pipe(
          map(() => undefined),
          tap(() => this.azurirajLokalno(id, izmene))
        )
    );
  }

  obrisiPozajmicu(id: string): Observable<void> {
    return this.saTokenom(({ token, korisnikId }) =>
      this.http
        .delete<unknown>(
          `${environment.firebaseDatabaseUrl}/pozajmice/${korisnikId}/${id}.json?auth=${token}`
        )
        .pipe(
          map(() => undefined),
          tap(() => {
            const preostale = this.pozajmiceSubject.value.filter(p => p.id !== id);
            this.pozajmiceSubject.next(preostale);
          })
        )
    );
  }

  // ---------- RATE ----------

  dodajRatu(
    pozajmicaId: string,
    iznos: number,
    datum: string,
    napomena?: string
  ): Observable<Rata> {
    const pozajmica = this.pronadjiLokalno(pozajmicaId);
    if (!pozajmica) {
      return throwError(() => new Error('Pozajmica nije pronađena.'));
    }

    const ostatak = preostaliDug(pozajmica);
    if (iznos > ostatak) {
      return throwError(
        () => new Error(`Rata ne može biti veća od preostalog duga (${ostatak} RSD).`)
      );
    }

    const dto: RataDto = { iznos, datum, napomena: napomena ?? '' };

    return this.saTokenom(({ token, korisnikId }) =>
      this.http
        .post<{ name: string }>(
          `${environment.firebaseDatabaseUrl}/pozajmice/${korisnikId}/${pozajmicaId}/rate.json?auth=${token}`,
          dto
        )
        .pipe(
          map(odgovor => ({ ...dto, id: odgovor.name } as Rata)),
          tap(nova => this.dodajRatuLokalno(pozajmicaId, nova)),
          switchMap(nova => this.proveriZatvaranje(pozajmicaId).pipe(map(() => nova)))
        )
    );
  }

  obrisiRatu(pozajmicaId: string, rataId: string): Observable<void> {
    return this.saTokenom(({ token, korisnikId }) =>
      this.http
        .delete<unknown>(
          `${environment.firebaseDatabaseUrl}/pozajmice/${korisnikId}/${pozajmicaId}/rate/${rataId}.json?auth=${token}`
        )
        .pipe(
          map(() => undefined),
          tap(() => this.obrisiRatuLokalno(pozajmicaId, rataId)),
          switchMap(() => this.proveriZatvaranje(pozajmicaId))
        )
    );
  }

  // ---------- POMOĆNE METODE ----------

  private proveriZatvaranje(pozajmicaId: string): Observable<void> {
    const pozajmica = this.pronadjiLokalno(pozajmicaId);
    if (!pozajmica) {
      return of(undefined);
    }

    const trebaDaBudeZatvorena = preostaliDug(pozajmica) <= 0;
    if (trebaDaBudeZatvorena === pozajmica.zatvorena) {
      return of(undefined);
    }

    return this.izmeniPozajmicu(pozajmicaId, { zatvorena: trebaDaBudeZatvorena });
  }

  private saTokenom<T>(
    poziv: (podaci: { token: string; korisnikId: string }) => Observable<T>
  ): Observable<T> {
    return this.authService.korisnik$.pipe(
      take(1),
      switchMap(korisnik => {
        if (!korisnik || korisnik.istekTokena <= new Date()) {
          return throwError(() => new Error('Niste prijavljeni.'));
        }
        return poziv({ token: korisnik.token, korisnikId: korisnik.id });
      })
    );
  }

  private mapirajPozajmice(
    odgovor: { [id: string]: PozajmicaDto } | null
  ): Pozajmica[] {
    if (!odgovor) {
      return [];
    }
    return Object.keys(odgovor).map(id => this.mapirajPozajmicu(id, odgovor[id]));
  }

  private mapirajPozajmicu(id: string, dto: PozajmicaDto): Pozajmica {
    const rate: Rata[] = dto.rate
      ? Object.keys(dto.rate).map(rataId => ({ id: rataId, ...dto.rate![rataId] }))
      : [];

    return {
      id,
      duznik: dto.duznik,
      iznos: dto.iznos,
      datum: dto.datum,
      opis: dto.opis,
      zatvorena: dto.zatvorena,
      rate
    };
  }

  private pronadjiLokalno(id: string): Pozajmica | undefined {
    return this.pozajmiceSubject.value.find(p => p.id === id);
  }

  private azurirajLokalno(id: string, izmene: Partial<PozajmicaDto>): void {
    const azurirane = this.pozajmiceSubject.value.map(p =>
      p.id === id ? { ...p, ...izmene } : p
    );
    this.pozajmiceSubject.next(azurirane);
  }

  private dodajRatuLokalno(pozajmicaId: string, rata: Rata): void {
    const azurirane = this.pozajmiceSubject.value.map(p =>
      p.id === pozajmicaId ? { ...p, rate: [...p.rate, rata] } : p
    );
    this.pozajmiceSubject.next(azurirane);
  }

  private obrisiRatuLokalno(pozajmicaId: string, rataId: string): void {
    const azurirane = this.pozajmiceSubject.value.map(p =>
      p.id === pozajmicaId ? { ...p, rate: p.rate.filter(r => r.id !== rataId) } : p
    );
    this.pozajmiceSubject.next(azurirane);
  }
}