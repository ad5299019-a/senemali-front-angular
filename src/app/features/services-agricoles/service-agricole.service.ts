import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService } from '../../core/services/crud.service';
import { ServiceAgricoleRequest, ServiceAgricoleResponse } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class ServiceAgricoleService extends CrudService<ServiceAgricoleResponse, ServiceAgricoleRequest> {
  constructor() {
    super(inject(HttpClient), 'services');
  }
}
