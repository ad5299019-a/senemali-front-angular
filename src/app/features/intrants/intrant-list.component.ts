import { Component, computed, inject, OnDestroy, signal, TemplateRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IntrantService } from './intrant.service';
import { FournisseurResponse, IntrantResponse, STATUT_VALIDATION_LABELS, StatutValidationFournisseur } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/components/data-table/column-def';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { FournisseurService } from '../fournisseurs/fournisseur.service';
import { FileStorageService } from '../../core/services/file-storage.service';
import { Subscription } from 'rxjs';

type FilterTab = 'TOUS' | StatutValidationFournisseur;

@Component({
  selector: 'app-intrant-list',
  standalone: true,
  imports: [PageHeaderComponent, DataTableComponent, StatusBadgeComponent, MatIconModule],
  templateUrl: './intrant-list.component.html',
  styleUrl: './intrant-list.component.scss',
})
export class IntrantListComponent implements OnDestroy {
  private service = inject(IntrantService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private fournisseurService = inject(FournisseurService);
  private files = inject(FileStorageService);
  private fournisseurSubscription?: Subscription;

  protected readonly Statut = StatutValidationFournisseur;

  rows = signal<IntrantResponse[]>([]);
  loading = signal(true);
  activeTab = signal<FilterTab>(StatutValidationFournisseur.EN_ATTENTE);
  search = signal('');
  selectedIntrant = signal<IntrantResponse | null>(null);
  fournisseurDetails = signal<FournisseurResponse | null>(null);
  fournisseurLoading = signal(false);
  fournisseurError = signal(false);

  @ViewChild('intrantNameTpl', { static: true }) intrantNameTpl!: TemplateRef<{ $implicit: IntrantResponse }>;

  tabs: { value: FilterTab; label: string }[] = [
    { value: 'TOUS', label: 'Tous' },
    { value: StatutValidationFournisseur.EN_ATTENTE, label: 'En attente' },
    { value: StatutValidationFournisseur.VALIDE, label: 'Validés' },
    { value: StatutValidationFournisseur.REFUSE, label: 'Refusés' },
  ];

  filteredRows = computed(() => {
    const tab = this.activeTab();
    const term = this.search().trim().toLocaleLowerCase();
    return this.rows().filter((row) => {
      const matchesStatus = tab === 'TOUS' || row.statutIntrant === tab;
      const content = `${row.nomIntrant} ${row.typeIntrant} ${row.nomFournisseur ?? ''} ${row.description ?? ''}`.toLocaleLowerCase();
      return matchesStatus && (!term || content.includes(term));
    });
  });

  columns: ColumnDef<IntrantResponse>[] = [];

  ngOnInit(): void { this.load(); }

  ngOnDestroy(): void {
    this.fournisseurSubscription?.unsubscribe();
  }

  onSearchInput(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.search.set(event.target.value);
    }
  }

  openDetails(intrant: IntrantResponse): void {
    this.fournisseurSubscription?.unsubscribe();
    this.selectedIntrant.set(intrant);
    this.fournisseurDetails.set(null);
    this.fournisseurError.set(false);
    this.fournisseurLoading.set(true);
    this.fournisseurSubscription = this.fournisseurService.findById(intrant.idFournisseur).subscribe({
      next: (fournisseur) => {
        this.fournisseurDetails.set(fournisseur);
        this.fournisseurLoading.set(false);
      },
      error: () => {
        this.fournisseurError.set(true);
        this.fournisseurLoading.set(false);
      },
    });
  }

  closeDetails(): void {
    this.fournisseurSubscription?.unsubscribe();
    this.selectedIntrant.set(null);
    this.fournisseurLoading.set(false);
  }

  imageUrl(url: string | null | undefined): string | null {
    return this.files.resolveUrl(url);
  }

  statusLabel(status: StatutValidationFournisseur): string {
    return STATUT_VALIDATION_LABELS[status];
  }

  private load(): void {
    this.loading.set(true);
    this.service.findAll().subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.columns = [
      { header: 'Intrant', accessor: (row) => row.nomIntrant, cellTemplate: this.intrantNameTpl },
      { header: 'Type', accessor: (row) => row.typeIntrant },
      { header: 'Fournisseur', accessor: (row) => row.nomFournisseur ?? '—' },
      { header: 'Prix', accessor: (row) => `${row.prix.toLocaleString('fr-FR')} FCFA`, align: 'right' },
    ];
  }

  async valider(row: IntrantResponse, statut: StatutValidationFournisseur): Promise<void> {
    const label = STATUT_VALIDATION_LABELS[statut];
    const ok = await this.confirm.ask({ title: `${label} l'intrant`, message: `Confirmer : ${label.toLowerCase()} "${row.nomIntrant}" ?` });
    if (!ok) return;
    this.service.valider(row.idIntrant, statut).subscribe(() => { this.toast.success(`Intrant ${label.toLowerCase()}.`); this.load(); });
  }

  async remove(row: IntrantResponse): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Supprimer l\'intrant', message: `Supprimer "${row.nomIntrant}" ?`, danger: true });
    if (!ok) return;
    this.service.remove(row.idIntrant).subscribe(() => { this.toast.success('Intrant supprimé.'); this.load(); });
  }
}
