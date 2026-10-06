import { Component, computed, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FinancementService } from './financement.service';
import { FinancementRequest, FinancementResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/components/data-table/column-def';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-financement-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, DataTableComponent, StatusBadgeComponent],
  templateUrl: './financement-list.component.html',
  styleUrl: './financement-list.component.scss',
})
export class FinancementListComponent {
  private service = inject(FinancementService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  rows = signal<FinancementResponse[]>([]);
  loading = signal(true);
  updatingIds = signal<Set<number>>(new Set());
  filterPartenaireId = signal<number | null>(null);

  filteredRows = computed(() => {
    const filter = this.filterPartenaireId();
    return filter ? this.rows().filter((r) => r.idPartenaire === filter) : this.rows();
  });

  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<{ $implicit: FinancementResponse }>;
  columns: ColumnDef<FinancementResponse>[] = [];

  ngOnInit(): void {
    this.columns = [
      { header: 'Type', accessor: (r) => r.typeFinancement },
      { header: 'Partenaire', accessor: (r) => r.nomPartenaire ?? '—' },
      { header: 'Montant', accessor: (r) => `${r.montantMin.toLocaleString('fr-FR')} – ${r.montantMax.toLocaleString('fr-FR')} FCFA` },
      { header: 'Conditions principales', accessor: (r) => r.conditionPrincipales || '—' },
      { header: 'Statut', accessor: (r) => r.disponible ? 'Disponible' : 'Indisponible', cellTemplate: this.statusTpl, align: 'center' },
    ];
    const qp = this.route.snapshot.queryParamMap.get('idPartenaire');
    if (qp) this.filterPartenaireId.set(Number(qp));
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.service.findAll().subscribe({ next: (d) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  async remove(row: FinancementResponse): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Supprimer le financement', message: `Supprimer "${row.typeFinancement}" ?`, danger: true });
    if (!ok) return;
    this.service.remove(row.idFinancement).subscribe(() => { this.toast.success('Financement supprimé.'); this.load(); });
  }

  toggleAvailability(row: FinancementResponse): void {
    if (this.updatingIds().has(row.idFinancement)) return;
    const updating = new Set(this.updatingIds());
    updating.add(row.idFinancement);
    this.updatingIds.set(updating);
    const payload: FinancementRequest = {
      typeFinancement: row.typeFinancement,
      conditionPrincipales: row.conditionPrincipales,
      montantMin: row.montantMin,
      montantMax: row.montantMax,
      disponible: !row.disponible,
      idPartenaire: row.idPartenaire,
    };
    this.service.update(row.idFinancement, payload).subscribe({
      next: (updated) => {
        this.rows.update((rows) => rows.map((item) => item.idFinancement === updated.idFinancement ? updated : item));
        this.toast.success(updated.disponible ? 'Financement rendu disponible.' : 'Financement rendu indisponible.');
        this.finishAvailabilityUpdate(row.idFinancement);
      },
      error: () => {
        this.toast.error('Impossible de modifier la disponibilité du financement.');
        this.finishAvailabilityUpdate(row.idFinancement);
      },
    });
  }

  private finishAvailabilityUpdate(id: number): void {
    const updating = new Set(this.updatingIds());
    updating.delete(id);
    this.updatingIds.set(updating);
  }
}
