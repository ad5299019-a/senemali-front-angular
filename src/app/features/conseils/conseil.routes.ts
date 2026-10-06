import { Routes } from '@angular/router';

export const CONSEIL_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./conseil-list.component').then((m) => m.ConseilListComponent) },
  { path: 'nouveau', loadComponent: () => import('./conseil-form.component').then((m) => m.ConseilFormComponent) },
  { path: ':id/modifier', loadComponent: () => import('./conseil-form.component').then((m) => m.ConseilFormComponent) },
];
