import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgriculteurResponse, ApiResponse } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class AgriculteurService {
  private baseUrl = `${environment.apiUrl}/agriculteurs`;
  private http = inject(HttpClient);

  findAll(): Observable<AgriculteurResponse[]> {
    return this.http.get<ApiResponse<AgriculteurResponse[]>>(this.baseUrl).pipe(map((r) => r.data));
  }

  findById(id: number): Observable<AgriculteurResponse> {
    return this.http.get<ApiResponse<AgriculteurResponse>>(`${this.baseUrl}/${id}`).pipe(map((r) => r.data));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(map(() => undefined));
  }
}
