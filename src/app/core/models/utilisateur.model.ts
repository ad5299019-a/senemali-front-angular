import { RoleEnum } from './enums';

export interface UtilisateurResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  localisation: string;
  photoProfil?: string | null;
  role: RoleEnum;
  statut: boolean;
  dateCreation: string;
}

export interface UtilisateurRequest {
  nom: string;
  prenom: string;
  telephone: string;
  localisation: string;
  photoProfil?: string | null;
}

export interface AgriculteurResponse extends UtilisateurResponse {
  idAgriculteur: number;
  description?: string | null;
  cultures?: string[];
}
export interface AgriculteurRequest {
  nom: string;
  prenom: string;
  telephone: string;
  localisation: string;
  photoProfil?: string | null;
  description?: string | null;
}

export interface AcheteurResponse extends UtilisateurResponse {
  idAcheteur: number;
}
export interface AcheteurRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  localisation: string;
  photoProfil?: string | null;
}

export interface AdministrateurResponse extends UtilisateurResponse {
  idAdministrateur: number;
}

import { StatutValidationFournisseur } from './enums';
export interface FournisseurResponse extends UtilisateurResponse {
  idFournisseur: number;
  description?: string | null;
  nomEntreprise?: string | null;
  zoneDeVente?: string | null;
  statutFournisseur: StatutValidationFournisseur;
}
export interface FournisseurRequest {
  nom: string;
  prenom: string;
  telephone: string;
  localisation: string;
  photoProfil?: string | null;
  description?: string | null;
  nomEntreprise?: string | null;
  zoneDeVente?: string | null;
}
