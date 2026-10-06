import { Component, computed, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ServiceAgricoleService } from './service-agricole.service';
import { ServiceAgricoleRequest, ServiceAgricoleResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/components/data-table/column-def';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-service-agricole-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, DataTableComponent, StatusBadgeComponent],
  templateUrl: './service-agricole-list.component.html',
  styleUrl: './service-agricole-list.component.scss',
})
export class ServiceAgricoleListComponent {
  private service = inject(ServiceAgricoleService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  rows = signal<ServiceAgricoleResponse[]>([]);
  loading = signal(true);
  filterPrestataireId = signal<number | null>(null);
  updatingIds = signal<Set<number>>(new Set());

  filteredRows = computed(() => {
    const filter = this.filterPrestataireId();
    return filter ? this.rows().filter((r) => r.idPrestataire === filter) : this.rows();
  });

  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<{ $implicit: ServiceAgricoleResponse }>;
  columns: ColumnDef<ServiceAgricoleResponse>[] = [];

  ngOnInit(): void {
    this.columns = [
      { header: 'Service', accessor: (r) => r.typeService },
      { header: 'Prestataire', accessor: (r) => r.nomPrestataire ?? '—' },
      { header: 'Coût estimé', accessor: (r) => r.coutEstime },
      { header: 'Statut', accessor: (r) => r.disponible ? 'Disponible' : 'Indisponible', cellTemplate: this.statusTpl, align: 'center' },
    ];
    const qp = this.route.snapshot.queryParamMap.get('idPrestataire');
    if (qp) this.filterPrestataireId.set(Number(qp));
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.service.findAll().subscribe({ next: (d) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  async remove(row: ServiceAgricoleResponse): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Supprimer le service', message: `Supprimer "${row.typeService}" ?`, danger: true });
    if (!ok) return;
    this.service.remove(row.idService).subscribe(() => { this.toast.success('Service supprimé.'); this.load(); });
  }

  toggleAvailability(row: ServiceAgricoleResponse): void {
    if (this.updatingIds().has(row.idService)) return;
    const updating = new Set(this.updatingIds());
    updating.add(row.idService);
    this.updatingIds.set(updating);
    const payload: ServiceAgricoleRequest = {
      typeService: row.typeService,
      description: row.description,
      coutEstime: row.coutEstime,
      imageUrl: row.imageUrl,
      disponible: !row.disponible,
      idPrestataire: row.idPrestataire,
    };
    this.service.update(row.idService, payload).subscribe({
      next: (updated) => {
        this.rows.update((rows) => rows.map((item) => item.idService === updated.idService ? updated : item));
        this.toast.success(updated.disponible ? 'Service rendu disponible.' : 'Service rendu indisponible.');
        this.finishAvailabilityUpdate(row.idService);
      },
      error: () => {
        this.toast.error('Impossible de modifier la disponibilité du service.');
        this.finishAvailabilityUpdate(row.idService);
      },
    });
  }

  private finishAvailabilityUpdate(id: number): void {
    const updating = new Set(this.updatingIds());
    updating.delete(id);
    this.updatingIds.set(updating);
  }
}
