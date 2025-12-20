import { Component, inject, OnInit, signal } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReminderBellService } from '../../../core/services/reminder-bell.service';
import { ReminderService } from '../../../core/services/reminder.service.ts';
import { Reminder } from '../../../core/models/reminder.model';

@Component({
  selector: 'app-upcoming-reminder-component',
  imports: [MaterialModule, CommonModule],
  templateUrl: './upcoming-reminder-component.html',
  styleUrl: './upcoming-reminder-component.scss',
})
export class UpcomingReminderComponent implements OnInit {

  private reminderService = inject(ReminderService);
  private bellService = inject(ReminderBellService);
  private snack = inject(MatSnackBar);

  reminders = signal<Reminder[]>([]);
  loading = signal(false);

  displayedColumns = [
    'date',
    'message',
    'investor',
    'financer',
    'principal',
    'type',
    'rate',
    'amount',
    'status',
    'action'
  ];

  ngOnInit() {
    //this.loadOverdueReminders();
    this.loadReminders();
  }

  loadOverdueReminders() {
    this.loading.set(true);

    const today = new Date().toISOString();

    this.reminderService.getOverdue(today).subscribe({
      next: (data: any[]) => {
        this.reminders.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Failed to load reminders', 'Close', { duration: 3000 });
      }
    });
  }

  // payNow(reminder: any) {
  //   this.reminderService.markAsPaid(reminder.id).subscribe({
  //     next: () => {
  //       this.snack.open('Payment successful', 'Close', { duration: 2000 });
  //       this.loadOverdueReminders(); // 🔄 refresh grid
  //     },
  //     error: () => {
  //       this.snack.open('Payment failed', 'Close', { duration: 3000 });
  //     }
  //   });
  // }

  // 🔔 Load overdue + upcoming (Pending only)
  loadReminders() {
    this.loading.set(true);

    this.reminderService.getOverdueAndUpcoming().subscribe({
      next: data => {
        // ✅ show only pending
        this.reminders.set(data.filter(r => r.status === 'Pending'));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Failed to load reminders', 'Close', { duration: 3000 });
      }
    });
  }

  // 💰 Pay EMI
  payNow(row: Reminder) {
    this.reminderService.markAsPaid(row.id).subscribe({
      next: () => {
        // ✅ Remove row immediately
        this.reminders.set(
          this.reminders().filter(r => r.id !== row.id)
        );

        // 🔔 Refresh bell count
        this.bellService.refresh();

        this.snack.open('EMI paid successfully', 'Close', { duration: 2000 });
      },
      error: () => {
        this.snack.open('Payment failed', 'Close', { duration: 3000 });
      }
    });
  }

  // 🏷 Interest Type text
  interestTypeText(type: number): string {
    return type === 1 ? 'Monthly'
         : type === 2 ? 'Yearly'
         : 'Short';
  }
}
