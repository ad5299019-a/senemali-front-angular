import { Component, computed, inject, signal } from '@angular/core';
import { FournisseurService } from './fournisseur.service';
import { FournisseurResponse, STATUT_VALIDATION_LABELS, StatutValidationFournisseur } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/components/data-table/column-def';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { UtilisateurService } from '../utilisateurs/utilisateur.service';

type FilterTab = 'TOUS' | StatutValidationFournisseur;

@Component({
  selector: 'app-fournisseur-list',
  standalone: true,
  imports: [PageHeaderComponent, DataTableComponent, StatusBadgeComponent],
  templateUrl: './fournisseur-list.component.html',
  styleUrl: './fournisseur-list.component.scss',
})
export class FournisseurListComponent {
  private service = inject(FournisseurService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private utilisateurs = inject(UtilisateurService);

  protected readonly Statut = StatutValidationFournisseur;

  rows = signal<FournisseurResponse[]>([]);
  loading = signal(true);
  activeTab = signal<FilterTab>(StatutValidationFournisseur.EN_ATTENTE);

  tabs: { value: FilterTab; label: string }[] = [
    { value: 'TOUS', label: 'Tous' },
    { value: StatutValidationFournisseur.EN_ATTENTE, label: 'En attente' },
    { value: StatutValidationFournisseur.VALIDE, label: 'Validés' },
    { value: StatutValidationFournisseur.REFUSE, label: 'Refusés' },
  ];

  filteredRows = computed(() => {
    const tab = this.activeTab();
    return tab === 'TOUS' ? this.rows() : this.rows().filter((r) => r.statutFournisseur === tab);
  });

  columns: ColumnDef<FournisseurResponse>[] = [
    { header: 'Nom complet', accessor: (r) => `${r.prenom} ${r.nom}` },
    { header: 'Entreprise', accessor: (r) => r.nomEntreprise || '—' },
    { header: 'Zone de vente', accessor: (r) => r.zoneDeVente || '—' },
    { header: 'Téléphone', accessor: (r) => r.telephone },
  ];

  ngOnInit(): void { this.load(); }

  countFor(statut: StatutValidationFournisseur): number {
    return this.rows().filter((r) => r.statutFournisseur === statut).length;
  }

  setTab(tab: FilterTab): void {
    this.activeTab.set(tab);
  }

  private load(): void {
    this.loading.set(true);
    this.service.findAll().subscribe({ next: (d) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  async valider(row: FournisseurResponse, statut: StatutValidationFournisseur): Promise<void> {
    const label = STATUT_VALIDATION_LABELS[statut];
    const ok = await this.confirm.ask({
      title: `${label} le fournisseur`,
      message: `Confirmer : ${label.toLowerCase()} le compte de ${row.prenom} ${row.nom} ?`,
      danger: statut === StatutValidationFournisseur.REFUSE,
    });
    if (!ok) return;
    this.service.valider(row.idFournisseur, statut).subscribe({
      next: () => {
        const changeActivation = statut === StatutValidationFournisseur.VALIDE ? !row.statut : row.statut;
        if (changeActivation) {
          this.utilisateurs.toggleStatut(row.id).subscribe({
            next: () => {
              this.toast.success(statut === StatutValidationFournisseur.VALIDE
                ? 'Fournisseur validé et compte activé.'
                : 'Fournisseur refusé et compte désactivé.');
              this.load();
            },
            error: () => this.load(),
          });
          return;
        }
        this.toast.success(`Fournisseur ${label.toLowerCase()}.`);
        this.load();
      },
    });
  }

  activerCompte(row: FournisseurResponse): void {
    this.utilisateurs.toggleStatut(row.id).subscribe({
      next: () => {
        this.toast.success('Compte fournisseur activé.');
        this.load();
      },
    });
  }

  async remove(row: FournisseurResponse): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Supprimer le fournisseur', message: `Supprimer le compte de ${row.prenom} ${row.nom} ?`, danger: true });
    if (!ok) return;
    this.service.remove(row.idFournisseur).subscribe(() => { this.toast.success('Compte supprimé.'); this.load(); });
  }
}
