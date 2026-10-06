import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { FournisseurService } from '../fournisseurs/fournisseur.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FileUploadComponent } from '../../shared/components/file-upload/file-upload.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ToastService } from '../../core/services/toast.service';
import { STATUT_VALIDATION_LABELS, StatutValidationFournisseur } from '../../core/models';

@Component({
  selector: 'app-mon-profil',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeaderComponent, FileUploadComponent, LoadingSpinnerComponent, StatusBadgeComponent],
  templateUrl: './mon-profil.component.html',
  styleUrl: './mon-profil.component.scss',
})
export class MonProfilComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private service = inject(FournisseurService);
  private toast = inject(ToastService);

  loading = signal(true);
  saving = signal(false);
  statutLabel = signal('');
  statutTone = signal<'success' | 'warning' | 'danger'>('warning');

  form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    telephone: ['', Validators.required],
    localisation: ['', Validators.required],
    photoProfil: [''],
    nomEntreprise: [''],
    zoneDeVente: [''],
    description: [''],
  });

  ngOnInit(): void {
    const id = this.auth.currentUser()!.id;
    this.service.findById(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          nom: data.nom,
          prenom: data.prenom,
          telephone: data.telephone,
          localisation: data.localisation,
          photoProfil: data.photoProfil ?? '',
          nomEntreprise: data.nomEntreprise ?? '',
          zoneDeVente: data.zoneDeVente ?? '',
          description: data.description ?? '',
        });
        this.statutLabel.set(STATUT_VALIDATION_LABELS[data.statutFournisseur]);
        this.statutTone.set(
          data.statutFournisseur === StatutValidationFournisseur.VALIDE
            ? 'success'
            : data.statutFournisseur === StatutValidationFournisseur.REFUSE
            ? 'danger'
            : 'warning'
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  isInvalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const id = this.auth.currentUser()!.id;
    this.service.update(id, this.form.getRawValue()).subscribe({
      next: () => { this.toast.success('Profil mis à jour.'); this.saving.set(false); },
      error: () => this.saving.set(false),
    });
  }
}
