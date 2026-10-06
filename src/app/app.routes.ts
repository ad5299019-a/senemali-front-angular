import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { RoleEnum } from './core/models/enums';

export const routes: Routes = [
  // --- Auth (public) ---
  {
    path: 'auth',
    loadComponent: () => import('./layout/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    canActivate: [guestGuard],
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // --- Espace connecté (Admin + Fournisseur) ---
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },

      // --- Espace Fournisseur ---
      {
        path: 'mon-profil',
        canActivate: [roleGuard([RoleEnum.FOURNISSEUR])],
        loadChildren: () => import('./features/mon-profil/mon-profil.routes').then((m) => m.MON_PROFIL_ROUTES),
      },
      {
        path: 'mes-intrants',
        canActivate: [roleGuard([RoleEnum.FOURNISSEUR])],
        loadChildren: () => import('./features/intrants/intrant.routes').then((m) => m.MES_INTRANTS_ROUTES),
      },
      {
        path: 'mes-notifications',
        canActivate: [roleGuard([RoleEnum.FOURNISSEUR])],
        loadChildren: () => import('./features/notifications/notification.routes').then((m) => m.MES_NOTIFICATIONS_ROUTES),
      },

      // --- Utilisateurs (Admin) ---
      {
        path: 'utilisateurs',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadChildren: () => import('./features/utilisateurs/utilisateur.routes').then((m) => m.UTILISATEUR_ROUTES),
      },
      {
        path: 'validations',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadComponent: () => import('./features/validations/validation.component').then((m) => m.ValidationComponent),
      },
      {
        path: 'agriculteurs',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadChildren: () => import('./features/agriculteurs/agriculteur.routes').then((m) => m.AGRICULTEUR_ROUTES),
      },
      {
        path: 'acheteurs',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadChildren: () => import('./features/acheteurs/acheteur.routes').then((m) => m.ACHETEUR_ROUTES),
      },
      {
        path: 'fournisseurs',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadChildren: () => import('./features/fournisseurs/fournisseur.routes').then((m) => m.FOURNISSEUR_ROUTES),
      },

      // --- Marché (Admin) ---
      {
        path: 'produits',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadChildren: () => import('./features/produits/produit.routes').then((m) => m.PRODUIT_ROUTES),
      },
      {
        path: 'intrants',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadChildren: () => import('./features/intrants/intrant.routes').then((m) => m.INTRANT_ROUTES),
      },
      {
        path: 'commandes',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadChildren: () => import('./features/commandes/commande.routes').then((m) => m.COMMANDE_ROUTES),
      },

      // --- Catalogue (Admin) ---
      {
        path: 'categories-cultures',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadChildren: () => import('./features/categories-cultures/categorie-culture.routes').then((m) => m.CATEGORIE_CULTURE_ROUTES),
      },
      {
        path: 'cultures',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadChildren: () => import('./features/cultures/culture.routes').then((m) => m.CULTURE_ROUTES),
      },

      // --- Contenu éditorial (Admin) ---
      {
        path: 'conseils',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadChildren: () => import('./features/conseils/conseil.routes').then((m) => m.CONSEIL_ROUTES),
      },
      {
        path: 'tutoriels',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadChildren: () => import('./features/tutoriels/tutoriel.routes').then((m) => m.TUTORIEL_ROUTES),
      },
      {
        path: 'prix-marche',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadChildren: () => import('./features/prix-marche/prix-marche.routes').then((m) => m.PRIX_MARCHE_ROUTES),
      },

      // --- Finance & services (Admin) ---
      {
        path: 'partenaires',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadChildren: () => import('./features/partenaires/partenaire.routes').then((m) => m.PARTENAIRE_ROUTES),
      },
      {
        path: 'financements',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadChildren: () => import('./features/financements/financement.routes').then((m) => m.FINANCEMENT_ROUTES),
      },
      {
        path: 'prestataires',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadChildren: () => import('./features/prestataires/prestataire.routes').then((m) => m.PRESTATAIRE_ROUTES),
      },
      {
        path: 'services-agricoles',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadChildren: () => import('./features/services-agricoles/service-agricole.routes').then((m) => m.SERVICE_AGRICOLE_ROUTES),
      },

      // --- Communication (Admin) ---
      {
        path: 'notifications',
        canActivate: [roleGuard([RoleEnum.ADMIN])],
        loadChildren: () => import('./features/notifications/notification.routes').then((m) => m.NOTIFICATION_SEND_ROUTES),
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
