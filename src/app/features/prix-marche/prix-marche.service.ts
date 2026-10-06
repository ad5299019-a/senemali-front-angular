import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService } from '../../core/services/crud.service';
import { PrixMarcheRequest, PrixMarcheResponse } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class PrixMarcheService extends CrudService<PrixMarcheResponse, PrixMarcheRequest> {
  constructor() {
    super(inject(HttpClient), 'prix-marche');
  }
}
