import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService } from '../../core/services/crud.service';
import { ProduitAgricoleRequest, ProduitAgricoleResponse } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class ProduitService extends CrudService<ProduitAgricoleResponse, ProduitAgricoleRequest> {
  constructor() {
    super(inject(HttpClient), 'produits');
  }
}
