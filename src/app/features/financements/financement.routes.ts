import { Routes } from '@angular/router';

export const FINANCEMENT_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./financement-list.component').then((m) => m.FinancementListComponent) },
  { path: 'nouveau', loadComponent: () => import('./financement-form.component').then((m) => m.FinancementFormComponent) },
  { path: ':id/modifier', loadComponent: () => import('./financement-form.component').then((m) => m.FinancementFormComponent) },
];
