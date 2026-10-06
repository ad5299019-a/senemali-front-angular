import { Component, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PrixMarcheService } from './prix-marche.service';
import { PrixMarcheResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/components/data-table/column-def';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-prix-marche-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, DataTableComponent, MatIconModule],
  templateUrl: './prix-marche-list.component.html',
  styleUrl: './prix-marche-list.component.scss',
})
export class PrixMarcheListComponent {
  private service = inject(PrixMarcheService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);

  rows = signal<PrixMarcheResponse[]>([]);
  loading = signal(true);

  @ViewChild('productTpl', { static: true }) productTpl!: TemplateRef<{ $implicit: PrixMarcheResponse }>;
  @ViewChild('priceTpl', { static: true }) priceTpl!: TemplateRef<{ $implicit: PrixMarcheResponse }>;
  @ViewChild('locationTpl', { static: true }) locationTpl!: TemplateRef<{ $implicit: PrixMarcheResponse }>;
  @ViewChild('dateTpl', { static: true }) dateTpl!: TemplateRef<{ $implicit: PrixMarcheResponse }>;
  columns: ColumnDef<PrixMarcheResponse>[] = [];

  ngOnInit(): void {
    this.columns = [
      { header: 'Produit', accessor: (r) => r.nomProduit, cellTemplate: this.productTpl, width: '25%' },
      { header: 'Prix observé', accessor: (r) => `${r.prixProduit.toLocaleString('fr-FR')} FCFA / ${r.unite}`, cellTemplate: this.priceTpl, width: '24%' },
      { header: 'Localisation', accessor: (r) => r.localisation, cellTemplate: this.locationTpl },
      { header: 'Date d’observation', accessor: (r) => new Date(r.dateObserv).toLocaleDateString('fr-FR'), cellTemplate: this.dateTpl },
    ];
    this.load();
  }

  formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Date non renseignée' : date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  formatPrice(value: number): string {
    return value.toLocaleString('fr-FR');
  }

  private load(): void {
    this.loading.set(true);
    this.service.findAll().subscribe({ next: (d) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  async remove(row: PrixMarcheResponse): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Supprimer le relevé', message: `Supprimer le prix de "${row.nomProduit}" ?`, danger: true });
    if (!ok) return;
    this.service.remove(row.idPrix).subscribe(() => { this.toast.success('Relevé supprimé.'); this.load(); });
  }
}
