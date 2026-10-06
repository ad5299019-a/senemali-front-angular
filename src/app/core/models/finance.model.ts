import { TypePartenaireEnum } from './enums';

export interface PartenaireFinancierResponse {
  idPartenaire: number;
  nomPartenaire: string;
  typepartenaire: TypePartenaireEnum;
  description?: string | null;
  localisation?: string | null;
  telephone?: string | null;
  imageUrl?: string | null;
  financements?: FinancementResponse[];
}
export interface PartenaireFinancierRequest {
  nomPartenaire: string;
  typepartenaire: TypePartenaireEnum;
  description?: string | null;
  localisation?: string | null;
  telephone?: string | null;
  imageUrl?: string | null;
}

export interface FinancementResponse {
  idFinancement: number;
  typeFinancement: string;
  conditionPrincipales?: string | null;
  montantMin: number;
  montantMax: number;
  disponible: boolean;
  idPartenaire: number;
  nomPartenaire?: string;
  idAdministrateur: number;
}
export interface FinancementRequest {
  typeFinancement: string;
  conditionPrincipales?: string | null;
  montantMin: number;
  montantMax: number;
  disponible: boolean;
  idPartenaire: number;
}
