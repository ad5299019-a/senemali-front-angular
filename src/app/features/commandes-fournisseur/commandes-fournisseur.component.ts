import { Component, computed, inject, signal } from '@angular/core';
import { CommandeService } from '../commandes/commande.service';
import { CommandeResponse } from '../../core/models';
import { StatCardComponent } from '../../shared/components/stat-card-2/stat-card.component';

@Component({
  selector: 'app-commandes-fournisseur',
  standalone: true,
  imports: [StatCardComponent],
  templateUrl: './commandes-fournisseur.component.html',
  styleUrl: './commandes-fournisseur.component.scss',
})
export class CommandesFournisseurComponent {

  private commandeService = inject(CommandeService);

  commandes = signal<CommandeResponse[]>([]);
  loading = signal(true);

  totalCommandes = computed(() => this.commandes().length);
  cancelledCommandes = computed(() => this.commandes().filter(c => c.status === 'ANNULER').length);
  deliveredCommandes = computed(() => this.commandes().filter(c => c.status === 'LIVREE').length);
  

  ngOnInit(): void {
    this.loadCommandes();
  }

  private loadCommandes(): void {
    this.loading.set(true);

    this.commandeService.findFournisseurCommande().subscribe({
      next: (commandes) => {
        console.log('COMMANDES FOURNISSEUR :', commandes);
        this.commandes.set(commandes);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes :', error);
        this.loading.set(false);
      },
    });
  }
}