import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PartenaireService } from './partenaire.service';
import { PartenaireFinancierResponse, TYPE_PARTENAIRE_LABELS } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/components/data-table/column-def';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-partenaire-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, DataTableComponent],
  templateUrl: './partenaire-list.component.html',
})
export class PartenaireListComponent {
  private service = inject(PartenaireService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);

  rows = signal<PartenaireFinancierResponse[]>([]);
  loading = signal(true);

  columns: ColumnDef<PartenaireFinancierResponse>[] = [
    { header: 'Nom', accessor: (r) => r.nomPartenaire },
    { header: 'Type', accessor: (r) => TYPE_PARTENAIRE_LABELS[r.typepartenaire] },
    { header: 'Localisation', accessor: (r) => r.localisation || '—' },
    { header: 'Téléphone', accessor: (r) => r.telephone || '—' },
  ];

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.service.findAll().subscribe({ next: (d) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  async remove(row: PartenaireFinancierResponse): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Supprimer le partenaire', message: `Supprimer "${row.nomPartenaire}" ?`, danger: true });
    if (!ok) return;
    this.service.remove(row.idPartenaire).subscribe(() => { this.toast.success('Partenaire supprimé.'); this.load(); });
  }
}
