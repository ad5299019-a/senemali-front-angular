import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { IntrantService } from './intrant.service';
import { AuthService } from '../../core/services/auth.service';
import { FileStorageService } from '../../core/services/file-storage.service';
import { ToastService } from '../../core/services/toast.service';
import { IntrantRequest } from '../../core/models';

@Component({
  selector: 'app-intrant-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './intrant-form.component.html',
  styleUrl: './intrant-form.component.scss',
})
export class IntrantFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(IntrantService);
  private auth = inject(AuthService);
  private fileStorage = inject(FileStorageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isEdit = signal(false);
  saving = signal(false);
  uploading = signal(false);
  previewUrl = signal<string | null>(null);
  private currentId?: number;

  form = this.fb.group({
    nomIntrant: ['', Validators.required],
    description: [''],
    prix: [null as number | null, [Validators.required, Validators.min(0)]],
    localisation: [''],
    imageUrl: [''],
    typeIntrant: ['', Validators.required],
    unite: ['kg'],
    quantite: [null as number | null, [Validators.min(0)]],
    disponible: [true],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.currentId = Number(idParam);
      this.service.findById(this.currentId).subscribe({
        next: (data) => {
          this.form.patchValue({
            nomIntrant: data.nomIntrant,
            typeIntrant: data.typeIntrant,
            description: data.description ?? '',
            prix: data.prix,
            localisation: data.localisation ?? '',
            unite: data.unite ?? 'kg',
            quantite: data.quantite ?? null,
            disponible: data.disponible ?? true,
            imageUrl: data.imageUrl ?? '',
          });
          if (data.imageUrl) {
            this.previewUrl.set(this.fileStorage.resolveUrl(data.imageUrl));
          }
        },
        error: (err) => {
          console.error('Erreur chargement intrant :', err);
          this.toast.error("Impossible de charger les données de l'intrant.");
        },
      });
    }
  }

  isInvalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toast.error('Seules les images sont acceptées.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.toast.error('Image trop volumineuse (10 Mo max).');
      return;
    }

    this.uploading.set(true);
    this.fileStorage.upload(file, 'intrants').subscribe({
      next: (res) => {
        this.form.patchValue({ imageUrl: res.fileUrl });
        this.previewUrl.set(this.fileStorage.resolveUrl(res.fileUrl));
        this.uploading.set(false);
      },
      error: () => {
        this.toast.error("Erreur lors de l'envoi de l'image.");
        this.uploading.set(false);
      },
    });
  }

  removeImage(): void {
    this.form.patchValue({ imageUrl: '' });
    this.previewUrl.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Veuillez renseigner les champs requis.');
      return;
    }

    const currentUser = this.auth.currentUser();
    if (!currentUser) return;

    this.saving.set(true);
    const raw = this.form.getRawValue();

    const payload: IntrantRequest = {
      nomIntrant: raw.nomIntrant!,
      typeIntrant: raw.typeIntrant!,
      description: raw.description || undefined,
      prix: Number(raw.prix) || 0,
      disponible: raw.disponible ?? true,
      imageUrl: raw.imageUrl || undefined,
      idFournisseur: currentUser.id,
      quantite: raw.quantite != null ? Number(raw.quantite) : undefined,
      unite: raw.unite || undefined,
      localisation: raw.localisation || undefined,
    };

    const request$ = this.isEdit()
      ? this.service.update(this.currentId!, payload)
      : this.service.create(payload);

    request$.subscribe({
      next: () => {
        this.toast.success(this.isEdit() ? 'Intrant modifié avec succès.' : 'Intrant ajouté avec succès.');
        this.router.navigate(['/mes-intrants']);
      },
      error: (err) => {
        console.error('Erreur enregistrement intrant :', err);
        this.saving.set(false);
      },
    });
  }
}
