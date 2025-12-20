import { Component, inject, OnInit, signal } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Investor } from '../../../core/models/investor.model';
import { InvestorService } from '../../../core/services/investor.service.ts';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-investor-list-component',
  imports: [MaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './investor-list-component.html',
  styleUrl: './investor-list-component.scss',
})
export class InvestorListComponent implements OnInit {

  private fb = inject(FormBuilder);
  private investorService = inject(InvestorService);
  private snack = inject(MatSnackBar);

  investors = signal<Investor[]>([]);
  pagedInvestors: Investor[] = [];

  loading = signal(false);
  saving = signal(false);
  editingId = signal<number | null>(null);

  /** PAGINATION SETTINGS */
  pageSize = 5;
  pageIndex = 0;



  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.email, Validators.maxLength(200)]],
    phone: ['', [Validators.maxLength(50)]]
  });

  displayedColumns = ['id', 'name', 'email', 'phone', 'actions'];

  ngOnInit(): void {
    this.loadInvestors();
  }

  loadInvestors() {
    this.loading.set(true);
    this.investorService.getAll().subscribe({
      next: (data) => {
        this.investors.set(data);
        this.applyPagination();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Failed to load investors', 'Close', { duration: 3000 });
      }
    });
  }

  /** PAGE LOGIC */
  applyPagination() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedInvestors = this.investors().slice(start, end);
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyPagination();
  }

  resetForm() {
    this.editingId.set(null);
    this.form.reset();
  }

  edit(investor: Investor) {
    this.editingId.set(investor.id);
    this.form.patchValue({
      name: investor.name,
      email: investor.email,
      phone: investor.phone
    });
  }

  delete(investor: Investor) {
    if (!confirm(`Delete investor "${investor.name}"?`)) return;

    this.saving.set(true);
    this.investorService.delete(investor.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open('Investor deleted', 'Close', { duration: 2000 });
        this.loadInvestors();
      },
      error: () => {
        this.saving.set(false);
        this.snack.open('Delete failed', 'Close', { duration: 3000 });
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    this.saving.set(true);
    const id = this.editingId();

    if (id == null) {
      // CREATE
      this.investorService.create(value as any).subscribe({
        next: () => {
          this.saving.set(false);
          this.snack.open('Investor created', 'Close', { duration: 2000 });
          this.resetForm();
          this.loadInvestors();
        },
        error: () => {
          this.saving.set(false);
          this.snack.open('Create failed', 'Close', { duration: 3000 });
        }
      });
    } else {
      // UPDATE
      this.investorService.update(id, value as any).subscribe({
        next: () => {
          this.saving.set(false);
          this.snack.open('Investor updated', 'Close', { duration: 2000 });
          this.resetForm();
          this.loadInvestors();
        },
        error: () => {
          this.saving.set(false);
          this.snack.open('Update failed', 'Close', { duration: 3000 });
        }
      });
    }
  }
}