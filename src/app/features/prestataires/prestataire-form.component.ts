import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PrestataireService } from './prestataire.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FileUploadComponent } from '../../shared/components/file-upload/file-upload.component';
import { ToastService } from '../../core/services/toast.service';
import { TYPE_PRESTATAIRE_LABELS, TypePrestataireEnum } from '../../core/models';

@Component({
  selector: 'app-prestataire-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, FileUploadComponent],
  templateUrl: './prestataire-form.component.html',
  styleUrl: './prestataire-form.component.scss',
})
export class PrestataireFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(PrestataireService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isEdit = signal(false);
  saving = signal(false);
  private currentId?: number;

  typeOptions = Object.entries(TYPE_PRESTATAIRE_LABELS).map(([value, label]) => ({ value: value as TypePrestataireEnum, label }));

  form = this.fb.nonNullable.group({
    nomPrestataire: ['', Validators.required],
    typePrestataire: [TypePrestataireEnum.CONSEILLER_AGRICOLE, Validators.required],
    description: [''],
    specialite: ['', Validators.required],
    telephone: ['', Validators.required],
    localisation: ['', Validators.required],
    imageUrl: [''],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.currentId = Number(idParam);
      this.service.findById(this.currentId).subscribe((data) => {
        this.form.patchValue({
          nomPrestataire: data.nomPrestataire,
          typePrestataire: data.typePrestataire,
          description: data.description ?? '',
          specialite: data.specialite,
          telephone: data.telephone,
          localisation: data.localisation,
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
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const payload = this.form.getRawValue();
    const request$ = this.isEdit() ? this.service.update(this.currentId!, payload) : this.service.create(payload);
    request$.subscribe({
      next: () => {
        this.toast.success(this.isEdit() ? 'Prestataire mis à jour.' : 'Prestataire créé.');
        this.router.navigate(['/prestataires']);
      },
      error: () => this.saving.set(false),
    });
  }
}
