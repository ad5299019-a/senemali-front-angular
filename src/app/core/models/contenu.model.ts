/** Conseils, tutoriels, prix marché — contenu éditorial publié par l'admin */
export interface ConseilResponse {
  idConseil: number;
  titreConseil: string;
  contenu: string;
  datePub: string;
  idCulture: number;
  nomCulture?: string;
  idAdministrateur: number;
}
export interface ConseilRequest {
  titreConseil: string;
  contenu: string;
  idCulture: number;
}

export interface TutorielResponse {
  idTutoriel: number;
  titreTutoriel: string;
  descriptionTutoriel: string;
  urlImage?: string | null;
  urlVideo?: string | null;
  idCategorie?: number | null;
  nomCategorie?: string | null;
  idAdministrateur?: number | null;
}
export interface TutorielRequest {
  titreTutoriel: string;
  descriptionTutoriel: string;
  urlImage?: string | null;
  urlVideo?: string | null;
  idCategorie?: number | null;
}

export interface PrixMarcheResponse {
  idPrix: number;
  nomProduit: string;
  prixProduit: number;
  unite: string;
  localisation: string;
  dateObserv: string;
  idAdministrateur: number;
}
export interface PrixMarcheRequest {
  nomProduit: string;
  prixProduit: number;
  unite: string;
  localisation: string;
}
