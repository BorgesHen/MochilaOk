import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(destinationId: string) {
    return this.http.get<any[]>(`${this.base}/destinations/${destinationId}/categories`);
  }

  create(destinationId: string, payload: { name: string; mode: 'PER_USER'|'CLAIMABLE'; sort_order?: number }) {
    return this.http.post<any>(`${this.base}/destinations/${destinationId}/categories`, payload);
  }
}
