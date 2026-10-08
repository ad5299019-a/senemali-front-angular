import { Routes } from '@angular/router';

export const MON_PROFIL_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./mon-profil.component').then((m) => m.MonProfilComponent) },
  { path: 'modifier', loadComponent: () => import('./mon-profil.component').then((m) => m.MonProfilComponent) },
];
