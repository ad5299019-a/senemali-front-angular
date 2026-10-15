import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AuthRequest, AuthResponse, RegisterRequest } from '../models/auth.model';
import { RoleEnum } from '../models/enums';
import { UtilisateurResponse } from '../models/utilisateur.model';

const TOKEN_KEY = 'senemali_admin_token';
const USER_KEY = 'senemali_admin_user';

export interface SessionUser {
  id: number;
  nom: string;
  prenom: string;
  identifiant: string;
  role: RoleEnum;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Signal source de vérité pour toute l'app : qui est connecté ? */
  private readonly _currentUser = signal<SessionUser | null>(this.readStoredUser());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === RoleEnum.ADMIN);
  readonly isFournisseur = computed(() => this._currentUser()?.role === RoleEnum.FOURNISSEUR);

  constructor(private http: HttpClient, private router: Router) {}

  login(request: AuthRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap((res) => this.storeSession(res.data, request.identifiant))
    );
  }

  /**
   * Ce portail web ne sert que les rôles ADMIN et FOURNISSEUR.
   * L'inscription publique crée toujours un compte FOURNISSEUR (en attente de
   * validation par un administrateur) — un ADMIN ne peut être créé que depuis
   * l'espace d'administration (voir Utilisateurs), jamais via ce formulaire.
   */
  registerFournisseur(request: RegisterRequest): Observable<ApiResponse<UtilisateurResponse>> {
    const payload: RegisterRequest = { ...request, role: RoleEnum.FOURNISSEUR };
    return this.http.post<ApiResponse<UtilisateurResponse>>(`${environment.apiUrl}/auth/register`, payload);
  }

  registerAdmin(request: RegisterRequest): Observable<ApiResponse<UtilisateurResponse>> {
    const payload: RegisterRequest = { ...request, role: RoleEnum.ADMIN };
    return this.http.post<ApiResponse<UtilisateurResponse>>(`${environment.apiUrl}/auth/register`, payload);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  updateCurrentUser(userUpdate: Partial<SessionUser>): void {
    const current = this._currentUser();
    if (!current) return;
    const updated: SessionUser = { ...current, ...userUpdate };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    this._currentUser.set(updated);
  }

  private storeSession(auth: AuthResponse, requestIdentifier: string): void {
    const user: SessionUser = {
      id: auth.id,
      nom: auth.nom,
      prenom: auth.prenom,
      identifiant: auth.identifiant ?? auth.email ?? requestIdentifier,
      role: auth.role,
    };
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
  }

  private readStoredUser(): SessionUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SessionUser;
    } catch {
      return null;
    }
  }
}
