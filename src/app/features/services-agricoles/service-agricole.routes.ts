import { Routes } from '@angular/router';

export const SERVICE_AGRICOLE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./service-agricole-list.component').then((m) => m.ServiceAgricoleListComponent) },
  { path: 'nouveau', loadComponent: () => import('./service-agricole-form.component').then((m) => m.ServiceAgricoleFormComponent) },
  { path: ':id/modifier', loadComponent: () => import('./service-agricole-form.component').then((m) => m.ServiceAgricoleFormComponent) },
];
