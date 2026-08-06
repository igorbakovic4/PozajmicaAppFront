//podaci o prijavljenom korisniku
export interface Korisnik {
  id: string;
  email: string;
  token: string;
  istekTokena: Date;
}

//odgovor koji vraca firebase auth
export interface AuthOdgovor {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}