import { Routes } from '@angular/router';

export const PRESTATAIRE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./prestataire-list.component').then((m) => m.PrestataireListComponent) },
  { path: 'nouveau', loadComponent: () => import('./prestataire-form.component').then((m) => m.PrestataireFormComponent) },
  { path: ':id/modifier', loadComponent: () => import('./prestataire-form.component').then((m) => m.PrestataireFormComponent) },
];
