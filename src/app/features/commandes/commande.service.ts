import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, CommandeResponse, StatutCommandeEnum } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private baseUrl = `${environment.apiUrl}/commandes`;
  private http = inject(HttpClient);

  findAll(): Observable<CommandeResponse[]> {
    return this.http.get<ApiResponse<CommandeResponse[]>>(this.baseUrl).pipe(map((r) => r.data));
  }

  findById(id: number): Observable<CommandeResponse> {
    return this.http.get<ApiResponse<CommandeResponse>>(`${this.baseUrl}/${id}`).pipe(map((r) => r.data));
  }

  //Récuperer la liste des commandes d'un fournisseur
  findFournisseurCommande(): Observable<CommandeResponse[]> {
    return this.http
      .get<ApiResponse<CommandeResponse[]>>(`${this.baseUrl}/mes-commandes`)
      .pipe(map((r) => r.data));
  }

  //Recuperer le total des commandes d'un fournisseur
  countMySales(): Observable<number> {
    return this.http
      .get<ApiResponse<number>>(`${this.baseUrl}/mes-commandes/count`)
      .pipe(map((r) => r.data));
  }

  updateStatut(id: number, statut: StatutCommandeEnum): Observable<CommandeResponse> {
    return this.http
      .patch<ApiResponse<CommandeResponse>>(`${this.baseUrl}/${id}/statut`, null, { params: { statut } })
      .pipe(map((r) => r.data));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(map(() => undefined));
  }
}
