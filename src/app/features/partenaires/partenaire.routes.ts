import { Routes } from '@angular/router';

export const PARTENAIRE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./partenaire-list.component').then((m) => m.PartenaireListComponent) },
  { path: 'nouveau', loadComponent: () => import('./partenaire-form.component').then((m) => m.PartenaireFormComponent) },
  { path: ':id/modifier', loadComponent: () => import('./partenaire-form.component').then((m) => m.PartenaireFormComponent) },
];
