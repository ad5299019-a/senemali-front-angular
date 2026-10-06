import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PrixMarcheService } from './prix-marche.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-prix-marche-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './prix-marche-form.component.html',
  styleUrl: './prix-marche-form.component.scss',
})
export class PrixMarcheFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(PrixMarcheService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isEdit = signal(false);
  saving = signal(false);
  private currentId?: number;

  form = this.fb.nonNullable.group({
    nomProduit: ['', Validators.required],
    prixProduit: [0, [Validators.required, Validators.min(0)]],
    unite: ['', Validators.required],
    localisation: ['', Validators.required],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.currentId = Number(idParam);
      this.service.findById(this.currentId).subscribe((data) => {
        this.form.patchValue({
          nomProduit: data.nomProduit,
          prixProduit: data.prixProduit,
          unite: data.unite,
          localisation: data.localisation,
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
        this.toast.success(this.isEdit() ? 'Relevé mis à jour.' : 'Relevé publié.');
        this.router.navigate(['/prix-marche']);
      },
      error: () => this.saving.set(false),
    });
  }
}
