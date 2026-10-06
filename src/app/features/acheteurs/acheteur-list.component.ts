import { Component, inject, signal } from '@angular/core';
import { AcheteurService } from './acheteur.service';
import { AcheteurResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/components/data-table/column-def';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-acheteur-list',
  standalone: true,
  imports: [PageHeaderComponent, DataTableComponent],
  templateUrl: './acheteur-list.component.html',
})
export class AcheteurListComponent {
  private service = inject(AcheteurService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);

  rows = signal<AcheteurResponse[]>([]);
  loading = signal(true);

  columns: ColumnDef<AcheteurResponse>[] = [
    { header: 'Nom complet', accessor: (r) => `${r.prenom} ${r.nom}` },
    { header: 'Téléphone', accessor: (r) => r.telephone },
    { header: 'Localisation', accessor: (r) => r.localisation },
    { header: 'Statut', accessor: (r) => (r.statut ? 'Actif' : 'Désactivé') },
  ];

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.service.findAll().subscribe({ next: (d) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  async remove(row: AcheteurResponse): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Supprimer l\'acheteur', message: `Supprimer le compte de ${row.prenom} ${row.nom} ?`, danger: true });
    if (!ok) return;
    this.service.remove(row.idAcheteur).subscribe(() => { this.toast.success('Compte supprimé.'); this.load(); });
  }
}
