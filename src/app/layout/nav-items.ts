import { RoleEnum } from '../core/models/enums';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: RoleEnum[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Tableau de bord', path: '/dashboard', icon: 'dashboard', roles: [RoleEnum.ADMIN, RoleEnum.FOURNISSEUR] },

  // --- Espace Fournisseur ---
  { label: 'Mon profil', path: '/mon-profil', icon: 'person', roles: [RoleEnum.FOURNISSEUR] },
  { label: 'Mes intrants', path: '/mes-intrants', icon: 'compost', roles: [RoleEnum.FOURNISSEUR] },
  { label: 'Mes notifications', path: '/mes-notifications', icon: 'notifications', roles: [RoleEnum.FOURNISSEUR] },

  // --- Utilisateurs (Admin) ---
  { label: 'Utilisateurs', path: '/utilisateurs', icon: 'groups', roles: [RoleEnum.ADMIN] },
  { label: 'Validations', path: '/validations', icon: 'verified', roles: [RoleEnum.ADMIN] },

  // --- Marché (Admin) ---
  { label: 'Produits', path: '/produits', icon: 'inventory_2', roles: [RoleEnum.ADMIN] },
  { label: 'Intrants', path: '/intrants', icon: 'compost', roles: [RoleEnum.ADMIN] },
  { label: 'Commandes', path: '/commandes', icon: 'package_2', roles: [RoleEnum.ADMIN] },

  // --- Catalogue (Admin) ---
  { label: 'Catégories de cultures', path: '/categories-cultures', icon: 'category', roles: [RoleEnum.ADMIN] },
  { label: 'Cultures', path: '/cultures', icon: 'psychiatry', roles: [RoleEnum.ADMIN] },

  // --- Contenu éditorial (Admin) ---
  { label: 'Conseils', path: '/conseils', icon: 'lightbulb', roles: [RoleEnum.ADMIN] },
  { label: 'Tutoriels', path: '/tutoriels', icon: 'smart_display', roles: [RoleEnum.ADMIN] },
  { label: 'Prix du marché', path: '/prix-marche', icon: 'monitoring', roles: [RoleEnum.ADMIN] },

  // --- Finance & services (Admin) ---
  { label: 'Partenaires financiers', path: '/partenaires', icon: 'account_balance', roles: [RoleEnum.ADMIN] },
  { label: 'Financements', path: '/financements', icon: 'payments', roles: [RoleEnum.ADMIN] },
  { label: 'Prestataires', path: '/prestataires', icon: 'support_agent', roles: [RoleEnum.ADMIN] },
  { label: 'Services agricoles', path: '/services-agricoles', icon: 'handyman', roles: [RoleEnum.ADMIN] },

  // --- Communication (Admin) ---
  { label: 'Notifications', path: '/notifications', icon: 'notifications', roles: [RoleEnum.ADMIN] },
];
