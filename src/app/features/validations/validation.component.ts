import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { catchError, forkJoin, of } from 'rxjs';
import { FournisseurResponse, IntrantResponse, STATUT_VALIDATION_LABELS, StatutValidationFournisseur, UtilisateurResponse } from '../../core/models';
import { RoleEnum } from '../../core/models/enums';
import { ConfirmService } from '../../core/services/confirm.service';
import { FileStorageService } from '../../core/services/file-storage.service';
import { ToastService } from '../../core/services/toast.service';
import { FournisseurService } from '../fournisseurs/fournisseur.service';
import { IntrantService } from '../intrants/intrant.service';
import { UtilisateurService } from '../utilisateurs/utilisateur.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

type ValidationTab = 'intrants' | 'comptes';
type IntrantFilter = 'TOUS' | StatutValidationFournisseur;

interface AccountReviewItem {
  user: UtilisateurResponse;
  supplier: FournisseurResponse | null;
}

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [MatIconModule, PageHeaderComponent, DecimalPipe],
  templateUrl: './validation.component.html',
  styleUrl: './validation.component.scss',
})
export class ValidationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fournisseurs = inject(FournisseurService);
  private readonly intrants = inject(IntrantService);
  private readonly utilisateurs = inject(UtilisateurService);
  private readonly files = inject(FileStorageService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly StatutFournisseur = StatutValidationFournisseur;
  readonly activeTab = signal<ValidationTab>('intrants');
  readonly intrantFilter = signal<IntrantFilter>(StatutValidationFournisseur.EN_ATTENTE);
  readonly intrantsList = signal<IntrantResponse[]>([]);
  readonly accounts = signal<FournisseurResponse[]>([]);
  readonly supplierUsers = signal<UtilisateurResponse[]>([]);
  readonly processingAccountIds = signal<Set<number>>(new Set());
  readonly processingIntrantIds = signal<Set<number>>(new Set());
  readonly intrantsLoading = signal(true);
  readonly accountsLoading = signal(true);
  readonly accountsLoadError = signal(false);
  readonly supplierProfilesLoadError = signal(false);

  readonly pendingIntrants = computed(() => this.intrantsList().filter((intrant) => intrant.statutIntrant === StatutValidationFournisseur.EN_ATTENTE));
  readonly filteredIntrants = computed(() => {
    const filter = this.intrantFilter();
    return filter === 'TOUS' ? this.intrantsList() : this.intrantsList().filter((intrant) => intrant.statutIntrant === filter);
  });
  readonly accountsToReview = computed<AccountReviewItem[]>(() => {
    const suppliers = this.accounts();
    const supplierUsers = this.supplierUsers();
    const reviewedUserIds = new Set<number>();
    const reviewItems: AccountReviewItem[] = [];

    for (const supplier of suppliers) {
      const user = supplierUsers.find((candidate) => candidate.id === supplier.id) ?? supplier;
      reviewedUserIds.add(user.id);
      if (
        supplier.statutFournisseur === StatutValidationFournisseur.EN_ATTENTE ||
        (!user.statut && supplier.statutFournisseur !== StatutValidationFournisseur.REFUSE) ||
        !supplier.statutFournisseur
      ) {
        reviewItems.push({ user, supplier });
      }
    }

    for (const user of supplierUsers) {
      if (reviewedUserIds.has(user.id)) continue;
      reviewItems.push({ user, supplier: null });
    }
    return reviewItems;
  });
  readonly pendingCount = computed(() => this.pendingIntrants().length + this.accountsToReview().length);

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'comptes' || tab === 'intrants') this.activeTab.set(tab);
    this.loadIntrants();
    this.loadAccounts();
  }

  setIntrantFilter(event: Event): void {
    if (!(event.target instanceof HTMLSelectElement)) return;
    const value = event.target.value;
    if (value === 'TOUS' || Object.values(StatutValidationFournisseur).includes(value as StatutValidationFournisseur)) {
      this.intrantFilter.set(value as IntrantFilter);
    }
  }

  imageUrl(intrant: IntrantResponse): string | null {
    return this.files.resolveUrl(intrant.imageUrl);
  }

  statutLabel(status: StatutValidationFournisseur): string {
    return STATUT_VALIDATION_LABELS[status];
  }

  isIntrantProcessing(intrant: IntrantResponse): boolean {
    return this.processingIntrantIds().has(intrant.idIntrant);
  }

  accountStatus(status: StatutValidationFournisseur): string {
    const label = status === StatutValidationFournisseur.VALIDE
      ? 'validé'
      : status === StatutValidationFournisseur.REFUSE
        ? 'refusé'
        : 'en attente';
    return `Validation fournisseur : ${label}`;
  }

  initials(account: UtilisateurResponse): string {
    return `${account.prenom.charAt(0)}${account.nom.charAt(0)}`.toUpperCase();
  }

  isAccountProcessing(account: AccountReviewItem): boolean {
    return this.processingAccountIds().has(account.user.id);
  }

  async reviewIntrant(intrant: IntrantResponse, status: StatutValidationFournisseur): Promise<void> {
    const label = STATUT_VALIDATION_LABELS[status];
    const ok = await this.confirm.ask({
      title: `${label} l'intrant`,
      message: `Confirmer : ${label.toLowerCase()} l'intrant « ${intrant.nomIntrant} » de ${intrant.nomFournisseur || 'ce fournisseur'} ?`,
      danger: status === StatutValidationFournisseur.REFUSE,
    });
    if (!ok) return;

    this.setIntrantProcessing(intrant.idIntrant, true);
    this.intrants.valider(intrant.idIntrant, status).subscribe({
      next: () => {
        this.setIntrantProcessing(intrant.idIntrant, false);
        this.toast.success(`Intrant « ${intrant.nomIntrant} » ${label.toLowerCase()}.`);
        this.loadIntrants();
      },
      error: () => this.setIntrantProcessing(intrant.idIntrant, false),
    });
  }

  private setIntrantProcessing(id: number, processing: boolean): void {
    this.processingIntrantIds.update((ids) => {
      const next = new Set(ids);
      if (processing) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async reviewAccount(item: AccountReviewItem, status: StatutValidationFournisseur): Promise<void> {
    const account = item.supplier;
    if (!account) {
      if (status !== StatutValidationFournisseur.VALIDE) return;
      if (item.user.statut) {
        this.toast.error('Le profil fournisseur est absent. La validation doit être faite depuis la gestion des utilisateurs.');
        return;
      }
      this.setAccountProcessing(item.user.id, true);
      this.utilisateurs.toggleStatut(item.user.id).subscribe({
        next: () => {
          this.setAccountProcessing(item.user.id, false);
          this.toast.success('Compte fournisseur activé.');
          this.loadAccounts();
        },
        error: () => {
          this.setAccountProcessing(item.user.id, false);
          this.toast.error('Impossible d’activer ce compte fournisseur.');
        },
      });
      return;
    }

    const approving = status === StatutValidationFournisseur.VALIDE;
    const decision = approving ? 'approuver' : 'refuser';
    const ok = await this.confirm.ask({
      title: `${approving ? 'Approuver' : 'Refuser'} le compte fournisseur`,
      message: `Voulez-vous ${decision} le compte de ${item.user.prenom} ${item.user.nom} ?`,
      danger: !approving,
    });
    if (!ok) return;

    this.setAccountProcessing(item.user.id, true);
    this.fournisseurs.valider(account.idFournisseur, status).subscribe({
      next: () => {
        const needsActivation = approving && !item.user.statut;
        const needsDeactivation = !approving && item.user.statut;
        if (needsActivation || needsDeactivation) {
          this.utilisateurs.toggleStatut(item.user.id).subscribe({
            next: () => {
              this.setAccountProcessing(item.user.id, false);
              this.toast.success(approving
                ? 'Fournisseur validé et compte activé.'
                : 'Fournisseur refusé et compte désactivé.');
              this.loadAccounts();
            },
            error: () => {
              this.setAccountProcessing(item.user.id, false);
              this.loadAccounts();
            },
          });
          return;
        }
        this.setAccountProcessing(item.user.id, false);
        this.toast.success(`Fournisseur ${approving ? 'validé' : 'refusé'}.`);
        this.loadAccounts();
      },
      error: () => {
        this.setAccountProcessing(item.user.id, false);
        this.toast.error('La validation du fournisseur a échoué.');
      },
    });
  }

  private setAccountProcessing(id: number, processing: boolean): void {
    this.processingAccountIds.update((ids) => {
      const next = new Set(ids);
      if (processing) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  private loadIntrants(): void {
    this.intrantsLoading.set(true);
    this.intrants.findAll().subscribe({
      next: (data) => {
        this.intrantsList.set(data);
        this.intrantsLoading.set(false);
      },
      error: () => this.intrantsLoading.set(false),
    });
  }

  private loadAccounts(): void {
    this.accountsLoading.set(true);
    this.accountsLoadError.set(false);
    this.supplierProfilesLoadError.set(false);
    forkJoin({
      suppliers: this.fournisseurs.findAll().pipe(catchError(() => {
        this.supplierProfilesLoadError.set(true);
        return of<FournisseurResponse[]>([]);
      })),
      users: this.utilisateurs.findAll(),
    }).subscribe({
      next: ({ suppliers, users }) => {
        this.accounts.set(suppliers);
        this.supplierUsers.set(users.filter((user) => user.role === RoleEnum.FOURNISSEUR));
        this.accountsLoading.set(false);
      },
      error: () => {
        this.accountsLoadError.set(true);
        this.accountsLoading.set(false);
        this.toast.error('Impossible de récupérer les fournisseurs à valider. Réessayez dans quelques instants.');
      },
    });
  }
}
