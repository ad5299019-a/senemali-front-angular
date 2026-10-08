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
import { AuthService } from '../../core/services/auth.service';
import { FournisseurService } from '../fournisseurs/fournisseur.service';
import { FileStorageService } from '../../core/services/file-storage.service';
import { ToastService } from '../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import {
  FournisseurRequest,
  FournisseurResponse,
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
  private service = inject(FournisseurService);
  private fileStorage = inject(FileStorageService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  saving = signal(false);
  isEditing = signal(false);
  uploadingAvatar = signal(false);

  fournisseur = signal<FournisseurResponse | null>(null);
  avatarPreview = signal<string | null>(null);
  avatarImgFailed = signal(false);

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

  displayName = computed(() => {
    const f = this.fournisseur();
    if (f) {
      const name = `${f.prenom || ''} ${f.nom || ''}`.trim();
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
    return this.fournisseur()?.email || this.auth.currentUser()?.identifiant || '—';
  });

  displayTelephone = computed(() => {
    return this.fournisseur()?.telephone || '—';
  });

  displayLocalisation = computed(() => {
    return this.fournisseur()?.localisation || '—';
  });

  avatarUrl = computed(() => {
    if (this.avatarPreview()) {
      return this.avatarPreview();
    }
    const photo =
      this.fournisseur()?.photoProfil || this.form.controls.photoProfil.value;
    if (photo) {
      return this.fileStorage.resolveUrl(photo);
    }
    return null;
  });

  initials = computed(() => {
    const f = this.fournisseur();
    if (f?.prenom && f?.nom) {
      return `${f.prenom.charAt(0)}${f.nom.charAt(0)}`.toUpperCase();
    }
    const u = this.auth.currentUser();
    if (u?.prenom && u?.nom) {
      return `${u.prenom.charAt(0)}${u.nom.charAt(0)}`.toUpperCase();
    }
    return 'F';
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

    this.service.findById(currentUser.id).subscribe({
      next: (data) => {
        this.fournisseur.set(data);
        this.patchForm(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private patchForm(data: FournisseurResponse): void {
    this.form.patchValue({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email ?? '',
      telephone: data.telephone,
      localisation: data.localisation,
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
    if (this.fournisseur()) {
      this.patchForm(this.fournisseur()!);
    }
    this.avatarPreview.set(null);
    this.avatarImgFailed.set(false);
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

    // Vérification de cohérence si l'utilisateur tente de changer de mot de passe
    if (nouveauMotDePasse || confirmerMotDePasse || ancienMotDePasse) {
      if (nouveauMotDePasse !== confirmerMotDePasse) {
        this.toast.error('Les nouveaux mots de passe ne correspondent pas.');
        return;
      }
      if (!ancienMotDePasse) {
        this.toast.error('Veuillez renseigner votre ancien mot de passe.');
        return;
      }
      // Limitation backend documentée : l'entité FournisseurRequest ne possède pas de champ mot de passe
      this.toast.info(
        'Note : La modification du mot de passe requiert un service d’authentification dédié côté serveur.'
      );
    }

    this.saving.set(true);
    const currentUser = this.auth.currentUser();
    const id = currentUser?.id ?? this.fournisseur()?.id ?? 0;
    const formVal = this.form.getRawValue();

    const payload: FournisseurRequest = {
      nom: formVal.nom,
      prenom: formVal.prenom,
      telephone: formVal.telephone,
      localisation: formVal.localisation,
      photoProfil:
        formVal.photoProfil || this.fournisseur()?.photoProfil || null,
      nomEntreprise: this.fournisseur()?.nomEntreprise ?? null,
      zoneDeVente: this.fournisseur()?.zoneDeVente ?? null,
      description: this.fournisseur()?.description ?? null,
    };

    this.service.update(id, payload).subscribe({
      next: (res) => {
        this.fournisseur.set(res);
        this.patchForm(res);
        this.toast.success('Profil mis à jour.');
        this.saving.set(false);
        this.avatarPreview.set(null);
        this.router.navigate(['/mon-profil']);
      },
      error: () => {
        this.toast.error('Erreur lors de la mise à jour du profil.');
        this.saving.set(false);
      },
    });
  }
}
