import { Routes } from '@angular/router';

export const ACHETEUR_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./acheteur-list.component').then((m) => m.AcheteurListComponent) },
];
