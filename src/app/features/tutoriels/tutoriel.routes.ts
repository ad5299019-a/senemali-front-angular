import { Routes } from '@angular/router';

export const TUTORIEL_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./tutoriel-list.component').then((m) => m.TutorielListComponent) },
  { path: 'nouveau', loadComponent: () => import('./tutoriel-form.component').then((m) => m.TutorielFormComponent) },
  { path: ':id/modifier', loadComponent: () => import('./tutoriel-form.component').then((m) => m.TutorielFormComponent) },
];
