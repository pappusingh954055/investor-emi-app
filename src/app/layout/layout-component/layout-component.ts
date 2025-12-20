// import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
// import { MaterialModule } from '../../shared/material.module';
// import { Router, RouterLink, RouterOutlet } from '@angular/router';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { Reminder } from '../../core/models/reminder.model';
// import { ReminderService } from '../../core/services/reminder.service.ts';
// import { CommonModule } from '@angular/common';
// import { interval, startWith, Subscription } from 'rxjs';
// import { ReminderBellService } from '../../core/services/reminder-bell.service';

// @Component({
//   selector: 'app-layout',
//   imports: [MaterialModule, RouterOutlet, ReactiveFormsModule, RouterLink, CommonModule],
//   templateUrl: './layout-component.html',
//   styleUrl: './layout-component.scss',
// })
// export class LayoutComponent implements OnInit, AfterViewInit, OnDestroy {
//   isMenuOpened = signal(true);
//   mobileQuery = window.matchMedia('(max-width: 800px)');
//   currentYear = new Date().getFullYear();

//   reminderCount = signal(0);


//   private sub?: Subscription;

//   @ViewChild('drawer') drawer: any;
//   currentTheme = signal(localStorage.getItem('theme') || 'dark');

//   private reminderService = inject(ReminderService);

//   private reminderBell = inject(ReminderBellService);
//   private router = inject(Router);

//   reminders = signal<Reminder[]>([]);
//   pendingCount = signal(0);

//   bellCount = signal(0);

//   toggleMenu() {
//     this.isMenuOpened.set(!this.isMenuOpened());
//   }
//   toggleTheme() {
//     const newTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
//     this.currentTheme.set(newTheme);
//     document.body.classList.remove('dark-theme', 'light-theme');
//     document.body.classList.add(newTheme + '-theme');
//     localStorage.setItem('theme', newTheme);
//   }
//   ngOnInit() {
//     // ⏱ Auto refresh every 60s
//     this.sub = interval(60000)
//       .pipe(startWith(0))
//       .subscribe(() => this.loadBell());
//     setInterval(() => {
//       this.currentYear = new Date().getFullYear();
//     }, 60000);
//     this.loadPendingReminders();
//     document.body.classList.add(this.currentTheme() + '-theme');
//   }
//   loadBell() {
//     this.reminderBell.getCount().subscribe(res => {
//       this.reminderCount.set(res.count);
//     });
//   }
//   ngAfterViewInit(): void {
//     this.drawer.openedChange.subscribe(() => {
//       setTimeout(() => window.dispatchEvent(new Event('resize')), 250);
//     });
//   }
//   onBellClick() {
//     this.router.navigate(['/reminders/upcoming']);
//   }

//   ngOnDestroy() {
//     this.sub?.unsubscribe();
//   }
//   loadPendingReminders() {
//     const today = new Date().toISOString().split('T')[0];

//     this.reminderService.getUpcoming(today, today).subscribe({
//       next: data => {
//         this.reminders.set(data);
//         this.pendingCount.set(data.filter(r => !r.isSent).length);
//       }
//     });
//   }
//   loadBellCount() {
//     this.reminderService.getReminderBellCount().subscribe(res => {
//       this.bellCount.set(res.pendingCount);
//     });
//   }
// }


import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import { MaterialModule } from '../../shared/material.module';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { interval, startWith, Subscription } from 'rxjs';

import { ReminderBellService } from '../../core/services/reminder-bell.service';

@Component({
  selector: 'app-layout',
  imports: [
    MaterialModule,
    RouterOutlet,
    ReactiveFormsModule,
    RouterLink,
    CommonModule
  ],
  templateUrl: './layout-component.html',
  styleUrl: './layout-component.scss',
})
export class LayoutComponent implements OnInit, AfterViewInit, OnDestroy {

  /* =========================
     UI STATE
  ========================== */

  mobileQuery: MediaQueryList = window.matchMedia('(max-width: 800px)');
  isMenuOpened = signal(true);
  currentTheme = signal(localStorage.getItem('theme') || 'dark');
  currentYear = new Date().getFullYear();

  /* =========================
     🔔 REMINDER BELL (SINGLE SOURCE OF TRUTH)
  ========================== */
  reminderCount = signal(0);

  private reminderBellService = inject(ReminderBellService);
  private router = inject(Router);

  private sub?: Subscription;

  @ViewChild('drawer') drawer: any;

  /* =========================
     MENU / THEME
  ========================== */
  toggleMenu(): void {
    this.isMenuOpened.set(!this.isMenuOpened());
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.currentTheme.set(newTheme);

    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(`${newTheme}-theme`);

    localStorage.setItem('theme', newTheme);
  }

  /* =========================
     LIFECYCLE
  ========================== */
  ngOnInit(): void {
    // apply saved theme
    document.body.classList.add(`${this.currentTheme()}-theme`);

    // ⏱ Auto refresh bell every 60 seconds (also load immediately)
    this.sub = interval(60000)
      .pipe(startWith(0))
      .subscribe(() => this.loadBellCount());

    // keep footer year updated
    setInterval(() => {
      this.currentYear = new Date().getFullYear();
    }, 60000);
  }

  ngAfterViewInit(): void {
    // fix layout resize after sidenav toggle
    this.drawer?.openedChange.subscribe(() => {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 250);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /* =========================
     🔔 BELL LOGIC
  ========================== */
  private loadBellCount(): void {
    this.reminderBellService.getCount().subscribe(res => {
      this.reminderCount.set(res.count);
    });
  }

  onBellClick(): void {
    if (this.reminderCount() > 0) {
      this.router.navigate(['/reminders/upcoming']);
    }
  }
}
