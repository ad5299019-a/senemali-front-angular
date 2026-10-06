import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from './notification.service';
import { UtilisateurService } from '../utilisateurs/utilisateur.service';
import { UtilisateurResponse, TYPE_NOTIFICATION_LABELS, TypeNotificationEnum, RoleEnum } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-notification-send',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeaderComponent],
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
  roleOptions = Object.values(RoleEnum);

  typeOptions = Object.entries(TYPE_NOTIFICATION_LABELS).map(([value, label]) => ({ value: value as TypeNotificationEnum, label }));

  filteredUsers = computed(() => {
    const role = this.roleFilter();
    return role ? this.users().filter((u) => u.role === role) : this.users();
  });

  form = this.fb.nonNullable.group({
    idUtilisateur: [null as number | null, Validators.required],
    type: [TypeNotificationEnum.INFORMATION, Validators.required],
    titre: ['', Validators.required],
    message: ['', Validators.required],
  });

  ngOnInit(): void {
    this.utilisateurService.findAll().subscribe((data) => this.users.set(data));
  }

  onRoleFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.roleFilter.set(value ? (value as RoleEnum) : null);
  }

  isInvalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.service.create(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.toast.success('Notification envoyée.');
        this.form.reset({ idUtilisateur: null, type: TypeNotificationEnum.INFORMATION, titre: '', message: '' });
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }
}
