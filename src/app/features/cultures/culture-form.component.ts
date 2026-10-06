import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CultureService } from './culture.service';
import { CategorieCultureService } from '../categories-cultures/categorie-culture.service';
import { CategorieCultureResponse } from '../../core/models';
import { CultureRequest } from '../../core/models/catalogue.model';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastService } from '../../core/services/toast.service';
import { FileUploadComponent } from '../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-culture-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, FileUploadComponent, MatIconModule],
  templateUrl: './culture-form.component.html',
  styleUrl: './culture-form.component.scss',
})
export class CultureFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(CultureService);
  private categorieService = inject(CategorieCultureService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isEdit = signal(false);
  saving = signal(false);
  categories = signal<CategorieCultureResponse[]>([]);
  private currentId?: number;

  form = this.fb.nonNullable.group({
    nomCulture: ['', Validators.required],
    idCategorie: [null as number | null, Validators.required],
    description: [''],
    imageUrl: [''],
  });

  ngOnInit(): void {
    this.categorieService.findAll().subscribe((data) => this.categories.set(data));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.currentId = Number(idParam);
      this.service.findById(this.currentId).subscribe((data) => {
        this.form.patchValue({
          nomCulture: data.nomCulture,
          idCategorie: data.idCategorie,
          description: data.description ?? '',
          imageUrl: data.imageUrl ?? '',
        });
      });
    }
  }

  isInvalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const formValue = this.form.getRawValue();
    if (formValue.idCategorie === null) {
      this.form.controls.idCategorie.markAsTouched();
      this.toast.error('Choisissez une catégorie avant de continuer.');
      return;
    }
    this.saving.set(true);
    const payload: CultureRequest = { ...formValue, idCategorie: formValue.idCategorie };
    const request$ = this.isEdit() ? this.service.update(this.currentId!, payload) : this.service.create(payload);
    request$.subscribe({
      next: () => {
        this.toast.success(this.isEdit() ? 'Culture mise à jour.' : 'Culture créée.');
        this.router.navigate(['/cultures']);
      },
      error: () => this.saving.set(false),
    });
  }
}
