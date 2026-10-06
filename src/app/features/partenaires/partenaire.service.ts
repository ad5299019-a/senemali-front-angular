import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService } from '../../core/services/crud.service';
import { PartenaireFinancierRequest, PartenaireFinancierResponse } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class PartenaireService extends CrudService<PartenaireFinancierResponse, PartenaireFinancierRequest> {
  constructor() {
    super(inject(HttpClient), 'partenaires');
  }
}
