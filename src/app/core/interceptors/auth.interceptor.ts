import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Ajoute automatiquement "Authorization: Bearer <token>" à toute requête
 * vers l'API, sauf sur les routes publiques d'authentification elles-mêmes.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  const isAuthRoute = req.url.includes('/auth/login') || req.url.includes('/auth/register');
  if (!token || isAuthRoute) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
