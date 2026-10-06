import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService } from '../../core/services/crud.service';
import { CategorieCultureRequest, CategorieCultureResponse } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class CategorieCultureService extends CrudService<CategorieCultureResponse, CategorieCultureRequest> {
  constructor() {
    super(inject(HttpClient), 'categories-cultures');
  }
}
