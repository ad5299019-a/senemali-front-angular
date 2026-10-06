import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FileStorageService, UploadFolder } from '../../../core/services/file-storage.service';
import { ToastService } from '../../../core/services/toast.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
})
export class FileUploadComponent {
  private fileStorage = inject(FileStorageService);
  private toast = inject(ToastService);

  folder = input.required<UploadFolder>();
  videosEnabled = input(false);
  /** URL déjà connue (édition d'une ressource existante) */
  initialUrl = input<string | null>(null);

  /** Émet l'URL du fichier une fois l'upload terminé (à mettre dans le form) */
  uploaded = output<string>();
  mediaUploaded = output<{ fileUrl: string; isVideo: boolean }>();

  dragging = signal(false);
  uploading = signal(false);
  previewUrl = signal<string | null>(null);
  previewIsVideo = signal(false);

  private syncInitialPreview = effect(() => {
    const url = this.initialUrl();
    if (this.uploading()) return;
    this.previewUrl.set(this.fileStorage.resolveUrl(url));
    this.previewIsVideo.set(/\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(url ?? ''));
  });

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.handleFile(file);
  }

  clear(): void {
    this.previewUrl.set(null);
    this.previewIsVideo.set(false);
    this.uploaded.emit('');
  }

  private handleFile(file: File): void {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !(this.videosEnabled() && isVideo)) {
      this.toast.error(this.videosEnabled() ? 'Choisissez une image ou une vidéo.' : 'Seules les images sont acceptées.');
      return;
    }
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toast.error(`Fichier trop volumineux (${isVideo ? '100' : '10'} Mo max).`);
      return;
    }
    this.uploading.set(true);
    this.fileStorage.upload(file, this.folder()).subscribe({
      next: (result) => {
        this.previewUrl.set(this.fileStorage.resolveUrl(result.fileUrl));
        this.previewIsVideo.set(isVideo);
        this.uploaded.emit(result.fileUrl);
        this.mediaUploaded.emit({ fileUrl: result.fileUrl, isVideo });
        this.uploading.set(false);
      },
      error: () => this.uploading.set(false),
    });
  }
}
