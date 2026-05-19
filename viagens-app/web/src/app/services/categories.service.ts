import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type CategoryMode = 'PER_USER' | 'CLAIMABLE';

export interface CategoryPayload {
  name: string;
  mode: CategoryMode;
  sort_order?: number | null;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(destinationId: string) {
    return this.http.get<any[]>(`${this.base}/destinations/${destinationId}/categories`);
  }

  create(destinationId: string, payload: CategoryPayload) {
    return this.http.post<any>(`${this.base}/destinations/${destinationId}/categories`, payload);
  }

  update(destinationId: string, categoryId: string, payload: CategoryPayload) {
    return this.http.patch<any>(
      `${this.base}/destinations/${destinationId}/categories/${categoryId}`,
      payload
    );
  }

  delete(destinationId: string, categoryId: string) {
    return this.http.delete<any>(`${this.base}/destinations/${destinationId}/categories/${categoryId}`);
  }
}
