import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService } from '../../core/services/crud.service';
import { PrestatireRequest, PrestatireResponse } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class PrestataireService extends CrudService<PrestatireResponse, PrestatireRequest> {
  constructor() {
    super(inject(HttpClient), 'prestataires');
  }
}
