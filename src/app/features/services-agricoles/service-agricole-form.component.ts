import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServiceAgricoleService } from './service-agricole.service';
import { PrestataireService } from '../prestataires/prestataire.service';
import { PrestatireResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FileUploadComponent } from '../../shared/components/file-upload/file-upload.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-service-agricole-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, FileUploadComponent],
  templateUrl: './service-agricole-form.component.html',
  styleUrl: './service-agricole-form.component.scss',
})
export class ServiceAgricoleFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(ServiceAgricoleService);
  private prestataireService = inject(PrestataireService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isEdit = signal(false);
  saving = signal(false);
  prestataires = signal<PrestatireResponse[]>([]);
  private currentId?: number;

  form = this.fb.nonNullable.group({
    idPrestataire: [null as number | null, Validators.required],
    typeService: ['', Validators.required],
    description: [''],
    coutEstime: ['', Validators.required],
    imageUrl: [''],
    disponible: [true],
  });

  ngOnInit(): void {
    this.prestataireService.findAll().subscribe((data) => this.prestataires.set(data));

    const qp = this.route.snapshot.queryParamMap.get('idPrestataire');
    if (qp) this.form.patchValue({ idPrestataire: Number(qp) });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.currentId = Number(idParam);
      this.service.findById(this.currentId).subscribe((data) => {
        this.form.patchValue({
          idPrestataire: data.idPrestataire,
          typeService: data.typeService,
          description: data.description ?? '',
          coutEstime: data.coutEstime,
          imageUrl: data.imageUrl ?? '',
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
        this.toast.success(this.isEdit() ? 'Service mis à jour.' : 'Service créé.');
        this.router.navigate(['/services-agricoles']);
      },
      error: () => this.saving.set(false),
    });
  }
}
