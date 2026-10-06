import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { CommandeService } from './commande.service';
import { AgriculteurResponse, CommandeResponse, FournisseurResponse, IntrantResponse, ProduitAgricoleResponse, STATUT_COMMANDE_LABELS, StatutCommandeEnum, UtilisateurResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ToastService } from '../../core/services/toast.service';
import { UtilisateurService } from '../utilisateurs/utilisateur.service';
import { MatIconModule } from '@angular/material/icon';
import { ProduitService } from '../produits/produit.service';
import { IntrantService } from '../intrants/intrant.service';
import { AgriculteurService } from '../agriculteurs/agriculteur.service';
import { FournisseurService } from '../fournisseurs/fournisseur.service';

interface OrderSeller {
  id: number;
  kind: 'Agriculteur' | 'Fournisseur';
  name: string;
  telephone: string;
  localisation: string;
}

@Component({
  selector: 'app-commande-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, PageHeaderComponent, LoadingSpinnerComponent, MatIconModule],
  templateUrl: './commande-detail.component.html',
  styleUrl: './commande-detail.component.scss',
})
export class CommandeDetailComponent {
  private service = inject(CommandeService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private utilisateurService = inject(UtilisateurService);
  private produitService = inject(ProduitService);
  private intrantService = inject(IntrantService);
  private agriculteurService = inject(AgriculteurService);
  private fournisseurService = inject(FournisseurService);

  commande = signal<CommandeResponse | null>(null);
  client = signal<UtilisateurResponse | null>(null);
  sellers = signal<OrderSeller[]>([]);
  sellersLoading = signal(true);
  loading = signal(true);

  statutOptions = Object.entries(STATUT_COMMANDE_LABELS).map(([value, label]) => ({ value: value as StatutCommandeEnum, label }));

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.findById(id).subscribe({
      next: (data) => {
        this.commande.set(data);
        this.loading.set(false);
        this.utilisateurService.findById(data.idUtilisateur).subscribe({
          next: (client) => this.client.set(client),
          error: () => this.toast.info('Les coordonnées du client ne sont pas disponibles pour cette commande.'),
        });
        this.loadSellers(data);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadSellers(commande: CommandeResponse): void {
    const productIds = [...new Set(commande.details.flatMap((detail) => detail.idProduit == null ? [] : [detail.idProduit]))];
    const intrantIds = [...new Set(commande.details.flatMap((detail) => detail.idIntrant == null ? [] : [detail.idIntrant]))];

    forkJoin({
      produits: productIds.length
        ? forkJoin(productIds.map((id) => this.produitService.findById(id)))
        : of<ProduitAgricoleResponse[]>([]),
      intrants: intrantIds.length
        ? forkJoin(intrantIds.map((id) => this.intrantService.findById(id)))
        : of<IntrantResponse[]>([]),
    }).subscribe({
      next: ({ produits, intrants }) => {
        const farmerIds = [...new Set(produits.map((product) => product.idAgriculteur))];
        const supplierIds = [...new Set(intrants.map((intrant) => intrant.idFournisseur))];
        forkJoin({
          agriculteurs: farmerIds.length
            ? forkJoin(farmerIds.map((id) => this.agriculteurService.findById(id)))
            : of<AgriculteurResponse[]>([]),
          fournisseurs: supplierIds.length
            ? forkJoin(supplierIds.map((id) => this.fournisseurService.findById(id)))
            : of<FournisseurResponse[]>([]),
        }).subscribe({
          next: ({ agriculteurs, fournisseurs }) => this.sellers.set([
            ...agriculteurs.map((farmer) => this.toSeller(farmer, 'Agriculteur', farmer.idAgriculteur)),
            ...fournisseurs.map((supplier) => this.toSeller(supplier, 'Fournisseur', supplier.idFournisseur)),
          ]),
          complete: () => this.sellersLoading.set(false),
          error: () => {
            this.sellersLoading.set(false);
            this.toast.info('Les coordonnées du vendeur ne sont pas disponibles pour cette commande.');
          },
        });
      },
      error: () => {
        this.sellersLoading.set(false);
        this.toast.info('Impossible de retrouver les vendeurs des articles commandés.');
      },
    });
  }

  private toSeller(
    profile: AgriculteurResponse | FournisseurResponse,
    kind: OrderSeller['kind'],
    id: number,
  ): OrderSeller {
    return {
      id,
      kind,
      name: `${profile.prenom} ${profile.nom}`.trim(),
      telephone: profile.telephone,
      localisation: profile.localisation,
    };
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR');
  }

  updateStatut(statut: StatutCommandeEnum): void {
    const c = this.commande();
    if (!c) return;
    this.service.updateStatut(c.idCommande, statut).subscribe((updated) => {
      this.commande.set(updated);
      this.toast.success('Statut de la commande mis à jour.');
    });
  }
}
