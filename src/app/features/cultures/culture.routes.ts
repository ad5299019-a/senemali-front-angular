import { Routes } from '@angular/router';

export const CULTURE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./culture-list.component').then((m) => m.CultureListComponent) },
  { path: 'nouveau', loadComponent: () => import('./culture-form.component').then((m) => m.CultureFormComponent) },
  { path: ':id/modifier', loadComponent: () => import('./culture-form.component').then((m) => m.CultureFormComponent) },
];
