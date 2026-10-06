import { Component, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CultureService } from './culture.service';
import { CultureResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/components/data-table/column-def';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { FileStorageService } from '../../core/services/file-storage.service';

@Component({
  selector: 'app-culture-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, DataTableComponent, MatIconModule],
  templateUrl: './culture-list.component.html',
  styleUrl: './culture-list.component.scss',
})
export class CultureListComponent {
  private service = inject(CultureService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private files = inject(FileStorageService);

  rows = signal<CultureResponse[]>([]);
  loading = signal(true);

  @ViewChild('cultureNameTpl', { static: true }) cultureNameTpl!: TemplateRef<{ $implicit: CultureResponse }>;

  columns: ColumnDef<CultureResponse>[] = [];

  ngOnInit(): void {
    this.columns = [
      { header: 'Nom', accessor: (r) => r.nomCulture, cellTemplate: this.cultureNameTpl, width: '28%' },
      { header: 'Catégorie', accessor: (r) => r.nomCategorie ?? '—' },
      { header: 'Description', accessor: (r) => r.description || '—' },
    ];
    this.load();
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
