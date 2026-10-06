import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IntrantService } from './intrant.service';
import { AuthService } from '../../core/services/auth.service';
import { IntrantResponse, STATUT_VALIDATION_LABELS, StatutValidationFournisseur } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/components/data-table/column-def';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-mes-intrants-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, DataTableComponent, StatusBadgeComponent],
  templateUrl: './mes-intrants-list.component.html',
})
export class MesIntrantsListComponent {
  private service = inject(IntrantService);
  private auth = inject(AuthService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);

  rows = signal<IntrantResponse[]>([]);
  loading = signal(true);

  columns: ColumnDef<IntrantResponse>[] = [
    { header: 'Intrant', accessor: (r) => r.nomIntrant },
    { header: 'Type', accessor: (r) => r.typeIntrant },
    { header: 'Prix', accessor: (r) => `${r.prix.toLocaleString('fr-FR')} FCFA`, align: 'right' },
    { header: 'Disponible', accessor: (r) => (r.disponible ? 'Oui' : 'Non'), align: 'center' },
    {
      header: 'Statut',
      accessor: (r) => STATUT_VALIDATION_LABELS[r.statutIntrant],
      align: 'center',
    },
  ];

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    const idFournisseur = this.auth.currentUser()!.id;
    this.service.findByFournisseur(idFournisseur).subscribe({
      next: (d) => { this.rows.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  async remove(row: IntrantResponse): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Supprimer l\'intrant', message: `Supprimer "${row.nomIntrant}" ?`, danger: true });
    if (!ok) return;
    this.service.remove(row.idIntrant).subscribe(() => { this.toast.success('Intrant supprimé.'); this.load(); });
  }
}
