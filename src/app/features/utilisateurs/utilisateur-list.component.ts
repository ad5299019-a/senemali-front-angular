import { Component, computed, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { UtilisateurService } from './utilisateur.service';
import { UtilisateurResponse } from '../../core/models';
import { RoleEnum } from '../../core/models/enums';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/components/data-table/column-def';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { FournisseurResponse, STATUT_VALIDATION_LABELS } from '../../core/models';
import { StatutValidationFournisseur } from '../../core/models/enums';
import { FournisseurService } from '../fournisseurs/fournisseur.service';
import { Subscription } from 'rxjs';
import { AdminCreateDialogComponent } from './admin-create-dialog.component';

@Component({
  selector: 'app-utilisateur-list',
  standalone: true,
  imports: [PageHeaderComponent, DataTableComponent, StatusBadgeComponent, MatIconModule, AdminCreateDialogComponent],
  templateUrl: './utilisateur-list.component.html',
  styleUrl: './utilisateur-list.component.scss',
})
export class UtilisateurListComponent {
  private service = inject(UtilisateurService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private fournisseurService = inject(FournisseurService);
  private supplierDetailsSubscription?: Subscription;

  rows = signal<UtilisateurResponse[]>([]);
  loading = signal(true);
  search = signal('');
  activeRole = signal<RoleEnum | 'TOUS'>('TOUS');
  selectedUser = signal<UtilisateurResponse | null>(null);
  fournisseurDetails = signal<FournisseurResponse | null>(null);
  fournisseurDetailsLoading = signal(false);
  fournisseurDetailsError = signal(false);
  showAdminForm = signal(false);
  readonly RoleEnum = RoleEnum;

  @ViewChild('userNameTpl', { static: true }) userNameTpl!: TemplateRef<{ $implicit: UtilisateurResponse }>;
  @ViewChild('userStatusTpl', { static: true }) userStatusTpl!: TemplateRef<{ $implicit: UtilisateurResponse }>;

  roleTabs: { value: RoleEnum | 'TOUS'; label: string }[] = [
    { value: 'TOUS', label: 'Tous' },
    { value: RoleEnum.AGRICULTEUR, label: 'Agriculteurs' },
    { value: RoleEnum.FOURNISSEUR, label: 'Fournisseurs' },
    { value: RoleEnum.ACHETEUR, label: 'Acheteurs' },
    { value: RoleEnum.ADMIN, label: 'Admins' },
  ];

  filteredRows = computed(() => {
    const term = this.search().trim().toLocaleLowerCase();
    const role = this.activeRole();
    return this.rows().filter((row) => {
      const matchesRole = role === 'TOUS' || row.role === role;
      const content = `${row.prenom} ${row.nom} ${row.email} ${row.localisation}`.toLocaleLowerCase();
      return matchesRole && (!term || content.includes(term));
    });
  });

  columns: ColumnDef<UtilisateurResponse>[] = [];

  onSearchInput(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.search.set(event.target.value);
    }
  }

  ngOnInit(): void {
    this.columns = [
      { header: 'Nom complet', accessor: (r) => `${r.prenom} ${r.nom}`, cellTemplate: this.userNameTpl, width: '25%' },
      { header: 'Email', accessor: (r) => r.email },
      { header: 'Rôle', accessor: (r) => this.roleLabel(r.role) },
      { header: 'Localisation', accessor: (r) => r.localisation },
      { header: 'Statut', accessor: (r) => r.statut ? 'Actif' : 'En attente', cellTemplate: this.userStatusTpl },
    ];
    this.load();
  }

  roleLabel(role: RoleEnum): string {
    const labels: Record<RoleEnum, string> = {
      [RoleEnum.ADMIN]: 'Administrateur',
      [RoleEnum.AGRICULTEUR]: 'Agriculteur',
      [RoleEnum.FOURNISSEUR]: 'Fournisseur',
      [RoleEnum.ACHETEUR]: 'Acheteur',
    };
    return labels[role];
  }

  roleIcon(role: RoleEnum): string {
    const icons: Record<RoleEnum, string> = {
      [RoleEnum.ADMIN]: 'admin_panel_settings',
      [RoleEnum.AGRICULTEUR]: 'agriculture',
      [RoleEnum.FOURNISSEUR]: 'storefront',
      [RoleEnum.ACHETEUR]: 'shopping_bag',
    };
    return icons[role];
  }

  formatCreationDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date);
  }

  openUserDetails(user: UtilisateurResponse): void {
    this.supplierDetailsSubscription?.unsubscribe();
    this.fournisseurDetails.set(null);
    this.fournisseurDetailsError.set(false);
    this.selectedUser.set(user);
    if (user.role !== RoleEnum.FOURNISSEUR) return;

    this.fournisseurDetailsLoading.set(true);
    this.supplierDetailsSubscription = this.fournisseurService.findAll().subscribe({
      next: (fournisseurs) => {
        this.fournisseurDetails.set(fournisseurs.find((fournisseur) => fournisseur.id === user.id) ?? null);
        this.fournisseurDetailsLoading.set(false);
      },
      error: () => {
        this.fournisseurDetailsError.set(true);
        this.fournisseurDetailsLoading.set(false);
      },
    });
  }

  fournisseurStatusLabel(status: StatutValidationFournisseur): string {
    return STATUT_VALIDATION_LABELS[status];
  }

  closeUserDetails(): void {
    this.supplierDetailsSubscription?.unsubscribe();
    this.fournisseurDetailsLoading.set(false);
    this.selectedUser.set(null);
  }

  onAdminCreated(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.service.findAll().subscribe({ next: (d) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  async toggleStatut(row: UtilisateurResponse): Promise<void> {
    const action = row.statut ? 'désactiver' : 'activer';
    const ok = await this.confirm.ask({
      title: `Confirmer : ${action} ce compte`,
      message: `Voulez-vous ${action} le compte de ${row.prenom} ${row.nom} ?`,
      danger: row.statut,
    });
    if (!ok) return;
    this.service.toggleStatut(row.id).subscribe(() => {
      this.toast.success(`Compte ${row.statut ? 'désactivé' : 'activé'}.`);
      this.load();
    });
  }

  async remove(row: UtilisateurResponse): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Supprimer le compte',
      message: `Supprimer définitivement le compte de ${row.prenom} ${row.nom} ? Cette action est irréversible.`,
      danger: true,
    });
    if (!ok) return;
    this.service.remove(row.id).subscribe(() => { this.toast.success('Compte supprimé.'); this.load(); });
  }
}
