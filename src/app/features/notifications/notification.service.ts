import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, NotificationRequest, NotificationResponse } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private baseUrl = `${environment.apiUrl}/notifications`;
  private http = inject(HttpClient);

  create(payload: NotificationRequest): Observable<NotificationResponse> {
    return this.http.post<ApiResponse<NotificationResponse>>(this.baseUrl, payload).pipe(map((r) => r.data));
  }

  findByUtilisateur(idUtilisateur: number): Observable<NotificationResponse[]> {
    return this.http
      .get<ApiResponse<NotificationResponse[]>>(`${this.baseUrl}/utilisateur/${idUtilisateur}`)
      .pipe(map((r) => r.data));
  }

  countNonLues(idUtilisateur: number): Observable<number> {
    return this.http
      .get<ApiResponse<number>>(`${this.baseUrl}/utilisateur/${idUtilisateur}/count`)
      .pipe(map((r) => r.data));
  }

  markAsLue(id: number): Observable<NotificationResponse> {
    return this.http.patch<ApiResponse<NotificationResponse>>(`${this.baseUrl}/${id}/lue`, {}).pipe(map((r) => r.data));
  }

  markAllAsLue(idUtilisateur: number): Observable<void> {
    return this.http
      .patch<ApiResponse<void>>(`${this.baseUrl}/utilisateur/${idUtilisateur}/tout-lire`, {})
      .pipe(map(() => undefined));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(map(() => undefined));
  }
}
