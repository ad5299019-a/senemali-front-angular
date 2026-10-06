import { Routes } from '@angular/router';

export const INTRANT_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./intrant-list.component').then((m) => m.IntrantListComponent) },
];

export const MES_INTRANTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./mes-intrants-list.component').then((m) => m.MesIntrantsListComponent) },
  { path: 'nouveau', loadComponent: () => import('./intrant-form.component').then((m) => m.IntrantFormComponent) },
  { path: ':id/modifier', loadComponent: () => import('./intrant-form.component').then((m) => m.IntrantFormComponent) },
];
