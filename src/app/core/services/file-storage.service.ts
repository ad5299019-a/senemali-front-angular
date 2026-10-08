import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export type UploadFolder = 'profils' | 'produits' | 'intrants' | 'cultures' | 'tutoriels' | 'services' | 'conseils' | 'financements';

export interface UploadResult {
  fileName: string;
  fileUrl: string;
  folder: string;
}

@Injectable({ providedIn: 'root' })
export class FileStorageService {
  constructor(private http: HttpClient) {}

  upload(file: File, folder: UploadFolder): Observable<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<ApiResponse<UploadResult> | UploadResult>(`${environment.apiUrl}/files/upload/${folder}`, formData)
      .pipe(map((res: any) => (res.data ? res.data : res)));
  }

  delete(folder: UploadFolder, fileName: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/files/delete/${folder}/${fileName}`);
  }

  /** Construit l'URL absolue d'affichage à partir d'une valeur stockée (déjà absolue ou relative). */
  resolveUrl(imageUrl: string | null | undefined): string | null {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${environment.fileBaseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }
}
