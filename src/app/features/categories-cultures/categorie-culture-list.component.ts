import { Component, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CategorieCultureService } from './categorie-culture.service';
import { CategorieCultureResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/components/data-table/column-def';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { MatIconModule } from '@angular/material/icon';
import { FileStorageService } from '../../core/services/file-storage.service';

@Component({
  selector: 'app-categorie-culture-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, DataTableComponent, MatIconModule],
  templateUrl: './categorie-culture-list.component.html',
  styleUrl: './categorie-culture-list.component.scss',
})
export class CategorieCultureListComponent {
  private service = inject(CategorieCultureService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private files = inject(FileStorageService);

  rows = signal<CategorieCultureResponse[]>([]);
  loading = signal(true);
  selectedCategory = signal<CategorieCultureResponse | null>(null);

  @ViewChild('culturesCountTpl', { static: true }) culturesCountTpl!: TemplateRef<{ $implicit: CategorieCultureResponse }>;

  columns: ColumnDef<CategorieCultureResponse>[] = [];

  ngOnInit(): void {
    this.columns = [
      { header: 'Nom', accessor: (r) => r.nomCategorie },
      { header: 'Description', accessor: (r) => r.description || '—' },
      { header: 'Cultures liées', accessor: (r) => r.cultures?.length ?? 0, cellTemplate: this.culturesCountTpl, align: 'center', width: '140px' },
    ];
    this.load();
  }

  openCultures(category: CategorieCultureResponse): void {
    if (category.cultures?.length) {
      this.selectedCategory.set(category);
    }
  }

  closeCultures(): void {
    this.selectedCategory.set(null);
  }

  imageUrl(url: string | null | undefined): string | null {
    return this.files.resolveUrl(url);
  }

  private load(): void {
    this.loading.set(true);
    this.service.findAll().subscribe({
      next: (data) => { this.rows.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  async remove(row: CategorieCultureResponse): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Supprimer la catégorie',
      message: `Supprimer "${row.nomCategorie}" ? Cette action est irréversible.`,
      danger: true,
    });
    if (!ok) return;
    this.service.remove(row.idCategorie).subscribe(() => {
      this.toast.success('Catégorie supprimée.');
      this.load();
    });
  }
}
