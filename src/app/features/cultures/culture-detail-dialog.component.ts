import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CultureResponse } from '../../core/models';
import { FileStorageService } from '../../core/services/file-storage.service';

@Component({
  selector: 'app-culture-detail-dialog',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './culture-detail-dialog.component.html',
  styleUrl: './culture-detail-dialog.component.scss',
})
export class CultureDetailDialogComponent {
  private files = inject(FileStorageService);

  culture = input.required<CultureResponse>();

  closed = output<void>();
  edit = output<CultureResponse>();
  delete = output<CultureResponse>();

  imageError = signal(false);

  imageUrl = computed(() => {
    if (this.imageError()) return null;
    return this.files.resolveUrl(this.culture().imageUrl);
  });

  hasDescription = computed(() => {
    const desc = this.culture().description;
    return !!desc && desc.trim().length > 0;
  });

  close(): void {
    this.closed.emit();
  }

  onEdit(): void {
    this.edit.emit(this.culture());
  }

  onDelete(): void {
    this.delete.emit(this.culture());
  }

  onImageError(): void {
    this.imageError.set(true);
  }
}
