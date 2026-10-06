import { Routes } from '@angular/router';

export const NOTIFICATION_SEND_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./notification-send.component').then((m) => m.NotificationSendComponent) },
];

export const MES_NOTIFICATIONS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./mes-notifications.component').then((m) => m.MesNotificationsComponent) },
];
