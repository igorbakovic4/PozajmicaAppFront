//u aplikaciji
export interface Rata {
  id: string;
  iznos: number;
  datum: string;      // ISO format: "2026-08-15"
  napomena?: string;
}

//u firebase bazi
export interface RataDto {
  iznos: number;
  datum: string;
  napomena?: string;
}