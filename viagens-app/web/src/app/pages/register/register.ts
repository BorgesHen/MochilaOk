import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent {
  nome = '';
  email = '';
  senha = '';
  loading = false;
  error = '';

  private auth = inject(AuthService);
  private router = inject(Router);

  onSubmit() {
    if (!this.nome.trim() || !this.email.trim() || !this.senha) {
      this.error = 'Preencha todos os campos';
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth
      .register({
        name: this.nome.trim(),
        email: this.email.trim(),
        password: this.senha,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigateByUrl('/destinations');
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err?.error?.error ?? 'Erro ao criar conta';
        },
      });
  }
}
