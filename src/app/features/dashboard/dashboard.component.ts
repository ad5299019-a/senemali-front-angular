import { Component, inject, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { RoleEnum, StatutValidationFournisseur } from '../../core/models/enums';
import { FournisseurResponse, IntrantResponse, STATUT_COMMANDE_LABELS, UtilisateurResponse } from '../../core/models';
import { FileStorageService } from '../../core/services/file-storage.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { UtilisateurService } from '../utilisateurs/utilisateur.service';
import { AgriculteurService } from '../agriculteurs/agriculteur.service';
import { AcheteurService } from '../acheteurs/acheteur.service';
import { FournisseurService } from '../fournisseurs/fournisseur.service';
import { CommandeService } from '../commandes/commande.service';
import { IntrantService } from '../intrants/intrant.service';
import { MatIconModule } from '@angular/material/icon';
import { DashboardPriorityPanelComponent } from './dashboard-priority-panel.component';
import { PartenaireService } from '../partenaires/partenaire.service';
import { PrestataireService } from '../prestataires/prestataire.service';
import { CultureService } from '../cultures/culture.service';
import { ServiceAgricoleService } from '../services-agricoles/service-agricole.service';

interface AdminStats {
  utilisateursActifs: number;
  totalAgriculteurs: number;
  totalAcheteurs: number;
  totalFournisseurs: number;
  fournisseursEnAttente: number;
  totalFinanciers: number;
  totalPrestataires: number;
  totalCultures: number;
  totalServicesAgricoles: number;
  totalCommandes: number;
  intrantsEnAttente: number;
  commandesProduitsAgricoles: number;
  commandesIntrants: number;
}

interface ModerationItem {
  id: string;
  title: string;
  detail: string;
  initials: string;
  imageUrl: string | null;
  type: 'compte' | 'intrant';
  action: string;
}

interface FournisseurStats {
  totalIntrants: number;
  intrantsValides: number;
  intrantsEnAttente: number;
  intrantsRefuses: number;
}

interface RecentOrder {
  idCommande: number;
  orderDate: string;
  dateLabel: string;
  amountLabel: string;
  clientName: string;
  category: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, StatCardComponent, LoadingSpinnerComponent, MatIconModule, DashboardPriorityPanelComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnDestroy {
  private auth = inject(AuthService);
  private utilisateurService = inject(UtilisateurService);
  private agriculteurService = inject(AgriculteurService);
  private acheteurService = inject(AcheteurService);
  private fournisseurService = inject(FournisseurService);
  private commandeService = inject(CommandeService);
  private intrantService = inject(IntrantService);
  private partenaireService = inject(PartenaireService);
  private prestataireService = inject(PrestataireService);
  private cultureService = inject(CultureService);
  private serviceAgricoleService = inject(ServiceAgricoleService);
  private files = inject(FileStorageService);

  isAdmin = signal(this.auth.currentUser()?.role === RoleEnum.ADMIN);
  loading = signal(true);
  adminStats = signal<AdminStats | null>(null);
  fournisseurStats = signal<FournisseurStats | null>(null);
  moderationItems = signal<ModerationItem[]>([]);
  recentOrders = signal<RecentOrder[]>([]);
  activeSlide = signal(0);

  readonly carouselSlides = [
    {
      image: 'https://images.unsplash.com/photo-1741874299706-2b8e16839aaa?auto=format&fit=crop&w=2000&q=90',
      position: 'center 48%',
      alt: 'Un agriculteur inspecte des plants dans un champ',
      title: 'Au cœur des cultures',
      description: 'Suivez les cultures et les services qui font grandir la plateforme.',
      link: '/cultures',
      action: 'Voir les cultures',
    },
    {
      image: 'https://images.unsplash.com/photo-1599320092708-8a9dde49fc2c?auto=format&fit=crop&w=2000&q=90',
      position: 'center 54%',
      alt: 'Des semences sélectionnées dans les mains d’un agriculteur',
      title: 'Des semences de qualité',
      description: 'Contrôlez les intrants proposés avant leur publication sur la marketplace.',
      link: '/validations',
      action: 'Gérer les validations',
    },
    {
      image: 'https://images.unsplash.com/photo-1734255026082-82fdc81991f0?auto=format&fit=crop&w=2000&q=90',
      position: 'center 52%',
      alt: 'Une vendeuse présente ses tomates sur un marché ouest-africain',
      title: 'Au plus près de la communauté',
      description: 'Reliez les agriculteurs, fournisseurs et vendeurs autour des produits locaux.',
      link: '/utilisateurs',
      action: 'Voir les utilisateurs',
    },
  ];

  welcomeMessage = signal(`Bienvenue, ${this.auth.currentUser()?.prenom ?? ''}`);
  private carouselTimer: ReturnType<typeof setInterval> | null = null;

  pageTitle(): string {
    return this.isAdmin() ? "Vue d'ensemble de la plateforme" : 'Tableau de bord';
  }

  userBreakdown(): string {
    const stats = this.adminStats();
    return stats
      ? `${stats.totalAgriculteurs} agriculteurs · ${stats.totalAcheteurs} acheteurs · ${stats.totalFournisseurs} fournisseurs`
      : '';
  }

  ordersBreakdown(): string {
    const stats = this.adminStats();
    return stats
      ? `${stats.commandesProduitsAgricoles} produits agricoles · ${stats.commandesIntrants} intrants`
      : '';
  }

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.carouselTimer = setInterval(() => this.nextSlide(), 6000);
      this.loadAdminStats();
    } else {
      this.loadFournisseurStats();
    }
  }

  ngOnDestroy(): void {
    if (this.carouselTimer) clearInterval(this.carouselTimer);
  }

  nextSlide(): void {
    this.activeSlide.update((index) => (index + 1) % this.carouselSlides.length);
  }

  previousSlide(): void {
    this.activeSlide.update((index) => (index - 1 + this.carouselSlides.length) % this.carouselSlides.length);
  }

  private loadAdminStats(): void {
    forkJoin({
      utilisateurs: this.utilisateurService.findAll(),
      agriculteurs: this.agriculteurService.findAll(),
      acheteurs: this.acheteurService.findAll(),
      fournisseurs: this.fournisseurService.findAll(),
      commandes: this.commandeService.findAll(),
      partenaires: this.partenaireService.findAll(),
      prestataires: this.prestataireService.findAll(),
      cultures: this.cultureService.findAll(),
      servicesAgricoles: this.serviceAgricoleService.findAll(),
      intrants: this.intrantService.findAll(),
    }).subscribe({
      next: (res) => {
        const supplierAccountsToReview = res.fournisseurs.filter((fournisseur) =>
          fournisseur.statutFournisseur === StatutValidationFournisseur.EN_ATTENTE ||
          (!fournisseur.statut && fournisseur.statutFournisseur !== StatutValidationFournisseur.REFUSE)
        );
        const supplierUserIds = new Set(res.fournisseurs.map((fournisseur) => fournisseur.id));
        const supplierUsersToReview = res.utilisateurs.filter((user) =>
          user.role === RoleEnum.FOURNISSEUR &&
          !supplierUserIds.has(user.id)
        );
        const accountsToReview: (FournisseurResponse | UtilisateurResponse)[] = [
          ...supplierAccountsToReview,
          ...supplierUsersToReview,
        ];
        const intrantsToReview = res.intrants.filter((intrant) =>
          intrant.statutIntrant === StatutValidationFournisseur.EN_ATTENTE
        );
        const ordersForAgriculturalProducts = res.commandes.filter(
          (commande) => commande.details.some((detail) => detail.idProduit != null)
        );
        const ordersForIntrants = res.commandes.filter(
          (commande) => commande.details.some((detail) => detail.idIntrant != null)
        );
        this.adminStats.set({
          utilisateursActifs: res.utilisateurs.filter((user) => user.statut).length,
          totalAgriculteurs: res.agriculteurs.length,
          totalAcheteurs: res.acheteurs.length,
          totalFournisseurs: res.fournisseurs.length,
          fournisseursEnAttente: accountsToReview.length,
          totalFinanciers: res.partenaires.length,
          totalPrestataires: res.prestataires.length,
          totalCultures: res.cultures.length,
          totalServicesAgricoles: res.servicesAgricoles.length,
          totalCommandes: res.commandes.length,
          intrantsEnAttente: intrantsToReview.length,
          commandesProduitsAgricoles: ordersForAgriculturalProducts.length,
          commandesIntrants: ordersForIntrants.length,
        });
        this.recentOrders.set(
          res.commandes
            .flatMap((commande): RecentOrder[] => {
              const hasAgriculturalProducts = commande.details.some((detail) => detail.idProduit != null);
              const hasIntrants = commande.details.some((detail) => detail.idIntrant != null);
              if (!hasAgriculturalProducts && !hasIntrants) return [];
              return [{
                idCommande: commande.idCommande,
                orderDate: commande.dateCommande,
                dateLabel: new Date(commande.dateCommande).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
                amountLabel: `${commande.montantTotal.toLocaleString('fr-FR')} FCFA`,
                clientName: commande.nomUtilisateur || 'Client',
                category: hasAgriculturalProducts && hasIntrants
                  ? 'Produits et intrants'
                  : hasAgriculturalProducts ? 'Produits agricoles' : 'Intrants',
                status: STATUT_COMMANDE_LABELS[commande.status],
              }];
            })
            .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
            .slice(0, 5)
        );
        this.moderationItems.set([
          ...accountsToReview.map((fournisseur) => this.accountModerationItem(fournisseur)),
          ...intrantsToReview.map((intrant) => this.intrantModerationItem(intrant)),
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private accountModerationItem(account: FournisseurResponse | UtilisateurResponse): ModerationItem {
    return {
      id: `account-${account.id}`,
      title: `${account.prenom} ${account.nom}`,
      detail: `Nouveau compte fournisseur · ${account.localisation || 'Localisation à vérifier'}`,
      initials: `${account.prenom.charAt(0)}${account.nom.charAt(0)}`.toUpperCase(),
      imageUrl: this.files.resolveUrl(account.photoProfil),
      type: 'compte',
      action: 'Valider',
    };
  }

  private intrantModerationItem(intrant: IntrantResponse): ModerationItem {
    return {
      id: `intrant-${intrant.idIntrant}`,
      title: intrant.nomIntrant,
      detail: `Fiche produit · ${intrant.nomFournisseur || 'Fournisseur'}`,
      initials: '',
      imageUrl: this.files.resolveUrl(intrant.imageUrl),
      type: 'intrant',
      action: 'Examiner',
    };
  }

  private loadFournisseurStats(): void {
    const idFournisseur = this.auth.currentUser()!.id;
    this.intrantService.findByFournisseur(idFournisseur).subscribe({
      next: (intrants) => {
        this.fournisseurStats.set({
          totalIntrants: intrants.length,
          intrantsValides: intrants.filter((i) => i.statutIntrant === StatutValidationFournisseur.VALIDE).length,
          intrantsEnAttente: intrants.filter((i) => i.statutIntrant === StatutValidationFournisseur.EN_ATTENTE).length,
          intrantsRefuses: intrants.filter((i) => i.statutIntrant === StatutValidationFournisseur.REFUSE).length,
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
