import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AcheteurResponse, ApiResponse } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class AcheteurService {
  private baseUrl = `${environment.apiUrl}/acheteurs`;
  private http = inject(HttpClient);

  findAll(): Observable<AcheteurResponse[]> {
    return this.http.get<ApiResponse<AcheteurResponse[]>>(this.baseUrl).pipe(map((r) => r.data));
  }

  findById(id: number): Observable<AcheteurResponse> {
    return this.http.get<ApiResponse<AcheteurResponse>>(`${this.baseUrl}/${id}`).pipe(map((r) => r.data));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(map(() => undefined));
  }
}
