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
  urlImage: string;
  urlVideo: string;
  idCategorie: number;
  nomCategorie?: string;
  idAdministrateur: number;
}
export interface TutorielRequest {
  titreTutoriel: string;
  descriptionTutoriel: string;
  urlImage: string;
  urlVideo: string;
  idCategorie: number;
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
