import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DestinationsComponent } from './pages/destinations/destinations.component';
import { DestinationDetailComponent } from './pages/destination-detail/destination-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'destinations', canActivate: [authGuard], component: DestinationsComponent },
  { path: 'destinations/:id', canActivate: [authGuard], component: DestinationDetailComponent },

  { path: '', pathMatch: 'full', redirectTo: 'destinations' },
  { path: '**', redirectTo: 'destinations' },
];
