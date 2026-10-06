import { TemplateRef } from '@angular/core';

export interface ColumnDef<T> {
  header: string;
  accessor: (row: T) => string | number | null | undefined;
  align?: 'left' | 'right' | 'center';
  /** Optionnel : template custom pour une cellule (badge de statut, image, ...) */
  cellTemplate?: TemplateRef<{ $implicit: T }>;
  width?: string;
}
