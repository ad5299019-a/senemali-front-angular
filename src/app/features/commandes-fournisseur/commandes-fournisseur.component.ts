import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommandeService } from '../commandes/commande.service';
import { CommandeResponse, StatutCommandeEnum, STATUT_COMMANDE_LABELS } from '../../core/models';
import { StatCardComponent } from '../../shared/components/stat-card-2/stat-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-commandes-fournisseur',
  standalone: true,
  imports: [StatCardComponent, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './commandes-fournisseur.component.html',
  styleUrl: './commandes-fournisseur.component.scss',
})
export class CommandesFournisseurComponent implements OnInit {
  private commandeService = inject(CommandeService);
  private router = inject(Router);

  commandes = signal<CommandeResponse[]>([]);
  loading = signal(true);

  totalCommandes = computed(() => this.commandes().length);
  cancelledCommandes = computed(() => this.commandes().filter((c) => c.status === StatutCommandeEnum.ANNULER).length);
  deliveredCommandes = computed(() => this.commandes().filter((c) => c.status === StatutCommandeEnum.LIVREE).length);

  ngOnInit(): void {
    this.loadCommandes();
  }

  private loadCommandes(): void {
    this.loading.set(true);

    this.commandeService.findFournisseurCommande().subscribe({
      next: (commandes) => {
        this.commandes.set(commandes);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes :', error);
        this.loading.set(false);
      },
    });
  }

  onSelectCommande(idCommande: number): void {
    this.router.navigate(['/fournisseur/commandes', idCommande]);
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? dateStr
      : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
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
      case StatutCommandeEnum.LIVREE:
        return 'badge-statut badge-livree';
      case StatutCommandeEnum.EN_COURS:
        return 'badge-statut badge-en-cours';
      case StatutCommandeEnum.ANNULER:
        return 'badge-statut badge-annuler';
      default:
        return 'badge-statut badge-neutral';
    }
  }
}