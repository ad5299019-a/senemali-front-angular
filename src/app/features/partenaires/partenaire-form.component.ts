import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PartenaireService } from './partenaire.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FileUploadComponent } from '../../shared/components/file-upload/file-upload.component';
import { ToastService } from '../../core/services/toast.service';
import { TYPE_PARTENAIRE_LABELS, TypePartenaireEnum } from '../../core/models';

@Component({
  selector: 'app-partenaire-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, FileUploadComponent],
  templateUrl: './partenaire-form.component.html',
  styleUrl: './partenaire-form.component.scss',
})
export class PartenaireFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(PartenaireService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isEdit = signal(false);
  saving = signal(false);
  private currentId?: number;

  typeOptions = Object.entries(TYPE_PARTENAIRE_LABELS).map(([value, label]) => ({ value: value as TypePartenaireEnum, label }));

  form = this.fb.nonNullable.group({
    nomPartenaire: ['', Validators.required],
    typepartenaire: [TypePartenaireEnum.BANQUE, Validators.required],
    description: [''],
    localisation: [''],
    telephone: [''],
    imageUrl: [''],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.currentId = Number(idParam);
      this.service.findById(this.currentId).subscribe((data) => {
        this.form.patchValue({
          nomPartenaire: data.nomPartenaire,
          typepartenaire: data.typepartenaire,
          description: data.description ?? '',
          localisation: data.localisation ?? '',
          telephone: data.telephone ?? '',
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
        this.toast.success(this.isEdit() ? 'Partenaire mis à jour.' : 'Partenaire créé.');
        this.router.navigate(['/partenaires']);
      },
      error: () => this.saving.set(false),
    });
  }
}
