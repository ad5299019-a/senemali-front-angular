import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService } from '../../core/services/crud.service';
import { FinancementRequest, FinancementResponse } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class FinancementService extends CrudService<FinancementResponse, FinancementRequest> {
  constructor() {
    super(inject(HttpClient), 'financements');
  }
}
