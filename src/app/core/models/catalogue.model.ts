/** Catégories & cultures */
export interface CategorieCultureResponse {
  idCategorie: number;
  nomCategorie: string;
  description?: string | null;
  cultures?: CultureResponse[];
}
export interface CategorieCultureRequest {
  nomCategorie: string;
  description?: string | null;
}

export interface CultureResponse {
  idCulture: number;
  nomCulture: string;
  description?: string | null;
  imageUrl?: string | null;
  idCategorie: number;
  nomCategorie?: string;
}
export interface CultureRequest {
  nomCulture: string;
  description?: string | null;
  imageUrl?: string | null;
  idCategorie: number;
}

export interface CultureAgriculteurResponse {
  idCultureAgriculteur: number;
  idAgriculteur: number;
  nomAgriculteur?: string;
  idCulture: number;
  nomCulture?: string;
}
export interface CultureAgriculteurRequest {
  idAgriculteur: number;
  idCulture: number;
}
