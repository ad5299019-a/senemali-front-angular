import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, concatMap, from, map, of, toArray } from 'rxjs';
import { NotificationService } from './notification.service';
import { UtilisateurService } from '../utilisateurs/utilisateur.service';
import { TYPE_NOTIFICATION_LABELS, TypeNotificationEnum, RoleEnum, NotificationRequest, UtilisateurResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastService } from '../../core/services/toast.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-notification-send',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, MatIconModule],
  templateUrl: './notification-send.component.html',
  styleUrl: './notification-send.component.scss',
})
export class NotificationSendComponent {
  private fb = inject(FormBuilder);
  private service = inject(NotificationService);
  private utilisateurService = inject(UtilisateurService);
  private toast = inject(ToastService);

  saving = signal(false);
  users = signal<UtilisateurResponse[]>([]);
  roleFilter = signal<RoleEnum | null>(null);
  search = signal('');
  selectedIds = signal<Set<number>>(new Set());
  typeOptions = Object.entries(TYPE_NOTIFICATION_LABELS).map(([value, label]) => ({ value: value as TypeNotificationEnum, label }));
  roleOptions = [
    { value: RoleEnum.AGRICULTEUR, label: 'Agriculteurs' },
    { value: RoleEnum.FOURNISSEUR, label: 'Fournisseurs' },
    { value: RoleEnum.ACHETEUR, label: 'Acheteurs' },
    { value: RoleEnum.ADMIN, label: 'Administrateurs' },
  ];

  filteredUsers = computed(() => {
    const role = this.roleFilter();
    const term = this.search().trim().toLocaleLowerCase();
    return this.users().filter((user) => {
      const matchesRole = !role || user.role === role;
      const fullName = `${user.prenom} ${user.nom} ${user.email}`.toLocaleLowerCase();
      return matchesRole && (!term || fullName.includes(term));
    });
  });

  selectedUsers = computed(() => {
    const ids = this.selectedIds();
    return this.users().filter((user) => ids.has(user.id));
  });

  allVisibleSelected = computed(() => {
    const visible = this.filteredUsers();
    const selected = this.selectedIds();
    return visible.length > 0 && visible.every((user) => selected.has(user.id));
  });

  form = this.fb.nonNullable.group({
    type: [TypeNotificationEnum.INFORMATION, Validators.required],
    titre: ['', Validators.required],
    message: ['', Validators.required],
  });

  ngOnInit(): void {
    this.utilisateurService.findAll().subscribe({
      next: (users) => this.users.set(users),
      error: () => this.toast.error('Impossible de charger la liste des utilisateurs.'),
    });
  }

  onRoleFilterChange(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      const value = event.target.value;
      this.roleFilter.set(value ? value as RoleEnum : null);
    }
  }

  onSearch(event: Event): void {
    if (event.target instanceof HTMLInputElement) this.search.set(event.target.value);
  }

  toggleRecipient(id: number, event: Event): void {
    const checked = event.target instanceof HTMLInputElement && event.target.checked;
    const selected = new Set(this.selectedIds());
    if (checked) selected.add(id);
    else selected.delete(id);
    this.selectedIds.set(selected);
  }

  toggleVisibleRecipients(event: Event): void {
    const checked = event.target instanceof HTMLInputElement && event.target.checked;
    const selected = new Set(this.selectedIds());
    for (const user of this.filteredUsers()) {
      if (checked) selected.add(user.id);
      else selected.delete(user.id);
    }
    this.selectedIds.set(selected);
  }

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  roleLabel(role: RoleEnum): string {
    const labels: Record<RoleEnum, string> = {
      [RoleEnum.AGRICULTEUR]: 'Agriculteur',
      [RoleEnum.FOURNISSEUR]: 'Fournisseur',
      [RoleEnum.ACHETEUR]: 'Acheteur',
      [RoleEnum.ADMIN]: 'Administrateur',
    };
    return labels[role];
  }

  initials(user: UtilisateurResponse): string {
    return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toLocaleUpperCase();
  }

  isInvalid(control: 'titre' | 'message'): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.dirty || field.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const recipients = this.selectedUsers();
    if (recipients.length === 0) {
      this.toast.error('Sélectionnez au moins un destinataire.');
      return;
    }

    this.saving.set(true);
    const message = this.form.getRawValue();
    from(recipients).pipe(
      concatMap((user) => {
        const payload: NotificationRequest = { ...message, idUtilisateur: user.id };
        return this.service.create(payload).pipe(
          map(() => ({ id: user.id, success: true })),
          catchError(() => of({ id: user.id, success: false })),
        );
      }),
      toArray(),
    ).subscribe({
      next: (results) => {
        const sent = results.filter((result) => result.success).length;
        const failed = results.length - sent;
        if (failed === 0) {
          this.toast.success(`Notification envoyée à ${sent} utilisateur(s).`);
          this.form.reset({ type: TypeNotificationEnum.INFORMATION, titre: '', message: '' });
          this.selectedIds.set(new Set());
        } else {
          this.selectedIds.set(new Set(results.filter((result) => !result.success).map((result) => result.id)));
          this.toast.error(`${sent} notification(s) envoyée(s), ${failed} échec(s). Seuls les destinataires en échec restent sélectionnés pour permettre un nouvel essai.`);
        }
        this.saving.set(false);
      },
      error: () => {
        this.toast.error('L’envoi des notifications a échoué.');
        this.saving.set(false);
      },
    });
  }
}
