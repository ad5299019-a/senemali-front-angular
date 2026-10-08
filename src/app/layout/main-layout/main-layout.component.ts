import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NAV_ITEMS } from '../nav-items';
import { RoleEnum } from '../../core/models/enums';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmService } from '../../core/services/confirm.service';
import { NotificationResponse, TYPE_NOTIFICATION_LABELS } from '../../core/models';
import { NotificationService } from '../../features/notifications/notification.service';
import { EMPTY, Subscription, catchError, switchMap, tap, timer } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private confirm = inject(ConfirmService);
  private notificationsService = inject(NotificationService);
  private subscriptions = new Subscription();
  mobileOpen = signal(false);
  notificationsOpen = signal(false);
  notificationsLoading = signal(true);
  notificationsError = signal(false);
  notifications = signal<NotificationResponse[]>([]);

  unreadCount = computed(() => this.notifications().filter((notification) => !notification.lue).length);
  recentNotifications = computed(() => this.notifications().slice(0, 8));

  visibleItems = computed(() => {
    const role = this.auth.currentUser()?.role;
    if (!role) return [];
    return NAV_ITEMS.filter((item) => item.roles.includes(role));
  });

  roleLabel = computed(() => {
    const role = this.auth.currentUser()?.role;
    return role === RoleEnum.ADMIN ? 'Espace Administrateur' : 'Espace Fournisseur';
  });

  ngOnInit(): void {
    this.subscriptions.add(
      timer(0, 30_000).pipe(
        switchMap(() => {
          const userId = this.auth.currentUser()?.id;
          if (userId === undefined) return EMPTY;
          return this.notificationsService.findByUtilisateur(userId).pipe(
            tap((notifications) => {
              this.notifications.set(
                [...notifications].sort(
                  (first, second) => new Date(second.dateEnvoi).getTime() - new Date(first.dateEnvoi).getTime(),
                ),
              );
              this.notificationsError.set(false);
              this.notificationsLoading.set(false);
            }),
            catchError(() => {
              this.notificationsError.set(true);
              this.notificationsLoading.set(false);
              return EMPTY;
            }),
          );
        }),
      ).subscribe(),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleNotifications(): void {
    const opening = !this.notificationsOpen();
    this.notificationsOpen.set(opening);
    if (opening) this.refreshNotifications();
  }

  refreshNotifications(): void {
    const userId = this.auth.currentUser()?.id;
    if (userId === undefined) return;
    this.subscriptions.add(
      this.notificationsService.findByUtilisateur(userId).subscribe({
        next: (notifications) => {
          this.notifications.set(
            [...notifications].sort(
              (first, second) => new Date(second.dateEnvoi).getTime() - new Date(first.dateEnvoi).getTime(),
            ),
          );
          this.notificationsError.set(false);
          this.notificationsLoading.set(false);
        },
        error: () => {
          this.notificationsError.set(true);
          this.notificationsLoading.set(false);
        },
      }),
    );
  }

  formatNotificationDate(date: string): string {
    return new Date(date).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  }

  notificationTypeLabel(notification: NotificationResponse): string {
    return TYPE_NOTIFICATION_LABELS[notification.type] ?? notification.type;
  }

  markNotificationAsRead(notification: NotificationResponse): void {
    this.notificationsService.markAsLue(notification.idNotification).subscribe({
      next: () => {
        this.notifications.update((items) =>
          items.map((item) => item.idNotification === notification.idNotification ? { ...item, lue: true } : item),
        );
      },
      error: () => this.notificationsError.set(true),
    });
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
