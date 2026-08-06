import { Rata, RataDto } from './rata.model';

//u aplikaciji
export interface Pozajmica {
  id: string;
  duznik: string;
  iznos: number;
  datum: string;
  opis?: string;
  zatvorena: boolean;
  rate: Rata[];
}

//u firebase bazi
export interface PozajmicaDto {
  duznik: string;
  iznos: number;
  datum: string;
  opis?: string;
  zatvorena: boolean;
  rate?: { [id: string]: RataDto };
}

export function ukupnoVraceno(pozajmica: Pozajmica): number {
  return pozajmica.rate.reduce((zbir, rata) => zbir + rata.iznos, 0);
}

export function preostaliDug(pozajmica: Pozajmica): number {
  return pozajmica.iznos - ukupnoVraceno(pozajmica);
}

export function procenatVracenog(pozajmica: Pozajmica): number {
  if (pozajmica.iznos === 0) {
    return 0;
  }
  return (ukupnoVraceno(pozajmica) / pozajmica.iznos) * 100;
}