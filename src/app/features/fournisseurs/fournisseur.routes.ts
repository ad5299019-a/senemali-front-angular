import { Routes } from '@angular/router';

export const FOURNISSEUR_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./fournisseur-list.component').then((m) => m.FournisseurListComponent) },
];
