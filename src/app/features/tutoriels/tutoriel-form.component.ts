import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TutorielService } from './tutoriel.service';
import { CategorieCultureService } from '../categories-cultures/categorie-culture.service';
import { CategorieCultureResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FileUploadComponent } from '../../shared/components/file-upload/file-upload.component';
import { ToastService } from '../../core/services/toast.service';
import { TutorielRequest } from '../../core/models';

@Component({
  selector: 'app-tutoriel-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, FileUploadComponent],
  templateUrl: './tutoriel-form.component.html',
  styleUrl: './tutoriel-form.component.scss',
})
export class TutorielFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(TutorielService);
  private categorieService = inject(CategorieCultureService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isEdit = signal(false);
  saving = signal(false);
  categories = signal<CategorieCultureResponse[]>([]);
  mediaIsVideo = signal(false);
  private currentId?: number;

  form = this.fb.nonNullable.group({
    titreTutoriel: ['', Validators.required],
    descriptionTutoriel: ['', Validators.required],
    urlImage: [''],
    urlVideo: [''],
    idCategorie: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    this.categorieService.findAll().subscribe((data) => this.categories.set(data));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.currentId = Number(idParam);
      this.service.findById(this.currentId).subscribe((data) => {
        this.form.patchValue({
          titreTutoriel: data.titreTutoriel,
          descriptionTutoriel: data.descriptionTutoriel,
          urlImage: data.urlImage,
          urlVideo: data.urlVideo,
          idCategorie: data.idCategorie,
        });
        this.mediaIsVideo.set(!!data.urlVideo && !data.urlImage);
      });
    }
  }

  isInvalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  mediaInitialUrl(): string {
    const value = this.form.getRawValue();
    return this.mediaIsVideo() ? value.urlVideo : value.urlImage;
  }

  setMedia(media: { fileUrl: string; isVideo: boolean }): void {
    this.mediaIsVideo.set(media.isVideo);
    this.form.patchValue({
      urlImage: media.isVideo ? '' : media.fileUrl,
      urlVideo: media.isVideo ? media.fileUrl : '',
    });
  }

  clearMediaIfEmpty(fileUrl: string): void {
    if (fileUrl) return;
    this.mediaIsVideo.set(false);
    this.form.patchValue({ urlImage: '', urlVideo: '' });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const formValue = this.form.getRawValue();
    if (formValue.idCategorie === null) {
      this.form.controls.idCategorie.markAsTouched();
      this.toast.error('Choisissez une catégorie avant de continuer.');
      return;
    }
    this.saving.set(true);
    const payload: TutorielRequest = { ...formValue, idCategorie: formValue.idCategorie };
    const request$ = this.isEdit() ? this.service.update(this.currentId!, payload) : this.service.create(payload);
    request$.subscribe({
      next: () => {
        this.toast.success(this.isEdit() ? 'Tutoriel mis à jour.' : 'Tutoriel publié.');
        this.router.navigate(['/tutoriels']);
      },
      error: () => this.saving.set(false),
    });
  }
}
