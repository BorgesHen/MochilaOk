import { Injectable } from '@angular/core';

const KEY = 'api_token';

@Injectable({ providedIn: 'root' })
export class TokenService {
  get(): string | null {
    return localStorage.getItem(KEY);
  }
  set(token: string) {
    localStorage.setItem(KEY, token);
  }
  clear() {
    localStorage.removeItem(KEY);
  }
  isLoggedIn(): boolean {
    return !!this.get();
  }
}
