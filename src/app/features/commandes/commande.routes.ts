import { Routes } from '@angular/router';

export const COMMANDE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./commande-list.component').then((m) => m.CommandeListComponent) },
  { path: ':id', loadComponent: () => import('./commande-detail.component').then((m) => m.CommandeDetailComponent) },
];
