export enum RoleEnum {
  ADMIN = 'ADMIN',
  AGRICULTEUR = 'AGRICULTEUR',
  ACHETEUR = 'ACHETEUR',
  FOURNISSEUR = 'FOURNISSEUR',
}

export enum StatutCommandeEnum {
  EN_COURS = 'EN_COURS',
  LIVREE = 'LIVREE',
  ANNULER = 'ANNULER',
}

export enum StatutValidationFournisseur {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  REFUSE = 'REFUSE',
}

export enum TypeNotificationEnum {
  PRIX_MARCHE = 'PRIX_MARCHE',
  CONSEIL = 'CONSEIL',
  TUTORIEL = 'TUTORIEL',
  COMMANDE = 'COMMANDE',
  SERVICE = 'SERVICE',
  FINANCEMENT = 'FINANCEMENT',
  INFORMATION = 'INFORMATION',
}

export enum TypePartenaireEnum {
  BANQUE = 'BANQUE',
  MICROFINANCE = 'MICROFINANCE',
  ONG = 'ONG',
  ORGANISME_PUBLIC = 'ORGANISME_PUBLIC',
  INVESTISSEUR = 'INVESTISSEUR',
  PARTICULIER = 'PARTICULIER',
  AUTRE = 'AUTRE',
}

export enum TypePrestataireEnum {
  CONSEILLER_AGRICOLE = 'CONSEILLER_AGRICOLE',
  TECHNICIEN_AGRICOLE = 'TECHNICIEN_AGRICOLE',
}

/** Libellés FR pour affichage dans les badges/select — un seul endroit à maintenir. */
export const STATUT_COMMANDE_LABELS: Record<StatutCommandeEnum, string> = {
  [StatutCommandeEnum.EN_COURS]: 'En cours',
  [StatutCommandeEnum.LIVREE]: 'Livrée',
  [StatutCommandeEnum.ANNULER]: 'Annulée',
};

export const STATUT_VALIDATION_LABELS: Record<StatutValidationFournisseur, string> = {
  [StatutValidationFournisseur.EN_ATTENTE]: 'En attente',
  [StatutValidationFournisseur.VALIDE]: 'Validé',
  [StatutValidationFournisseur.REFUSE]: 'Refusé',
};

export const TYPE_NOTIFICATION_LABELS: Record<TypeNotificationEnum, string> = {
  [TypeNotificationEnum.PRIX_MARCHE]: 'Prix marché',
  [TypeNotificationEnum.CONSEIL]: 'Conseil',
  [TypeNotificationEnum.TUTORIEL]: 'Tutoriel',
  [TypeNotificationEnum.COMMANDE]: 'Commande',
  [TypeNotificationEnum.SERVICE]: 'Service',
  [TypeNotificationEnum.FINANCEMENT]: 'Financement',
  [TypeNotificationEnum.INFORMATION]: 'Information',
};

export const TYPE_PARTENAIRE_LABELS: Record<TypePartenaireEnum, string> = {
  [TypePartenaireEnum.BANQUE]: 'Banque',
  [TypePartenaireEnum.MICROFINANCE]: 'Microfinance',
  [TypePartenaireEnum.ONG]: 'ONG',
  [TypePartenaireEnum.ORGANISME_PUBLIC]: 'Organisme public',
  [TypePartenaireEnum.INVESTISSEUR]: 'Investisseur',
  [TypePartenaireEnum.PARTICULIER]: 'Particulier',
  [TypePartenaireEnum.AUTRE]: 'Autre',
};

export const TYPE_PRESTATAIRE_LABELS: Record<TypePrestataireEnum, string> = {
  [TypePrestataireEnum.CONSEILLER_AGRICOLE]: 'Conseiller agricole',
  [TypePrestataireEnum.TECHNICIEN_AGRICOLE]: 'Technicien agricole',
};
