import { TypePrestataireEnum } from './enums';

export interface PrestatireResponse {
  idPrestataire: number;
  nomPrestataire: string;
  typePrestataire: TypePrestataireEnum;
  description?: string | null;
  specialite: string;
  telephone: string;
  localisation: string;
  imageUrl?: string | null;
  services?: ServiceAgricoleResponse[];
}
export interface PrestatireRequest {
  nomPrestataire: string;
  typePrestataire: TypePrestataireEnum;
  description?: string | null;
  specialite: string;
  telephone: string;
  localisation: string;
  imageUrl?: string | null;
}

export interface ServiceAgricoleResponse {
  idService: number;
  typeService: string;
  description?: string | null;
  coutEstime: string;
  imageUrl?: string | null;
  disponible: boolean;
  idPrestataire: number;
  nomPrestataire?: string;
}
export interface ServiceAgricoleRequest {
  typeService: string;
  description?: string | null;
  coutEstime: string;
  imageUrl?: string | null;
  disponible: boolean;
  idPrestataire: number;
}
