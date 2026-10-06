import { Component, inject, signal } from '@angular/core';
import { AgriculteurService } from './agriculteur.service';
import { AgriculteurResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/components/data-table/column-def';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-agriculteur-list',
  standalone: true,
  imports: [PageHeaderComponent, DataTableComponent],
  templateUrl: './agriculteur-list.component.html',
})
export class AgriculteurListComponent {
  private service = inject(AgriculteurService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);

  rows = signal<AgriculteurResponse[]>([]);
  loading = signal(true);

  columns: ColumnDef<AgriculteurResponse>[] = [
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

  async remove(row: AgriculteurResponse): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Supprimer l\'agriculteur',
      message: `Supprimer le compte de ${row.prenom} ${row.nom} ?`,
      danger: true,
    });
    if (!ok) return;
    this.service.remove(row.idAgriculteur).subscribe(() => { this.toast.success('Compte supprimé.'); this.load(); });
  }
}
