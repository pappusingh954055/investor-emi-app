import { Component, inject, OnInit, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Reminder } from '../../../core/models/reminder.model';
import { MaterialModule } from '../../../shared/material.module';
import { CommonModule } from '@angular/common';
import { ReminderService } from '../../../core/services/reminder.service.ts';

@Component({
  selector: 'app-reminder-list-component',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  templateUrl: './reminder-list-component.html',
  styleUrl: './reminder-list-component.scss',
})
export class ReminderListComponent implements OnInit {

  private reminderService = inject(ReminderService);
  private snack = inject(MatSnackBar);

  /** RAW DATA */
  reminders = signal<Reminder[]>([]);

  /** UI DATA */
  filteredReminders: Reminder[] = [];
  pagedReminders: Reminder[] = [];

  loading = signal(false);

  /** Pagination */
  pageSize = 5;
  pageIndex = 0;

  /** Sorting */
  sortColumn: keyof Reminder | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  displayedColumns = [
    'id',
    'reminderDate',
    'message',
    'investorName',
    'microFinancerName',
    'brokerName',
    'principal',
    'interestType',
    'interestRate',
    'emiamount',
    'status'
  ];

  ngOnInit(): void {
    this.loadAll();
    /** 🔥 AUTO REFRESH AFTER PAYMENT */
    this.reminderService.onRefresh().subscribe(() => {
      this.loadAll(); // update status colors
    });
  }

  /* ===============================
     LOAD ALL REMINDERS
  =============================== */
  loadAll() {
    this.loading.set(true);

    this.reminderService.getAllReminders().subscribe({
      next: data => {
        this.reminders.set(data);
        this.filteredReminders = [...data];
        this.applyPagination();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Failed to load reminders', 'Close', { duration: 3000 });
      }
    });
  }

  /* ===============================
     SEARCH
  =============================== */
  applySearch(value: string) {
    const term = value.toLowerCase();

    this.filteredReminders = this.reminders().filter(r =>
      r.message?.toLowerCase().includes(term) ||
      r.investorName?.toLowerCase().includes(term) ||
      r.microFinancerName?.toLowerCase().includes(term) ||
      r.brokerName?.toLowerCase().includes(term) ||
      r.status?.toLowerCase().includes(term)
    );

    this.pageIndex = 0;
    this.applyPagination();
  }

  /* ===============================
     SORTING
  =============================== */
 sort(column: keyof Reminder) {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  this.filteredReminders.sort((a: any, b: any) => {
    let v1 = a[column];
    let v2 = b[column];

    // normalize null / undefined
    if (v1 == null) v1 = '';
    if (v2 == null) v2 = '';

    // date handling
    if (column === 'reminderDate') {
      v1 = new Date(v1).getTime();
      v2 = new Date(v2).getTime();
    }

    // string handling
    if (typeof v1 === 'string') v1 = v1.toLowerCase();
    if (typeof v2 === 'string') v2 = v2.toLowerCase();

    if (v1 < v2) return this.sortDirection === 'asc' ? -1 : 1;
    if (v1 > v2) return this.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  this.applyPagination();
}


  arrow(col: string) {
    if (this.sortColumn !== col) return '';
    return this.sortDirection === 'asc' ? 'arrow-up' : 'arrow-down';
  }

  /* ===============================
     PAGINATION
  =============================== */
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

  /* ===============================
     STATUS HELPERS
  =============================== */
  isOverdue(r: Reminder): boolean {
    if (r.status !== 'Pending') return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d = new Date(r.reminderDate);
    d.setHours(0, 0, 0, 0);

    return d < today;
  }

  getInterestTypeLabel(type: number): string {
    return type === 1 ? 'Monthly'
      : type === 2 ? 'Yearly'
        : type === 3 ? 'Short'
          : '-';
  }
}
