import { Component, inject, signal, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProduitService } from './produit.service';
import { AgriculteurResponse, ProduitAgricoleResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/components/data-table/column-def';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { AgriculteurService } from '../agriculteurs/agriculteur.service';
import { FileStorageService } from '../../core/services/file-storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [PageHeaderComponent, DataTableComponent, StatusBadgeComponent, MatIconModule],
  templateUrl: './produit-list.component.html',
  styleUrl: './produit-list.component.scss',
})
export class ProduitListComponent implements OnDestroy {
  private service = inject(ProduitService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private agriculteurService = inject(AgriculteurService);
  private files = inject(FileStorageService);
  private farmerSubscription?: Subscription;

  rows = signal<ProduitAgricoleResponse[]>([]);
  loading = signal(true);
  selectedProduct = signal<ProduitAgricoleResponse | null>(null);
  productOwner = signal<AgriculteurResponse | null>(null);
  ownerLoading = signal(false);
  ownerLoadError = signal(false);

  @ViewChild('productNameTpl', { static: true }) productNameTpl!: TemplateRef<{ $implicit: ProduitAgricoleResponse }>;

  columns: ColumnDef<ProduitAgricoleResponse>[] = [];

  ngOnInit(): void {
    this.columns = [
    { header: 'Produit', accessor: (r) => r.nomProduit, cellTemplate: this.productNameTpl },
    { header: 'Agriculteur', accessor: (r) => r.nomAgriculteur ?? '—' },
    { header: 'Quantité', accessor: (r) => `${r.quantite} ${r.unite}`, align: 'right' },
    { header: 'Prix', accessor: (r) => `${r.prix.toLocaleString('fr-FR')} FCFA`, align: 'right' },
    { header: 'Publié le', accessor: (r) => new Date(r.datePub).toLocaleDateString('fr-FR') },
    ];
    this.load();
  }

  ngOnDestroy(): void {
    this.farmerSubscription?.unsubscribe();
  }

  openProductDetails(product: ProduitAgricoleResponse): void {
    this.farmerSubscription?.unsubscribe();
    this.selectedProduct.set(product);
    this.productOwner.set(null);
    this.ownerLoadError.set(false);
    this.ownerLoading.set(true);
    this.farmerSubscription = this.agriculteurService.findById(product.idAgriculteur).subscribe({
      next: (owner) => {
        this.productOwner.set(owner);
        this.ownerLoading.set(false);
      },
      error: () => {
        this.ownerLoadError.set(true);
        this.ownerLoading.set(false);
      },
    });
  }

  closeProductDetails(): void {
    this.farmerSubscription?.unsubscribe();
    this.selectedProduct.set(null);
    this.ownerLoading.set(false);
  }

  imageUrl(url: string | null | undefined): string | null {
    return this.files.resolveUrl(url);
  }

  formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date);
  }

  private load(): void {
    this.loading.set(true);
    this.service.findAll().subscribe({ next: (d) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  async remove(row: ProduitAgricoleResponse): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Retirer le produit',
      message: `Retirer "${row.nomProduit}" de la marketplace ? L'agriculteur ne pourra plus le vendre via ce produit.`,
      danger: true,
    });
    if (!ok) return;
    this.service.remove(row.idProduit).subscribe(() => { this.toast.success('Produit retiré.'); this.load(); });
  }
}
