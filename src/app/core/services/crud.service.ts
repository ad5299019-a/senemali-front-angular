import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

/**
 * Base réutilisée par tous les services d'entité (Cultures, Conseils, Tutoriels,
 * PrixMarché, Financements, Partenaires, Prestataires, Services agricoles, ...).
 *
 * Chaque service concret n'a qu'à fournir le segment d'URL ; il hérite de
 * findAll/findById/create/update/remove et peut ajouter ses propres méthodes
 * spécifiques (ex: findByCulture, valider, ...).
 *
 * `unwrap` retire l'enveloppe ApiResponse<T> posée par le backend pour ne
 * manipuler que la donnée utile dans le reste de l'application.
 */
export abstract class CrudService<TResponse, TRequest = Partial<TResponse>> {
  protected readonly baseUrl: string;

  protected constructor(protected http: HttpClient, resourcePath: string) {
    this.baseUrl = `${environment.apiUrl}/${resourcePath}`;
  }

  findAll(): Observable<TResponse[]> {
    return this.http.get<ApiResponse<TResponse[]>>(this.baseUrl).pipe(map((r) => r.data));
  }

  findById(id: number): Observable<TResponse> {
    return this.http.get<ApiResponse<TResponse>>(`${this.baseUrl}/${id}`).pipe(map((r) => r.data));
  }

  create(payload: TRequest): Observable<TResponse> {
    return this.http.post<ApiResponse<TResponse>>(this.baseUrl, payload).pipe(map((r) => r.data));
  }

  update(id: number, payload: TRequest): Observable<TResponse> {
    return this.http.put<ApiResponse<TResponse>>(`${this.baseUrl}/${id}`, payload).pipe(map((r) => r.data));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(map(() => undefined));
  }
}
