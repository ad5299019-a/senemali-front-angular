import { Routes } from '@angular/router';

export const UTILISATEUR_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./utilisateur-list.component').then((m) => m.UtilisateurListComponent) },
];
