import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { RoleEnum } from '../models/enums';

/**
 * Guard paramétrable par rôle. Usage dans les routes :
 *   { path: 'utilisateurs', canActivate: [roleGuard([RoleEnum.ADMIN])], ... }
 */
export function roleGuard(allowedRoles: RoleEnum[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const toast = inject(ToastService);

    const role = auth.currentUser()?.role;
    if (role && allowedRoles.includes(role)) return true;

    toast.error("Vous n'avez pas accès à cette page.");
    router.navigate(['/']);
    return false;
  };
}
