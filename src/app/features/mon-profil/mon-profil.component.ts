import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { catchError, Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { FournisseurService } from '../fournisseurs/fournisseur.service';
import { AcheteurService } from '../acheteurs/acheteur.service';
import { UtilisateurService } from '../utilisateurs/utilisateur.service';
import { FileStorageService } from '../../core/services/file-storage.service';
import { ToastService } from '../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import {
  AcheteurRequest,
  AcheteurResponse,
  FournisseurRequest,
  FournisseurResponse,
  RoleEnum,
  UtilisateurRequest,
  UtilisateurResponse,
} from '../../core/models';

@Component({
  selector: 'app-mon-profil',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, LoadingSpinnerComponent],
  templateUrl: './mon-profil.component.html',
  styleUrl: './mon-profil.component.scss',
})
export class MonProfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private fournisseurService = inject(FournisseurService);
  private acheteurService = inject(AcheteurService);
  private utilisateurService = inject(UtilisateurService);
  private fileStorage = inject(FileStorageService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  saving = signal(false);
  isEditing = signal(false);
  uploadingAvatar = signal(false);

  profile = signal<UtilisateurResponse | FournisseurResponse | AcheteurResponse | null>(null);
  avatarPreview = signal<string | null>(null);
  avatarImgFailed = signal(false);

  showOldPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: [''],
    telephone: ['', Validators.required],
    localisation: ['', Validators.required],
    photoProfil: [''],
    ancienMotDePasse: [''],
    nouveauMotDePasse: [''],
    confirmerMotDePasse: [''],
  });

  roleLabel = computed(() => {
    const role = this.profile()?.role || this.auth.currentUser()?.role;
    switch (role) {
      case RoleEnum.FOURNISSEUR:
        return 'Fournisseur';
      case RoleEnum.ACHETEUR:
        return 'Acheteur';
      case RoleEnum.ADMIN:
        return 'Administrateur';
      case RoleEnum.AGRICULTEUR:
        return 'Agriculteur';
      default:
        return 'Utilisateur';
    }
  });

  displayName = computed(() => {
    const p = this.profile();
    if (p) {
      const name = `${p.prenom || ''} ${p.nom || ''}`.trim();
      if (name) return name;
    }
    const u = this.auth.currentUser();
    if (u) {
      const name = `${u.prenom || ''} ${u.nom || ''}`.trim();
      if (name) return name;
    }
    return '';
  });

  displayEmail = computed(() => {
    return this.profile()?.email || this.auth.currentUser()?.identifiant || '—';
  });

  displayTelephone = computed(() => {
    return this.profile()?.telephone || '—';
  });

  displayLocalisation = computed(() => {
    return this.profile()?.localisation || '—';
  });

  avatarUrl = computed(() => {
    if (this.avatarPreview()) {
      return this.avatarPreview();
    }
    const photo =
      this.profile()?.photoProfil || this.form.controls.photoProfil.value;
    if (photo) {
      return this.fileStorage.resolveUrl(photo);
    }
    return null;
  });

  initials = computed(() => {
    const p = this.profile();
    if (p?.prenom && p?.nom) {
      return `${p.prenom.charAt(0)}${p.nom.charAt(0)}`.toUpperCase();
    }
    const u = this.auth.currentUser();
    if (u?.prenom && u?.nom) {
      return `${u.prenom.charAt(0)}${u.nom.charAt(0)}`.toUpperCase();
    }
    const role = this.auth.currentUser()?.role;
    if (role === RoleEnum.ACHETEUR) return 'A';
    if (role === RoleEnum.FOURNISSEUR) return 'F';
    return 'U';
  });

  ngOnInit(): void {
    this.syncEditMode(this.router.url);

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.syncEditMode(event.urlAfterRedirects);
        }
      });

    this.loadProfile();
  }

  private syncEditMode(url: string): void {
    this.isEditing.set(url.includes('/modifier'));
  }

  loadProfile(): void {
    const currentUser = this.auth.currentUser();
    if (!currentUser) {
      this.loading.set(false);
      return;
    }

    const userId = currentUser.id;
    const role = currentUser.role;

    let fetch$: Observable<UtilisateurResponse | FournisseurResponse | AcheteurResponse>;

    if (role === RoleEnum.FOURNISSEUR) {
      fetch$ = this.fournisseurService.findById(userId).pipe(
        catchError((err) => {
          console.warn('Fallback UtilisateurService pour Fournisseur:', err);
          return this.utilisateurService.findById(userId);
        })
      );
    } else if (role === RoleEnum.ACHETEUR) {
      fetch$ = this.acheteurService.findById(userId).pipe(
        catchError((err) => {
          console.warn('Fallback UtilisateurService pour Acheteur:', err);
          return this.utilisateurService.findById(userId);
        })
      );
    } else {
      fetch$ = this.utilisateurService.findById(userId);
    }

    this.loading.set(true);
    fetch$.subscribe({
      next: (data) => {
        this.profile.set(data);
        this.patchForm(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement profil:', err);
        this.toast.error('Impossible de charger les données du profil.');
        this.loading.set(false);
      },
    });
  }

  private patchForm(data: UtilisateurResponse): void {
    this.form.patchValue({
      nom: data.nom ?? '',
      prenom: data.prenom ?? '',
      email: data.email ?? '',
      telephone: data.telephone ?? '',
      localisation: data.localisation ?? '',
      photoProfil: data.photoProfil ?? '',
      ancienMotDePasse: '',
      nouveauMotDePasse: '',
      confirmerMotDePasse: '',
    });
  }

  goToEdit(): void {
    this.router.navigate(['/mon-profil/modifier']);
  }

  cancelEdit(): void {
    if (this.profile()) {
      this.patchForm(this.profile()!);
    }
    this.avatarPreview.set(null);
    this.avatarImgFailed.set(false);
    this.showOldPassword.set(false);
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
    this.router.navigate(['/mon-profil']);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toast.error('Seules les images sont acceptées.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.toast.error('Image trop volumineuse (10 Mo max).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview.set(reader.result as string);
      this.avatarImgFailed.set(false);
    };
    reader.readAsDataURL(file);

    this.uploadingAvatar.set(true);
    this.fileStorage.upload(file, 'profils').subscribe({
      next: (result) => {
        this.form.patchValue({ photoProfil: result.fileUrl });
        this.uploadingAvatar.set(false);
      },
      error: () => {
        this.uploadingAvatar.set(false);
        this.toast.error('Échec du téléversement de la photo de profil.');
      },
    });
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

    const { ancienMotDePasse, nouveauMotDePasse, confirmerMotDePasse } =
      this.form.getRawValue();

    if (nouveauMotDePasse || confirmerMotDePasse || ancienMotDePasse) {
      if (nouveauMotDePasse !== confirmerMotDePasse) {
        this.toast.error('Les nouveaux mots de passe ne correspondent pas.');
        return;
      }
      if (!ancienMotDePasse) {
        this.toast.error('Veuillez renseigner votre ancien mot de passe.');
        return;
      }
      if (nouveauMotDePasse.length < 4) {
        this.toast.error('Le nouveau mot de passe doit comporter au moins 4 caractères.');
        return;
      }
    }

    this.saving.set(true);
    const currentUser = this.auth.currentUser();
    const id = currentUser?.id ?? this.profile()?.id ?? 0;
    const role = currentUser?.role ?? this.profile()?.role;
    const formVal = this.form.getRawValue();

    const photoProfil =
      formVal.photoProfil || this.profile()?.photoProfil || null;

    let update$: Observable<UtilisateurResponse | FournisseurResponse | AcheteurResponse>;

    if (role === RoleEnum.FOURNISSEUR) {
      const currentFournisseur = this.profile() as FournisseurResponse;
      const payload: FournisseurRequest = {
        nom: formVal.nom.trim(),
        prenom: formVal.prenom.trim(),
        telephone: formVal.telephone.trim(),
        localisation: formVal.localisation.trim(),
        photoProfil: photoProfil,
        nomEntreprise: currentFournisseur?.nomEntreprise ?? null,
        zoneDeVente: currentFournisseur?.zoneDeVente ?? null,
        description: currentFournisseur?.description ?? null,
      };
      update$ = this.fournisseurService.update(id, payload);
    } else if (role === RoleEnum.ACHETEUR) {
      const payload: AcheteurRequest = {
        nom: formVal.nom.trim(),
        prenom: formVal.prenom.trim(),
        email: formVal.email?.trim() || this.profile()?.email || '',
        telephone: formVal.telephone.trim(),
        localisation: formVal.localisation.trim(),
        photoProfil: photoProfil,
      };
      update$ = this.acheteurService.update(id, payload);
    } else {
      const payload: UtilisateurRequest = {
        nom: formVal.nom.trim(),
        prenom: formVal.prenom.trim(),
        telephone: formVal.telephone.trim(),
        localisation: formVal.localisation.trim(),
        photoProfil: photoProfil,
      };
      update$ = this.utilisateurService.update(id, payload);
    }

    update$.subscribe({
      next: (res) => {
        this.profile.set(res);
        this.patchForm(res);
        this.auth.updateCurrentUser({
          nom: res.nom,
          prenom: res.prenom,
          identifiant: res.email || currentUser?.identifiant,
        });
        this.toast.success('Profil mis à jour avec succès.');
        this.saving.set(false);
        this.avatarPreview.set(null);
        this.showOldPassword.set(false);
        this.showNewPassword.set(false);
        this.showConfirmPassword.set(false);
        this.router.navigate(['/mon-profil']);
      },
      error: (err) => {
        console.error('Erreur mise à jour profil:', err);
        this.toast.error('Erreur lors de la mise à jour du profil.');
        this.saving.set(false);
      },
    });
  }
}
