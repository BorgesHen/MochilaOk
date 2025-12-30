import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DestinationsService } from '../../services/destinations.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-destinations',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './destinations.component.html',
})
export class DestinationsComponent implements OnInit {
  destinations: any[] = [];
  error: string | null = null;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    location: [''],
  });

  constructor(
    private fb: FormBuilder,
    private api: DestinationsService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.error = null;
    this.api.list().subscribe({
      next: (r) => this.destinations = r,
      error: (e) => this.error = e?.error?.error ?? 'Erro ao carregar viagens',
    });
  }

  create() {
    this.error = null;
    if (this.form.invalid) return;

    this.api.create(this.form.value as any).subscribe({
      next: () => {
        this.form.reset();
        this.load();
      },
      error: (e) => this.error = e?.error?.error ?? 'Erro ao criar viagem',
    });
  }
}
