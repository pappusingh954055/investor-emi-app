import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Reminder } from '../../../core/models/reminder.model';
import { ReminderService } from '../../../core/services/reminder.service.ts';
import { MaterialModule } from '../../../shared/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reminder-list-component',
  imports: [MaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './reminder-list-component.html',
  styleUrl: './reminder-list-component.scss',
})



export class ReminderListComponent implements OnInit {

  private fb = inject(FormBuilder);
  private reminderService = inject(ReminderService);
  private snack = inject(MatSnackBar);

  reminders = signal<any[]>([]);
  filteredReminders: any[] = [];

  loading = signal(false);

  /** Pagination */
  pageSize = 5;
  pageIndex = 0;
  pagedReminders: any[] = [];

  /** Sorting */
  sortColumn: any | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  sorting = false;

  today = new Date();

  /** Form */
  form: FormGroup = this.fb.group({
    from: [new Date(), Validators.required],
    to: [new Date(new Date().setMonth(new Date().getMonth() + 1)), Validators.required]
  });

  displayedColumns = ['id', 'reminderDate', 'message', 'investorName', 'microFinancer', 'brokername', 'principal', 'interestType', 'interestRate', 'amount', 'status', 'action'];

  ngOnInit(): void {
    this.fetchReminders();
  }

  /** Fetch Data */
  fetchReminders() {
    if (this.form.invalid) return;

    const { from, to } = this.form.value;
    const fromStr = from.toISOString().split('T')[0];
    const toStr = to.toISOString().split('T')[0];

    this.loading.set(true);
    this.reminderService.getUpcoming(fromStr, toStr).subscribe({
      next: data => {
        this.reminders.set(data || []);
        this.filteredReminders = [...this.reminders()];
        this.pageIndex = 0;
        this.applySorting();
        this.applyPagination();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Failed to load reminders', 'Close', { duration: 3000 });
      }
    });
  }


  /** Overdue checker */
  isOverdue(date: Date, status: string): boolean {
    return status === 'Pending' && new Date(date) < new Date();
  }

  /** Pay Now */
  payNow(r: any) {
    const payload = {
      emiScheduleItemId: r.emiScheduleItemId,
      paymentDate: new Date().toISOString(),
      amount: r.amount ?? 0
    };

    this.loading.set(true);
    this.reminderService.payEmi(payload).subscribe({
      next: () => {
        this.snack.open('EMI Paid Successfully', 'Close', { duration: 3000 });
        this.fetchReminders();
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Payment Failed', 'Close', { duration: 3000 });
      }
    });
  }


  /** SEARCH */
  applySearch(event: any) {
    const term = event.target.value.toLowerCase();

    this.filteredReminders = this.reminders().filter(r =>
      r.message?.toLowerCase().includes(term) ||
      r.microFinancerName?.toLowerCase().includes(term) ||
      r.investorName?.toLowerCase().includes(term) ||
      r.amount?.toString().includes(term) ||
      r.status?.toLowerCase().includes(term) ||
      (r.reminderDate + '').toLowerCase().includes(term)
    );

    this.pageIndex = 0;
    this.applySorting();
    this.applyPagination();
  }

  /** SORTING */
  sort(column: string) {
    this.sorting = true; // show loader

    // small UX delay to show loader
    setTimeout(() => {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }

      // Perform sorting
      const sorted = [...this.reminders()].sort((a, b) => {
        const valueA = a[column];
        const valueB = b[column];

        if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      this.reminders.set(sorted);
      this.applyPagination();

      this.sorting = false; // hide loader
    }, 300); // delay for UI effect
  }

  applySorting() {
    if (!this.sortColumn) return;

    this.filteredReminders.sort((a, b) => {
      const valueA = a[this.sortColumn];
      const valueB = b[this.sortColumn];

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /** Sorting arrow (for UI) */
  arrow(col: string) {
    if (this.sortColumn !== col) return '';
    return this.sortDirection === 'asc' ? 'arrow-up' : 'arrow-down';
  }

  /** PAGINATION */
  applyPagination() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedReminders = this.filteredReminders.slice(start, end);
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyPagination();
  }
  getInterestTypeLabel(type: number): string {
    switch (type) {
      case 1:
        return 'Monthly';
      case 2:
        return 'Yearly';
      case 3:
        return 'Short';
      default:
        return '-';
    }
  }

}