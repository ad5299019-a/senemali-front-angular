import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConseilService } from './conseil.service';
import { CultureService } from '../cultures/culture.service';
import { CultureResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-conseil-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './conseil-form.component.html',
  styleUrl: './conseil-form.component.scss',
})
export class ConseilFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(ConseilService);
  private cultureService = inject(CultureService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isEdit = signal(false);
  saving = signal(false);
  cultures = signal<CultureResponse[]>([]);
  private currentId?: number;

  form = this.fb.nonNullable.group({
    titreConseil: ['', Validators.required],
    idCulture: [null as number | null, Validators.required],
    contenu: ['', Validators.required],
  });

  ngOnInit(): void {
    this.cultureService.findAll().subscribe((data) => this.cultures.set(data));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.currentId = Number(idParam);
      this.service.findById(this.currentId).subscribe((data) => {
        this.form.patchValue({ titreConseil: data.titreConseil, idCulture: data.idCulture, contenu: data.contenu });
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
        this.toast.success(this.isEdit() ? 'Conseil mis à jour.' : 'Conseil publié.');
        this.router.navigate(['/conseils']);
      },
      error: () => this.saving.set(false),
    });
  }
}
