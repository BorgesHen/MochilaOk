import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs';
import { TokenService } from './token.service';

type AuthResponse = { token: string; user: any };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient, private token: TokenService) {}

  register(payload: { name: string; email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.base}/auth/register`, payload).pipe(
      tap((r) => this.token.set(r.token))
    );
  }

  login(payload: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, payload).pipe(
      tap((r) => this.token.set(r.token))
    );
  }

  logout() {
    this.token.clear();
  }
}
