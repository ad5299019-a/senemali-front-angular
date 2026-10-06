import { Component, computed, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ColumnDef } from './column-def';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

/**
 * Tableau générique piloté par une config de colonnes (ColumnDef<T>[]).
 * Utilisé par toutes les listes (Cultures, Conseils, Tutoriels, Commandes,
 * Utilisateurs, ...) pour éviter de réécrire pagination/empty-state/loading
 * dans chaque module. Le contenu d'une cellule peut être personnalisé via
 * cellTemplate (ex: badge de statut, miniature d'image).
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgTemplateOutlet, EmptyStateComponent, LoadingSpinnerComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T> {
  columns = input.required<ColumnDef<T>[]>();
  rows = input.required<T[]>();
  loading = input<boolean>(false);
  pageSize = input<number>(10);
  emptyTitle = input<string>('Aucun élément');
  emptyDescription = input<string>('');
  showActions = input<boolean>(true);
  rowActionsTemplate = input<any>(null);
  trackBy = input<(row: T) => unknown>((row: T) => row);

  page = signal(1);

  totalPages = computed(() => Math.max(1, Math.ceil(this.rows().length / this.pageSize())));

  pagedRows = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.rows().slice(start, start + this.pageSize());
  });
}
