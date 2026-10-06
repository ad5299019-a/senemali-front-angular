import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { RoleEnum } from '../../../core/models/enums';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FileUploadComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(false);

  form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', Validators.email],
    telephone: ['', Validators.required],
    localisation: ['', Validators.required],
    nomEntreprise: [''],
    zoneDeVente: [''],
    descriptionFournisseur: [''],
    photoProfil: [''],
    motDePasse: ['', [Validators.required, Validators.minLength(6)]],
    confirmation: ['', Validators.required],
  });

  isInvalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  passwordMismatch(): boolean {
    const { motDePasse, confirmation } = this.form.getRawValue();
    return !!confirmation && motDePasse !== confirmation;
  }

  googleSignInInfo(): void {
    this.toast.info("L'inscription Google sera activée après la configuration du service d'authentification.");
  }

  submit(): void {
    if (this.form.invalid || this.passwordMismatch()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { confirmation, ...payload } = this.form.getRawValue();
    this.auth.registerFournisseur({ ...payload, role: RoleEnum.FOURNISSEUR }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Demande envoyée. Votre compte sera activé après validation par un administrateur.');
        this.router.navigate(['/auth/login']);
      },
      error: () => this.loading.set(false),
    });
  }
}
