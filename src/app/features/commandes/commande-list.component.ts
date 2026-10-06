import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommandeService } from './commande.service';
import { CommandeResponse, STATUT_COMMANDE_LABELS, StatutCommandeEnum } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/components/data-table/column-def';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-commande-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, DataTableComponent],
  templateUrl: './commande-list.component.html',
})
export class CommandeListComponent {
  private service = inject(CommandeService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);

  rows = signal<CommandeResponse[]>([]);
  loading = signal(true);

  columns: ColumnDef<CommandeResponse>[] = [
    { header: 'N° commande', accessor: (r) => `#${r.idCommande}`, width: '14%' },
    { header: 'Client', accessor: (r) => r.nomUtilisateur ?? '—', width: '22%' },
    { header: 'Date', accessor: (r) => new Date(r.dateCommande).toLocaleDateString('fr-FR'), width: '17%' },
    { header: 'Montant total', accessor: (r) => `${r.montantTotal.toLocaleString('fr-FR')} FCFA`, align: 'right', width: '23%' },
    { header: 'Statut', accessor: (r) => STATUT_COMMANDE_LABELS[r.status], align: 'center', width: '16%' },
  ];

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.service.findAll().subscribe({ next: (d) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  async remove(row: CommandeResponse): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Supprimer la commande', message: `Supprimer la commande #${row.idCommande} ?`, danger: true });
    if (!ok) return;
    this.service.remove(row.idCommande).subscribe(() => { this.toast.success('Commande supprimée.'); this.load(); });
  }
}
