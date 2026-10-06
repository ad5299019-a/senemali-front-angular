import { Routes } from '@angular/router';

export const AGRICULTEUR_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./agriculteur-list.component').then((m) => m.AgriculteurListComponent) },
];
