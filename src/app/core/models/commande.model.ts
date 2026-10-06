import { StatutCommandeEnum } from './enums';

export interface DetailCommandeResponse {
  idDetail: number;
  quantite: number;
  prixUnitaire: number;
  montant: number;
  idProduit?: number | null;
  nomProduit?: string | null;
  idIntrant?: number | null;
  nomIntrant?: string | null;
}
export interface DetailCommandeRequest {
  idProduit?: number | null;
  idIntrant?: number | null;
  quantite: number;
}

export interface CommandeResponse {
  idCommande: number;
  dateCommande: string;
  status: StatutCommandeEnum;
  montantTotal: number;
  idUtilisateur: number;
  nomUtilisateur?: string;
  details: DetailCommandeResponse[];
}
export interface CommandeRequest {
  idUtilisateur: number;
  details: DetailCommandeRequest[];
}
