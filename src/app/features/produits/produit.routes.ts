import { Routes } from '@angular/router';

export const PRODUIT_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./produit-list.component').then((m) => m.ProduitListComponent) },
];
