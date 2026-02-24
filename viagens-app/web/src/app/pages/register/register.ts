import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  nome = '';
  email = '';
  senha = '';
  loading = false;
  error = '';

  private auth = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  onSubmit() {
    if (!this.nome || !this.email || !this.senha) {
      this.error = 'Preencha todos os campos';
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.register({
      name: this.nome,
      email: this.email,
      password: this.senha
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/destinations');
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.error ?? 'Erro ao criar conta';
      }
    });
  }
}