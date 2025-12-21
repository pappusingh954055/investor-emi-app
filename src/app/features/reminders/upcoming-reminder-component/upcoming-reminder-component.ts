import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { MaterialModule } from '../../../shared/material.module';
import { Reminder } from '../../../core/models/reminder.model';
import { ReminderService } from '../../../core/services/reminder.service.ts';
import { PayConfirmDialogComponent } from '../../../shared/components/pay-confirm-dialog-component/pay-confirm-dialog-component';

@Component({
  selector: 'app-upcoming-reminder-component',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  templateUrl: './upcoming-reminder-component.html',
  styleUrl: './upcoming-reminder-component.scss',
})
export class UpcomingReminderComponent implements OnInit {

  private reminderService = inject(ReminderService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  reminders = signal<Reminder[]>([]);
  loading = signal(false);
  payingId = signal<number | null>(null);

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

  /* ===============================
     INIT
  =============================== */
  ngOnInit(): void {
    this.loadReminders();
    this.reminderService.onRefresh().subscribe(() => {
    this.loadReminders();
  });
  }

  /* ===============================
     LOAD OVERDUE + UPCOMING
     (Pending only)
  =============================== */
  loadReminders(): void {
    this.loading.set(true);

    this.reminderService.getOverdueAndUpcoming().subscribe({
      next: (data: any) => {
        this.reminders.set(data.filter((r: any) => r.status === 'Pending'));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Failed to load reminders', 'Close', { duration: 3000 });
      }
    });
  }

  /* ===============================
     💰 PAY EMI (with confirmation)
  =============================== */
  payNow(reminder: Reminder) {
    const dialogRef = this.dialog.open(PayConfirmDialogComponent, {
      width: '420px',
      data: reminder
    });

    dialogRef.afterClosed().subscribe((confirm: any) => {
      if (!confirm) return;

      this.reminderService.payReminder(reminder.id).subscribe({
        next: (receipt: any) => {

          // ✅ Remove from UI immediately
          this.reminders.set(
            this.reminders().filter((r: any) => r.id !== reminder.id)
          );

          // 🔔 Refresh bell + other pages
          this.reminderService.notifyRefresh();

          // 📄 Auto-download receipt (optional next step)
          console.log('Receipt:', receipt);
          this.downloadReceipt(receipt);

          this.snack.open(
            `₹${receipt.interestAmount} paid successfully`,
            'Close',
            { duration: 3000 }
          );
        },
        error: () => {
          this.snack.open('Payment failed', 'Close', { duration: 3000 });
        }
      });
    });
  }

  /* ===============================
     📄 RECEIPT GENERATION
  ================================ */
  private downloadReceipt(receipt: any) {
    const content = `
        ----------------------------------------
                EMI PAYMENT RECEIPT
        ----------------------------------------

        Receipt ID      : ${receipt.reminderId}
        Investor        : ${receipt.investorName}
        Micro Financer  : ${receipt.financerName}

        Amount Paid     : ₹${receipt.interestAmount}
        Paid Date       : ${new Date(receipt.paidOn).toLocaleString()}

        Status          : PAID

        ----------------------------------------
        Thank you for your payment
        Investor EMI System
        ----------------------------------------
        `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `EMI_Receipt_${receipt.reminderId}.txt`;
    a.click();

    window.URL.revokeObjectURL(url);
  }
  /* ===============================
     ⏰ OVERDUE LOGIC (RED)
  =============================== */
  isOverdue(reminder: Reminder): boolean {
    if (reminder.status !== 'Pending') return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reminderDate = new Date(reminder.reminderDate);
    reminderDate.setHours(0, 0, 0, 0);

    return reminderDate < today;
  }

  /* ===============================
     🏷 INTEREST TYPE LABEL
  =============================== */
  interestTypeText(type: number): string {
    switch (type) {
      case 1: return 'Monthly';
      case 2: return 'Yearly';
      case 3: return 'Short';
      default: return '-';
    }
  }


  /* ===============================
     ⏰ SNOOZE REMINDER
  ================================ */
  snooze(reminder: Reminder, days: number) {
    this.reminderService.snooze(reminder.id, days).subscribe(() => {

      // 🔥 Remove immediately
      this.reminders.set(
        this.reminders().filter(r => r.id !== reminder.id)
      );

      // 🔔 Global refresh
      this.reminderService.notifyRefresh();

      this.snack.open(`Snoozed for ${days} days`, 'Close', { duration: 2000 });
    });
  }
}
