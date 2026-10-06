import { Routes } from '@angular/router';

export const CATEGORIE_CULTURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./categorie-culture-list.component').then((m) => m.CategorieCultureListComponent),
  },
  {
    path: 'nouveau',
    loadComponent: () =>
      import('./categorie-culture-form.component').then((m) => m.CategorieCultureFormComponent),
  },
  {
    path: ':id/modifier',
    loadComponent: () =>
      import('./categorie-culture-form.component').then((m) => m.CategorieCultureFormComponent),
  },
];
