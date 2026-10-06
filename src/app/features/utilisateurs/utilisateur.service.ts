import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, UtilisateurRequest, UtilisateurResponse } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private baseUrl = `${environment.apiUrl}/utilisateurs`;
  private http = inject(HttpClient);

  findAll(): Observable<UtilisateurResponse[]> {
    return this.http.get<ApiResponse<UtilisateurResponse[]>>(this.baseUrl).pipe(map((r) => r.data));
  }

  findById(id: number): Observable<UtilisateurResponse> {
    return this.http.get<ApiResponse<UtilisateurResponse>>(`${this.baseUrl}/${id}`).pipe(map((r) => r.data));
  }

  update(id: number, payload: UtilisateurRequest): Observable<UtilisateurResponse> {
    return this.http.put<ApiResponse<UtilisateurResponse>>(`${this.baseUrl}/${id}`, payload).pipe(map((r) => r.data));
  }

  toggleStatut(id: number): Observable<UtilisateurResponse> {
    return this.http.patch<ApiResponse<UtilisateurResponse>>(`${this.baseUrl}/${id}/toggle-statut`, {}).pipe(map((r) => r.data));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(map(() => undefined));
  }
}
