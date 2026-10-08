import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { IntrantService } from './intrant.service';
import { AuthService } from '../../core/services/auth.service';
import { IntrantResponse } from '../../core/models';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { FileStorageService } from '../../core/services/file-storage.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-mes-intrants-list',
  standalone: true,
  imports: [RouterLink, MatIconModule, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './mes-intrants-list.component.html',
  styleUrl: './mes-intrants-list.component.scss',
})
export class MesIntrantsListComponent implements OnInit {
  private service = inject(IntrantService);
  private auth = inject(AuthService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private fileStorage = inject(FileStorageService);

  intrants = signal<IntrantResponse[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  selectedCategory = signal('Tous');

  readonly categories = ['Tous', 'Céréales', 'Maraîchage', 'Arboriculture', 'Rente'];

  filteredIntrants = computed(() => {
    const list = this.intrants();
    const query = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();

    return list.filter((item) => {
      // Filtre par catégorie si différent de 'Tous'
      const matchCategory =
        category === 'Tous' ||
        (item.typeIntrant && item.typeIntrant.toLowerCase().includes(category.toLowerCase())) ||
        item.nomIntrant.toLowerCase().includes(category.toLowerCase());

      // Filtre par recherche textuelle
      const matchQuery =
        !query ||
        item.nomIntrant.toLowerCase().includes(query) ||
        (item.typeIntrant && item.typeIntrant.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query));

      return matchCategory && matchQuery;
    });
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    const currentUser = this.auth.currentUser();
    if (!currentUser) {
      this.loading.set(false);
      return;
    }

    this.service.findByFournisseur(currentUser.id).subscribe({
      next: (data) => {
        this.intrants.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement intrants fournisseur :', err);
        this.loading.set(false);
      },
    });
  }

  formatPrix(prix: number | null | undefined): string {
    if (prix == null) return '0 FCFA';
    return `${prix.toLocaleString('fr-FR')} FCFA`;
  }

  getImageUrl(intrant: IntrantResponse): string {
    return this.fileStorage.resolveUrl(intrant.imageUrl) || '/imageHommeChampConnexionInscription.png';
  }

  onTabsWheel(event: WheelEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (event.deltaY !== 0) {
      target.scrollLeft += event.deltaY;
      event.preventDefault();
    }
  }

  async remove(intrant: IntrantResponse): Promise<void> {
    const ok = await this.confirm.ask({
      title: "Supprimer l'intrant",
      message: `Voulez-vous vraiment supprimer "${intrant.nomIntrant}" ?`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;

    this.service.remove(intrant.idIntrant).subscribe({
      next: () => {
        this.toast.success('Intrant supprimé avec succès.');
        this.load();
      },
      error: (err) => {
        console.error('Erreur suppression intrant :', err);
        this.toast.error("Impossible de supprimer cet intrant.");
      },
    });
  }
}
