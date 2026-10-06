import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { ApiErrorBody } from '../models/api-response.model';

/**
 * Intercepteur centralisant la réaction aux erreurs HTTP, cohérent avec le
 * GlobalResponseAdvice du backend (chaque code a un message propre côté
 * serveur) : on privilégie toujours le message métier renvoyé par l'API,
 * avec un filet de secours générique sinon.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const body = err.error as ApiErrorBody | undefined;
      const serverMessage = body?.message;

      switch (err.status) {
        case 401:
          toast.error(serverMessage ?? 'Session expirée ou invalide, veuillez vous reconnecter.');
          auth.logout();
          break;
        case 403:
          toast.error(serverMessage ?? "Vous n'avez pas les droits nécessaires pour cette action.");
          break;
        case 404:
          toast.error(serverMessage ?? 'Ressource introuvable.');
          break;
        case 409:
          toast.error(serverMessage ?? 'Conflit : cette ressource existe déjà.');
          break;
        case 0:
          toast.error('Impossible de joindre le serveur. Vérifiez votre connexion.');
          break;
        default: {
          // Erreurs de validation (400) : le backend renvoie souvent une map { champ: message }
          if (body?.errors) {
            const firstError = Object.values(body.errors)[0];
            toast.error(firstError ?? serverMessage ?? 'Requête invalide.');
          } else {
            toast.error(serverMessage ?? 'Une erreur est survenue. Veuillez réessayer.');
          }
        }
      }
      return throwError(() => err);
    })
  );
};
