import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IntrantService } from './intrant.service';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FileUploadComponent } from '../../shared/components/file-upload/file-upload.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-intrant-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, FileUploadComponent],
  templateUrl: './intrant-form.component.html',
  styleUrl: './intrant-form.component.scss',
})
export class IntrantFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(IntrantService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isEdit = signal(false);
  saving = signal(false);
  private currentId?: number;

  form = this.fb.nonNullable.group({
    nomIntrant: ['', Validators.required],
    typeIntrant: ['', Validators.required],
    description: [''],
    prix: [0, [Validators.required, Validators.min(0)]],
    disponible: [true],
    imageUrl: [''],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.currentId = Number(idParam);
      this.service.findById(this.currentId).subscribe((data) => {
        this.form.patchValue({
          nomIntrant: data.nomIntrant,
          typeIntrant: data.typeIntrant,
          description: data.description ?? '',
          prix: data.prix,
          disponible: data.disponible,
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
    const idFournisseur = this.auth.currentUser()!.id;
    const payload = { ...this.form.getRawValue(), idFournisseur };
    const request$ = this.isEdit() ? this.service.update(this.currentId!, payload) : this.service.create(payload);
    request$.subscribe({
      next: () => {
        this.toast.success(this.isEdit() ? 'Intrant mis à jour.' : 'Intrant publié, en attente de validation.');
        this.router.navigate(['/mes-intrants']);
      },
      error: () => this.saving.set(false),
    });
  }
}
