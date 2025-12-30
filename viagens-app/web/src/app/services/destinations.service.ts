import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DestinationsService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<any[]>(`${this.base}/destinations`);
  }

  create(payload: { title: string; location?: string }) {
    return this.http.post<any>(`${this.base}/destinations`, payload);
  }

  get(id: string) {
    return this.http.get<any>(`${this.base}/destinations/${id}`);
  }
}
