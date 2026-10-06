import { RoleEnum } from './enums';

export interface AuthRequest {
  identifiant: string;
  motDePasse: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  nom: string;
  prenom: string;
  identifiant?: string;
  email?: string;
  role: RoleEnum;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  localisation: string;
  motDePasse: string;
  role: RoleEnum;
  photoProfil?: string | null;
  descriptionAgriculteur?: string | null;
  descriptionFournisseur?: string | null;
  nomEntreprise?: string | null;
  zoneDeVente?: string | null;
}
