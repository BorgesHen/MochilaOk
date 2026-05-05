import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
<<<<<<< HEAD

=======
>>>>>>> 8eb8dff759c237c18d89552c2b88a020fed0303e
import { DestinationsService } from '../../services/destinations.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-destinations',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './destinations.component.html',
})
export class DestinationsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(DestinationsService);
  private router = inject(Router);
  public auth = inject(AuthService);

  destinations: any[] = [];
  error: string | null = null;
  showForm = false;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    location: [''],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.error = null;

    this.api.list().subscribe({
      next: (r: any[]) => {
        this.destinations = r;
      },
      error: (e: any) => {
        this.error = e?.error?.error ?? 'Erro ao carregar viagens';
      },
    });
  }

  openCreateForm() {
    this.showForm = true;
  }

  cancelCreate() {
    this.showForm = false;
    this.form.reset({
      title: '',
      location: '',
    });
  }

  create() {
    this.error = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.api.create(this.form.value as any).subscribe({
      next: (created) => {
<<<<<<< HEAD
        this.form.reset({
          title: '',
          location: '',
        });

        this.showForm = false;

        this.router.navigate(['/destinations', created.id]);
      },
      error: (e: any) => {
        this.error = e?.error?.error ?? 'Erro ao criar viagem';
=======
        this.form.reset();
        this.router.navigate(['/destinations', created.id]);
>>>>>>> 8eb8dff759c237c18d89552c2b88a020fed0303e
      },
    });
  }
<<<<<<< HEAD

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
=======
>>>>>>> 8eb8dff759c237c18d89552c2b88a020fed0303e
}