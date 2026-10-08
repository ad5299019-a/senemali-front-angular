import { Component, computed, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CultureService } from './culture.service';
import { CultureResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/components/data-table/column-def';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { FileStorageService } from '../../core/services/file-storage.service';
import { CultureDetailDialogComponent } from './culture-detail-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-culture-list',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    DataTableComponent,
    MatIconModule,
    CultureDetailDialogComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './culture-list.component.html',
  styleUrl: './culture-list.component.scss',
})
export class CultureListComponent {
  private service = inject(CultureService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private files = inject(FileStorageService);
  private router = inject(Router);

  rows = signal<CultureResponse[]>([]);
  loading = signal(true);
  selectedCulture = signal<CultureResponse | null>(null);

  /** Mode d'affichage actif : 'grid' (Cartes par défaut) ou 'table' */
  viewMode = signal<'grid' | 'table'>('grid');

  /** Recherche textuelle */
  searchQuery = signal<string>('');

  /** Cultures filtrées selon la recherche */
  filteredRows = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.rows();
    if (!q) return list;
    return list.filter((c) =>
      c.nomCulture.toLowerCase().includes(q) ||
      (c.nomCategorie && c.nomCategorie.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  @ViewChild('cultureNameTpl', { static: true }) cultureNameTpl!: TemplateRef<{ $implicit: CultureResponse }>;
  @ViewChild('categorieTpl', { static: true }) categorieTpl!: TemplateRef<{ $implicit: CultureResponse }>;

  columns: ColumnDef<CultureResponse>[] = [];

  ngOnInit(): void {
    this.columns = [
      { header: 'Culture', accessor: (r) => r.nomCulture, cellTemplate: this.cultureNameTpl, width: '45%' },
      { header: 'Catégorie', accessor: (r) => r.nomCategorie ?? '—', cellTemplate: this.categorieTpl, width: '35%' },
    ];
    this.load();
  }

  imageUrl(url: string | null | undefined): string | null {
    return this.files.resolveUrl(url);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  private load(): void {
    this.loading.set(true);
    this.service.findAll().subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openDetail(culture: CultureResponse): void {
    this.selectedCulture.set(culture);
  }

  closeDetail(): void {
    this.selectedCulture.set(null);
  }

  onEdit(culture: CultureResponse): void {
    this.closeDetail();
    this.router.navigate(['/cultures', culture.idCulture, 'modifier']);
  }

  onDelete(culture: CultureResponse): void {
    this.closeDetail();
    this.remove(culture);
  }

  async remove(row: CultureResponse): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Supprimer la culture',
      message: `Supprimer "${row.nomCulture}" ? Cette action est irréversible.`,
      danger: true,
    });
    if (!ok) return;
    this.service.remove(row.idCulture).subscribe(() => {
      this.toast.success('Culture supprimée.');
      this.load();
    });
  }
}
