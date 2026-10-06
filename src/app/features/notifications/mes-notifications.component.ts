import { Component, inject, signal } from '@angular/core';
import { NotificationService } from './notification.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationResponse, TYPE_NOTIFICATION_LABELS } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-mes-notifications',
  standalone: true,
  imports: [PageHeaderComponent, EmptyStateComponent, LoadingSpinnerComponent],
  templateUrl: './mes-notifications.component.html',
  styleUrl: './mes-notifications.component.scss',
})
export class MesNotificationsComponent {
  private service = inject(NotificationService);
  private auth = inject(AuthService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);

  rows = signal<NotificationResponse[]>([]);
  loading = signal(true);

  ngOnInit(): void { this.load(); }

  typeLabel(n: NotificationResponse): string {
    return TYPE_NOTIFICATION_LABELS[n.type] ?? n.type;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR');
  }

  private load(): void {
    this.loading.set(true);
    const id = this.auth.currentUser()!.id;
    this.service.findByUtilisateur(id).subscribe({
      next: (d) => { this.rows.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  markAsLue(n: NotificationResponse): void {
    this.service.markAsLue(n.idNotification).subscribe(() => this.load());
  }

  markAllAsLue(): void {
    const id = this.auth.currentUser()!.id;
    this.service.markAllAsLue(id).subscribe(() => {
      this.toast.success('Toutes les notifications ont été marquées comme lues.');
      this.load();
    });
  }

  async remove(n: NotificationResponse): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Supprimer la notification', message: 'Supprimer cette notification ?', danger: true });
    if (!ok) return;
    this.service.remove(n.idNotification).subscribe(() => this.load());
  }
}
