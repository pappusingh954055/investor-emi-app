import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout-component/layout-component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'investors', loadComponent: () => import('./features/investors/investor-list-component/investor-list-component').then(m => m.InvestorListComponent) },
      { path: 'investor-investments', loadComponent: () => import('./features/investments/investment-list-component/investment-list-component').then(m => m.InvestmentListComponent) },
      { path: 'emi-schedule', loadComponent: () => import('./features/emi/emi-schedule-component/emi-schedule-component').then(m => m.EmiScheduleComponent) },
      { path: 'reminders/reminders-list', loadComponent: () => import('./features/reminders/reminder-list-component/reminder-list-component').then(m => m.ReminderListComponent) },
      { path: 'reminders/upcoming', loadComponent: () => import('./features/reminders/upcoming-reminder-component/upcoming-reminder-component').then(m => m.UpcomingReminderComponent) },
      { path: 'microfinanciers', loadComponent: () => import('./features/microfinancier-component/microfinancier-component').then(m => m.MicrofinancierComponent) },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.Dashboard) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      //{ path: '**', redirectTo: 'investors' }
    ]
  }
];
