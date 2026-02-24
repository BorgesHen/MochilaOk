import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const KEY = 'api_token';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  get(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem(KEY);
  }
  set(token: string) {
    if (!this.isBrowser) {
      return;
    }
    localStorage.setItem(KEY, token);
  }
  clear() {
    if (!this.isBrowser) {
      return;
    }
    localStorage.removeItem(KEY);
  }
  isLoggedIn(): boolean {
    return !!this.get();
  }
}
