import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CrudService } from '../../core/services/crud.service';
import { CultureRequest, CultureResponse, ApiResponse } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class CultureService extends CrudService<CultureResponse, CultureRequest> {
  constructor() {
    super(inject(HttpClient), 'cultures');
  }

  findByCategorie(idCategorie: number): Observable<CultureResponse[]> {
    return this.http
      .get<ApiResponse<CultureResponse[]>>(`${this.baseUrl}/categorie/${idCategorie}`)
      .pipe(map((r) => r.data));
  }
}
