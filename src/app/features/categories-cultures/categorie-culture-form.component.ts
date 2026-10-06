import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategorieCultureService } from './categorie-culture.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-categorie-culture-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './categorie-culture-form.component.html',
  styleUrl: './categorie-culture-form.component.scss',
})
export class CategorieCultureFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(CategorieCultureService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isEdit = signal(false);
  saving = signal(false);
  private currentId?: number;

  form = this.fb.nonNullable.group({
    nomCategorie: ['', Validators.required],
    description: [''],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.currentId = Number(idParam);
      this.service.findById(this.currentId).subscribe((data) => {
        this.form.patchValue({ nomCategorie: data.nomCategorie, description: data.description ?? '' });
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
    this.saving.set(true);
    const payload = this.form.getRawValue();
    const request$ = this.isEdit() ? this.service.update(this.currentId!, payload) : this.service.create(payload);
    request$.subscribe({
      next: () => {
        this.toast.success(this.isEdit() ? 'Catégorie mise à jour.' : 'Catégorie créée.');
        this.router.navigate(['/categories-cultures']);
      },
      error: () => this.saving.set(false),
    });
  }
}
