import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CrudService } from '../../core/services/crud.service';
import { ConseilRequest, ConseilResponse, ApiResponse } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class ConseilService extends CrudService<ConseilResponse, ConseilRequest> {
  constructor() {
    super(inject(HttpClient), 'conseils');
  }

  findByCulture(idCulture: number): Observable<ConseilResponse[]> {
    return this.http.get<ApiResponse<ConseilResponse[]>>(`${this.baseUrl}/culture/${idCulture}`).pipe(map((r) => r.data));
  }
}
