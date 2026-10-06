import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RoleEnum } from '../../core/models/enums';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { FileUploadComponent } from '../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-admin-create-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, FileUploadComponent],
  templateUrl: './admin-create-dialog.component.html',
  styleUrl: './admin-create-dialog.component.scss',
})
export class AdminCreateDialogComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  creating = signal(false);
  form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', Validators.required],
    localisation: ['', Validators.required],
    photoProfil: [''],
    motDePasse: ['', [Validators.required, Validators.minLength(6)]],
    confirmation: ['', Validators.required],
  });

  passwordMismatch(): boolean {
    const { motDePasse, confirmation } = this.form.getRawValue();
    return !!confirmation && motDePasse !== confirmation;
  }

  close(): void {
    if (!this.creating()) this.closed.emit();
  }

  submit(): void {
    if (this.form.invalid || this.passwordMismatch()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.creating.set(true);
    this.auth.registerAdmin({
      nom: value.nom,
      prenom: value.prenom,
      email: value.email,
      telephone: value.telephone,
      localisation: value.localisation,
      photoProfil: value.photoProfil || null,
      motDePasse: value.motDePasse,
      role: RoleEnum.ADMIN,
    }).subscribe({
      next: () => {
        this.creating.set(false);
        this.toast.success('Le compte administrateur a été créé.');
        this.created.emit();
        this.closed.emit();
      },
      error: () => {
        this.creating.set(false);
        this.toast.error('La création du compte administrateur a échoué. Vérifiez les informations et réessayez.');
      },
    });
  }
}
