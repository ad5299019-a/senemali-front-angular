import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FinancementService } from './financement.service';
import { PartenaireService } from '../partenaires/partenaire.service';
import { PartenaireFinancierResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-financement-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './financement-form.component.html',
  styleUrl: './financement-form.component.scss',
})
export class FinancementFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(FinancementService);
  private partenaireService = inject(PartenaireService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isEdit = signal(false);
  saving = signal(false);
  partenaires = signal<PartenaireFinancierResponse[]>([]);
  private currentId?: number;

  form = this.fb.nonNullable.group(
    {
      idPartenaire: [null as number | null, Validators.required],
      typeFinancement: ['', Validators.required],
      conditionPrincipales: [''],
      montantMin: [0, [Validators.required, Validators.min(0)]],
      montantMax: [0, [Validators.required, Validators.min(0)]],
      disponible: [true],
    },
    { validators: (group) => (group.get('montantMax')!.value < group.get('montantMin')!.value ? { montantRange: true } : null) }
  );

  ngOnInit(): void {
    this.partenaireService.findAll().subscribe((data) => this.partenaires.set(data));

    const qp = this.route.snapshot.queryParamMap.get('idPartenaire');
    if (qp) this.form.patchValue({ idPartenaire: Number(qp) });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.currentId = Number(idParam);
      this.service.findById(this.currentId).subscribe((data) => {
        this.form.patchValue({
          idPartenaire: data.idPartenaire,
          typeFinancement: data.typeFinancement,
          conditionPrincipales: data.conditionPrincipales ?? '',
          montantMin: data.montantMin,
          montantMax: data.montantMax,
          disponible: data.disponible,
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
    const payload = this.form.getRawValue() as any;
    const request$ = this.isEdit() ? this.service.update(this.currentId!, payload) : this.service.create(payload);
    request$.subscribe({
      next: () => {
        this.toast.success(this.isEdit() ? 'Financement mis à jour.' : 'Financement créé.');
        this.router.navigate(['/financements']);
      },
      error: () => this.saving.set(false),
    });
  }
}
