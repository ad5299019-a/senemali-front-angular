import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NAV_ITEMS } from '../nav-items';
import { RoleEnum } from '../../core/models/enums';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmService } from '../../core/services/confirm.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  private confirm = inject(ConfirmService);
  mobileOpen = signal(false);

  visibleItems = computed(() => {
    const role = this.auth.currentUser()?.role;
    if (!role) return [];
    return NAV_ITEMS.filter((item) => item.roles.includes(role));
  });

  roleLabel = computed(() => {
    const role = this.auth.currentUser()?.role;
    return role === RoleEnum.ADMIN ? 'Espace Administrateur' : 'Espace Fournisseur';
  });

  notificationPath(): string {
    return this.auth.isAdmin() ? '/notifications' : '/mes-notifications';
  }

  async confirmLogout(): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Se déconnecter',
      message: 'Voulez-vous vraiment quitter votre session ?',
      confirmLabel: 'Se déconnecter',
      cancelLabel: 'Rester connecté',
      danger: true,
    });
    if (confirmed) this.auth.logout();
  }

  initials = computed(() => {
    const u = this.auth.currentUser();
    if (!u) return '';
    return `${u.prenom.charAt(0)}${u.nom.charAt(0)}`.toUpperCase();
  });
}
