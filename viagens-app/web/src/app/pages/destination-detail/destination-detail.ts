import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { DestinationsService } from '../../services/destinations.service';
import { CategoriesService } from '../../services/categories.service';
import { ItemsService } from '../../services/items.service';

@Component({
  standalone: true,
  selector: 'app-destination-detail',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './destination-detail.html',
  styleUrl: './destination-detail.scss',
})
export class DestinationDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  private destinationsApi = inject(DestinationsService);
  private categoriesApi = inject(CategoriesService);
  private itemsApi = inject(ItemsService);

  destinationId = '';
  destination: any = null;
  members: any[] = [];
  categories: any[] = [];
  items: any[] = [];

  error: string | null = null;

  categoryForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    mode: ['PER_USER', [Validators.required]],
    sort_order: [0],
  });

  itemForm = this.fb.group({
    category_id: ['', [Validators.required]],
    title: ['', [Validators.required, Validators.minLength(2)]],
    qty: [1],
    unit: [''],
    notes: [''],
  });

  ngOnInit() {
    this.destinationId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadAll();
  }

  loadAll() {
    this.error = null;

    this.destinationsApi.get(this.destinationId).subscribe({
      next: (r) => {
        this.destination = r.destination;
        this.members = r.members;
      },
      error: (e: any) => {
        this.error = e?.error?.error ?? 'Erro ao carregar viagem';
      },
    });

    this.loadCategories();
    this.loadItems();
  }

  loadCategories() {
    this.categoriesApi.list(this.destinationId).subscribe({
      next: (r) => (this.categories = r),
      error: (e: any) => {
        this.error = e?.error?.error ?? 'Erro ao carregar categorias';
      },
    });
  }

  loadItems() {
    this.itemsApi.list(this.destinationId).subscribe({
      next: (r) => (this.items = r),
      error: (e: any) => {
        this.error = e?.error?.error ?? 'Erro ao carregar itens';
      },
    });
  }

  createCategory() {
    this.error = null;

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.categoriesApi.create(this.destinationId, this.categoryForm.value as any).subscribe({
      next: () => {
        this.categoryForm.reset({
          name: '',
          mode: 'PER_USER',
          sort_order: 0,
        });

        this.loadCategories();
      },
      error: (e: any) => {
        this.error = e?.error?.error ?? 'Erro ao criar categoria';
      },
    });
  }

  createItem() {
    this.error = null;

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.itemsApi.create(this.destinationId, this.itemForm.value as any).subscribe({
      next: () => {
        this.itemForm.reset({
          category_id: '',
          title: '',
          qty: 1,
          unit: '',
          notes: '',
        });

        this.loadItems();
      },
      error: (e: any) => {
        this.error = e?.error?.error ?? 'Erro ao criar item';
      },
    });
  }

  markDone(item: any) {
    this.itemsApi.setStatus(item.id, 'DONE').subscribe({
      next: () => this.loadItems(),
      error: (e: any) => {
        this.error = e?.error?.error ?? 'Erro ao atualizar item';
      },
    });
  }

  markPending(item: any) {
    this.itemsApi.setStatus(item.id, 'PENDING').subscribe({
      next: () => this.loadItems(),
      error: (e: any) => {
        this.error = e?.error?.error ?? 'Erro ao atualizar item';
      },
    });
  }

  claim(item: any) {
    this.itemsApi.claim(item.id, true).subscribe({
      next: () => this.loadItems(),
      error: (e: any) => {
        this.error = e?.error?.error ?? 'Erro ao assumir item';
      },
    });
  }

  unclaim(item: any) {
    this.itemsApi.claim(item.id, false).subscribe({
      next: () => this.loadItems(),
      error: (e: any) => {
        this.error = e?.error?.error ?? 'Erro ao liberar item';
      },
    });
  }
}