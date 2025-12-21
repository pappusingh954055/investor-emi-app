

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
import { ReminderService } from '../../core/services/reminder.service.ts';

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

  private reminderService = inject(ReminderService);
  private router = inject(Router);

  private sub?: Subscription;

  bellShake = signal(false);

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

    this.loadBell(); //initial load

    // 🔁 Auto refresh every 60s
    this.sub = interval(60000).subscribe(() => this.loadBell());

    // 🔔 Listen for global refresh
    this.reminderService.onRefresh().subscribe(() => {
      this.loadBell(); // reload bell count
      this.triggerBellShake();
    });

    // keep footer year updated
    setInterval(() => {
      this.currentYear = new Date().getFullYear();
    }, 60000);
  }

  loadBell() {
    this.reminderBellService.getCount().subscribe(res => {
      this.reminderCount.set(res.count);
    });
  }

  triggerBellShake() {
    this.bellShake.set(true);
    setTimeout(() => this.bellShake.set(false), 800);
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
