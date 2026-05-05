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
<<<<<<< HEAD
  { path: 'destinations', component: DestinationsComponent }
=======

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
>>>>>>> 8eb8dff759c237c18d89552c2b88a020fed0303e
];