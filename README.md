# SeneMali Admin — Portail web (Angular 18)

Portail web pour les rôles **ADMIN** et **FOURNISSEUR** de la plateforme SeneMali/AgriMali.
Les rôles AGRICULTEUR et ACHETEUR sont servis par l'application mobile Flutter (voir `senemali_mobile/`).

## Stack technique

- **Angular 22** — composants **standalone**, **Signals** (pas de NgRx), nouveau control flow `@if/@for/@switch`
- **Reactive Forms** pour tous les formulaires
- **RxJS** pour les appels HTTP
- Aucune dépendance CSS externe : design system maison dans `src/styles.scss`

## Démarrage

```bash
npm install
npm start          # http://localhost:4200, proxy vers http://localhost:8080/api
```

Le backend Spring Boot doit tourner sur `http://localhost:8080` (voir `src/environments/environment.ts`
pour changer l'URL). Le backend autorise déjà `http://localhost:4200` dans son CORS.

## Structure du projet

```
src/app/
  core/                    # Tout ce qui est transverse à l'application
    models/                # Interfaces TypeScript = miroir exact des DTO backend
    services/              # AuthService, ToastService, ConfirmService, CrudService (base), FileStorageService
    interceptors/          # auth.interceptor (Bearer token), error.interceptor (messages d'erreur)
    guards/                # authGuard (connecté ?), roleGuard([...]) (bon rôle ?)
  shared/components/       # Composants réutilisables : data-table, file-upload, toasts, confirm-dialog...
  layout/                  # main-layout (sidebar+topbar, filtré par rôle), auth-layout
  features/                # Un dossier par module métier (voir tableau ci-dessous)
```

### Pourquoi cette architecture ?

- **`CrudService<TResponse, TRequest>`** (`core/services/crud.service.ts`) : classe de base générique.
  Chaque service d'entité "simple" (Cultures, Conseils, Tutoriels, Prix marché, Partenaires,
  Financements, Prestataires, Services agricoles, Catégories) l'étend en 5 lignes et hérite de
  `findAll/findById/create/update/remove`. Cela évite de dupliquer le même code HTTP 9 fois.
- **`DataTableComponent<T>`** (`shared/components/data-table`) : tableau générique piloté par une
  config de colonnes (`ColumnDef<T>[]`), avec pagination, état vide et état de chargement intégrés.
  Chaque page "liste" ne fait que déclarer ses colonnes et son template d'actions.
- **Intercepteurs fonctionnels** : `authInterceptor` ajoute le `Bearer <token>` automatiquement.
  `errorInterceptor` centralise la réaction aux codes HTTP (401 → déconnexion, 403/404/409 → toast
  avec le message métier renvoyé par le `GlobalResponseAdvice` du backend).
- **Guards par rôle** : `roleGuard([RoleEnum.ADMIN])` protège chaque route. La sidebar
  (`layout/nav-items.ts`) est elle-même filtrée par rôle, donc un fournisseur ne voit jamais les
  liens réservés à l'admin.

## Modules livrés

| Module | Rôle | Fonctionnalités |
|---|---|---|
| Dashboard | Admin + Fournisseur | Statistiques (calculées côté client, voir limitation ci-dessous) |
| Utilisateurs | Admin | Liste globale, activer/désactiver, supprimer |
| Agriculteurs / Acheteurs | Admin | Liste (lecture seule), supprimer |
| Fournisseurs | Admin | Liste avec onglets par statut, **valider/refuser**, supprimer |
| Mon profil | Fournisseur | Édition de son propre profil (upload photo inclus) |
| Produits | Admin | Liste (lecture seule), retirer |
| Intrants | Admin (valider) / Fournisseur (CRUD "Mes intrants") | CRUD complet + upload image + workflow de validation |
| Commandes | Admin | Liste, détail avec lignes, changement de statut, suppression |
| Catégories de cultures / Cultures | Admin | CRUD complet |
| Conseils / Tutoriels / Prix du marché | Admin | CRUD complet (upload image pour les tutoriels) |
| Partenaires financiers / Financements | Admin | CRUD complet |
| Prestataires / Services agricoles | Admin | CRUD complet |
| Notifications | Admin (envoyer) / Fournisseur (boîte de réception) | Envoi ciblé, marquer comme lu, tout lire, supprimer |
| Auth | Public | Connexion, inscription (fournisseur uniquement) |

## Limitations connues (côté backend, à garder à l'esprit)

- **Pas d'endpoint de statistiques dédié** : le tableau de bord calcule les compteurs en récupérant
  toutes les listes (`findAll`) côté client. Fonctionne bien pour un volume de données de projet
  étudiant ; prévoir un endpoint `/api/admin/stats` si le volume de données grossit.
- **Un fournisseur ne peut pas voir les commandes contenant ses intrants** : `CommandeController`
  n'expose que "mes commandes" (acheteur) et "toutes les commandes" (admin), pas "commandes
  contenant mes produits" (fournisseur). Un fournisseur ne voit donc que ses intrants, pas qui les a achetés.
- **`CultureAgriculteurController` était absent du zip fourni** alors que le service/repository/mapper
  existaient déjà côté backend : je l'ai ajouté (`/api/cultures-agriculteurs`) car l'app mobile en a
  besoin pour l'écran "Mes cultures" de l'agriculteur.

## Prompt engineering / prochaines étapes suggérées

Si vous voulez étendre ce portail (par exemple ajouter la gestion de mots de passe oubliés, un
vrai endpoint de statistiques, ou l'édition de plusieurs éléments par lot), le pattern
`CrudService` + `DataTableComponent` + config de colonnes doit être réutilisé pour rester cohérent
avec le reste du code.
