import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, FournisseurRequest, FournisseurResponse, StatutValidationFournisseur } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class FournisseurService {
  private baseUrl = `${environment.apiUrl}/fournisseurs`;
  private http = inject(HttpClient);

  findAll(): Observable<FournisseurResponse[]> {
    return this.http.get<ApiResponse<FournisseurResponse[]>>(this.baseUrl).pipe(map((r) => r.data));
  }

  findByStatut(statut: StatutValidationFournisseur): Observable<FournisseurResponse[]> {
    return this.http
      .get<ApiResponse<FournisseurResponse[]>>(`${this.baseUrl}/statut/${statut}`)
      .pipe(map((r) => r.data));
  }

  findById(id: number): Observable<FournisseurResponse> {
    return this.http.get<ApiResponse<FournisseurResponse>>(`${this.baseUrl}/${id}`).pipe(map((r) => r.data));
  }

  update(id: number, payload: FournisseurRequest): Observable<FournisseurResponse> {
    return this.http.put<ApiResponse<FournisseurResponse>>(`${this.baseUrl}/${id}`, payload).pipe(map((r) => r.data));
  }

  valider(id: number, statut: StatutValidationFournisseur): Observable<FournisseurResponse> {
    return this.http
      .patch<ApiResponse<FournisseurResponse>>(`${this.baseUrl}/${id}/valider`, null, { params: { statut } })
      .pipe(map((r) => r.data));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(map(() => undefined));
  }
}
