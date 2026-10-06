import { Routes } from '@angular/router';

export const PRIX_MARCHE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./prix-marche-list.component').then((m) => m.PrixMarcheListComponent) },
  { path: 'nouveau', loadComponent: () => import('./prix-marche-form.component').then((m) => m.PrixMarcheFormComponent) },
  { path: ':id/modifier', loadComponent: () => import('./prix-marche-form.component').then((m) => m.PrixMarcheFormComponent) },
];
