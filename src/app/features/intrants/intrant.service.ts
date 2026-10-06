import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CrudService } from '../../core/services/crud.service';
import { ApiResponse, IntrantRequest, IntrantResponse, StatutValidationFournisseur } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class IntrantService extends CrudService<IntrantResponse, IntrantRequest> {
  constructor() {
    super(inject(HttpClient), 'intrants');
  }

  findByFournisseur(idFournisseur: number): Observable<IntrantResponse[]> {
    return this.http
      .get<ApiResponse<IntrantResponse[]>>(`${this.baseUrl}/fournisseur/${idFournisseur}`)
      .pipe(map((r) => r.data));
  }

  valider(id: number, statut: StatutValidationFournisseur): Observable<IntrantResponse> {
    return this.http
      .patch<ApiResponse<IntrantResponse>>(`${this.baseUrl}/${id}/valider`, null, { params: { statut } })
      .pipe(map((r) => r.data));
  }
}
