import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConseilService } from './conseil.service';
import { ConseilResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/components/data-table/column-def';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-conseil-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, DataTableComponent],
  templateUrl: './conseil-list.component.html',
})
export class ConseilListComponent {
  private service = inject(ConseilService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);

  rows = signal<ConseilResponse[]>([]);
  loading = signal(true);

  columns: ColumnDef<ConseilResponse>[] = [
    { header: 'Titre', accessor: (r) => r.titreConseil },
    { header: 'Culture', accessor: (r) => r.nomCulture ?? '—' },
    { header: 'Date de publication', accessor: (r) => new Date(r.datePub).toLocaleDateString('fr-FR') },
  ];

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.service.findAll().subscribe({
      next: (data) => { this.rows.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  async remove(row: ConseilResponse): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Supprimer le conseil', message: `Supprimer "${row.titreConseil}" ?`, danger: true });
    if (!ok) return;
    this.service.remove(row.idConseil).subscribe(() => { this.toast.success('Conseil supprimé.'); this.load(); });
  }
}
