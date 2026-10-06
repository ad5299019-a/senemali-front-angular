import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { RoleEnum } from '../../../core/models/enums';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(false);

  form = this.fb.nonNullable.group({
    identifiant: ['', Validators.required],
    motDePasse: ['', Validators.required],
  });

  isInvalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  googleSignInInfo(): void {
    this.toast.info("La connexion Google sera activée après la configuration du service d'authentification.");
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const credentials = this.form.getRawValue();
    this.auth.login({ ...credentials, identifiant: credentials.identifiant.trim() }).subscribe({
      next: (res) => {
        this.loading.set(false);
        const role = res.data.role;
        if (role !== RoleEnum.ADMIN && role !== RoleEnum.FOURNISSEUR) {
          this.toast.error("Ce portail est réservé aux administrateurs et fournisseurs. Utilisez l'application mobile SeneMali.");
          this.auth.logout();
          return;
        }
        this.toast.success(`Bienvenue, ${res.data.prenom} !`);
        this.router.navigate(['/dashboard']);
      },
      error: () => this.loading.set(false),
    });
  }
}
