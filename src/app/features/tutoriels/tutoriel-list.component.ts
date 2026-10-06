import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TutorielService } from './tutoriel.service';
import { TutorielResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { FileStorageService } from '../../core/services/file-storage.service';

@Component({
  selector: 'app-tutoriel-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent],
  templateUrl: './tutoriel-list.component.html',
  styleUrl: './tutoriel-list.component.scss',
})
export class TutorielListComponent {
  private service = inject(TutorielService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private files = inject(FileStorageService);

  rows = signal<TutorielResponse[]>([]);
  loading = signal(true);
  selected = signal<TutorielResponse | null>(null);

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.service.findAll().subscribe({ next: (d) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  mediaUrl(row: TutorielResponse): string | null {
    return this.files.resolveUrl(row.urlVideo || row.urlImage);
  }

  hasVideo(row: TutorielResponse): boolean {
    return !!row.urlVideo;
  }

  closeDetails(): void {
    this.selected.set(null);
  }

  async remove(row: TutorielResponse): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Supprimer le tutoriel', message: `Supprimer "${row.titreTutoriel}" ?`, danger: true });
    if (!ok) return;
    this.service.remove(row.idTutoriel).subscribe(() => { this.toast.success('Tutoriel supprimé.'); this.load(); });
  }
}
