import { StatutValidationFournisseur } from './enums';

export interface ProduitAgricoleResponse {
  idProduit: number;
  nomProduit: string;
  description?: string | null;
  quantite: number;
  prix: number;
  unite: string;
  disponible: boolean;
  imageUrl?: string | null;
  datePub: string;
  idAgriculteur: number;
  nomAgriculteur?: string;
}
export interface ProduitAgricoleRequest {
  nomProduit: string;
  description?: string | null;
  quantite: number;
  prix: number;
  unite: string;
  disponible: boolean;
  imageUrl?: string | null;
  idAgriculteur: number;
}

export interface IntrantResponse {
  idIntrant: number;
  nomIntrant: string;
  typeIntrant: string;
  description?: string | null;
  quantite?: number | null;
  prix: number;
  disponible: boolean;
  statutIntrant: StatutValidationFournisseur;
  imageUrl?: string | null;
  idFournisseur: number;
  nomFournisseur?: string;
}
export interface IntrantRequest {
  nomIntrant: string;
  typeIntrant: string;
  description?: string | null;
  prix: number;
  disponible: boolean;
  imageUrl?: string | null;
  idFournisseur: number;
}
