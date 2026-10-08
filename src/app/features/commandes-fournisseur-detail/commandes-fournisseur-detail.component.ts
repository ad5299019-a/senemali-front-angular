import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommandeService } from '../commandes/commande.service';
import { UtilisateurService } from '../utilisateurs/utilisateur.service';
import {
  CommandeResponse,
  DetailCommandeResponse,
  StatutCommandeEnum,
  STATUT_COMMANDE_LABELS,
  UtilisateurResponse,
} from '../../core/models';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-commandes-fournisseur-detail',
  standalone: true,
  imports: [RouterLink, MatIconModule, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './commandes-fournisseur-detail.component.html',
  styleUrl: './commandes-fournisseur-detail.component.scss',
})
export class CommandesFournisseurDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private commandeService = inject(CommandeService);
  private utilisateurService = inject(UtilisateurService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  commande = signal<CommandeResponse | null>(null);
  client = signal<UtilisateurResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  actionLoading = signal(false);

  readonly StatutCommandeEnum = StatutCommandeEnum;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.error.set('Numéro de commande invalide.');
      this.loading.set(false);
      return;
    }
    this.loadCommande(id);
  }

  private loadCommande(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.commandeService.findById(id).subscribe({
      next: (data) => {
        this.commande.set(data);
        this.loading.set(false);

        if (data.idUtilisateur) {
          this.utilisateurService.findById(data.idUtilisateur).subscribe({
            next: (cl) => this.client.set(cl),
            error: () => {
              // Si les coordonnées complètes ne sont pas disponibles,
              // on conserve les données de nomUtilisateur présentes dans la commande.
            },
          });
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la commande :', err);
        this.error.set('Impossible de charger les détails de cette commande.');
        this.loading.set(false);
      },
    });
  }

  getDetailNom(detail: DetailCommandeResponse): string {
    return detail.nomIntrant || detail.nomProduit || 'Article';
  }

  formatMontant(montant: number | null | undefined): string {
    if (montant == null) return '0 FCFA';
    return `${montant.toLocaleString('fr-FR')} FCFA`;
  }

  getStatutLabel(statut: StatutCommandeEnum): string {
    return STATUT_COMMANDE_LABELS[statut] ?? statut;
  }

  getStatutClass(statut: StatutCommandeEnum): string {
    switch (statut) {
      case StatutCommandeEnum.EN_COURS:
        return 'badge-statut badge-en-cours';
      case StatutCommandeEnum.LIVREE:
        return 'badge-statut badge-livree';
      case StatutCommandeEnum.ANNULER:
        return 'badge-statut badge-annuler';
      default:
        return 'badge-statut badge-neutral';
    }
  }

  async refuserCommande(): Promise<void> {
    const c = this.commande();
    if (!c || c.status !== StatutCommandeEnum.EN_COURS) return;

    const ok = await this.confirmService.ask({
      title: 'Refuser la commande',
      message: `Êtes-vous sûr de vouloir refuser la commande N° ${c.idCommande} ? Son statut passera à "Annulée".`,
      confirmLabel: 'Refuser la commande',
      danger: true,
    });
    if (!ok) return;

    this.actionLoading.set(true);
    this.commandeService.updateStatut(c.idCommande, StatutCommandeEnum.ANNULER).subscribe({
      next: (updated) => {
        this.commande.set(updated);
        this.actionLoading.set(false);
        this.toast.success('La commande a été refusée (statut mis à jour : Annulée).');
      },
      error: (err) => {
        this.actionLoading.set(false);
        console.error('Erreur lors du refus de la commande :', err);
      },
    });
  }

  confirmerCommande(): void {
    const c = this.commande();
    if (!c || c.status !== StatutCommandeEnum.EN_COURS) return;
    this.toast.info("L'action de confirmation de commande n'est pas encore disponible sur le backend.");
  }
}
