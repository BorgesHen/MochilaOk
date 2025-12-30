import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(destinationId: string) {
    return this.http.get<any[]>(`${this.base}/destinations/${destinationId}/items`);
  }

  create(destinationId: string, payload: any) {
    return this.http.post<any>(`${this.base}/destinations/${destinationId}/items`, payload);
  }

  setStatus(itemId: string, status: 'PENDING'|'DONE') {
    return this.http.patch(`${this.base}/items/${itemId}/status`, { status });
  }

  claim(itemId: string, claimed: boolean) {
    return this.http.patch(`${this.base}/items/${itemId}/claim`, { claimed });
  }
}
