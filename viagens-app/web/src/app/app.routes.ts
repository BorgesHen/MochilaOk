import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './pages/register/register';
import { DestinationsComponent } from './pages/destinations/destinations.component';
import { DestinationDetail } from './pages/destination-detail/destination-detail';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'destinations',
    component: DestinationsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'destinations/:id',
    component: DestinationDetail,
    canActivate: [authGuard],
  },

  { path: 'dashboard', redirectTo: 'destinations', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
