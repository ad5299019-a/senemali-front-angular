import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PrestataireService } from './prestataire.service';
import { PrestatireResponse, TYPE_PRESTATAIRE_LABELS } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/components/data-table/column-def';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-prestataire-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, DataTableComponent],
  templateUrl: './prestataire-list.component.html',
})
export class PrestataireListComponent {
  private service = inject(PrestataireService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);

  rows = signal<PrestatireResponse[]>([]);
  loading = signal(true);

  columns: ColumnDef<PrestatireResponse>[] = [
    { header: 'Nom', accessor: (r) => r.nomPrestataire },
    { header: 'Type', accessor: (r) => TYPE_PRESTATAIRE_LABELS[r.typePrestataire] },
    { header: 'Spécialité', accessor: (r) => r.specialite },
    { header: 'Localisation', accessor: (r) => r.localisation },
    { header: 'Téléphone', accessor: (r) => r.telephone },
  ];

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.service.findAll().subscribe({ next: (d) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  async remove(row: PrestatireResponse): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Supprimer le prestataire', message: `Supprimer "${row.nomPrestataire}" ?`, danger: true });
    if (!ok) return;
    this.service.remove(row.idPrestataire).subscribe(() => { this.toast.success('Prestataire supprimé.'); this.load(); });
  }
}
