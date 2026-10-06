import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService } from '../../core/services/crud.service';
import { TutorielRequest, TutorielResponse } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class TutorielService extends CrudService<TutorielResponse, TutorielRequest> {
  constructor() {
    super(inject(HttpClient), 'tutoriels');
  }
}
