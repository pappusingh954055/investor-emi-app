import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';

import { MaterialModule } from '../../../shared/material.module';
import {
  ChartConfiguration,
  ChartOptions,
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  BarController,
  LineController,
  DoughnutController
} from 'chart.js';

import { BaseChartDirective } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { DashboardService } from '../../../core/services/dashboard.service';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  BarController,
  LineController,
  DoughnutController
);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MatCardModule, BaseChartDirective, MaterialModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  @ViewChildren(BaseChartDirective) charts?: QueryList<BaseChartDirective>;

  /** KPI values */
  TotalInvested = 0;
  outstandingPrincipal = 0;
  MonthlyReturn = 0;          // 👈 Correct monthly return binding
  ActiveInvestors = 0;

  loading = false;
  error: string | null = null;

  constructor(private dashboardService: DashboardService) { }

  // UTIL FOR CSS VARIABLES
  private cssVar(key: string) {
    return getComputedStyle(document.documentElement).getPropertyValue(key).trim();
  }

  // ---------------------------------------
  // CHARTS — API WILL FILL
  // ---------------------------------------

  // LINE CHART
  monthlyInterestData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Interest Earned', fill: true, tension: 0.4 }
    ]
  };

  monthlyInterestOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { labels: { color: '' } } },
    scales: {
      x: { ticks: { color: '' }, grid: { color: '' } },
      y: { ticks: { color: '' }, grid: { color: '' } }
    }
  };

  // BAR CHART
  portfolioBarData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Principal' },
      { data: [], label: 'Interest' }
    ]
  };

  portfolioBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { labels: { color: '' } } },
    scales: {
      x: { ticks: { color: '' }, grid: { display: false } },
      y: { ticks: { color: '' }, grid: { color: '' } }
    }
  };

  // DOUGHNUT CHART
  frequencyData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{ data: [] }]
  };

  frequencyOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    layout: { padding: 10 },
    plugins: {
      legend: { position: 'bottom', labels: { color: '' } }
    }
  };

  private themeObserver!: MutationObserver;

  ngOnInit(): void {
    this.load();

    this.themeObserver = new MutationObserver(() =>
      setTimeout(() => this.applyChartColors(), 200)
    );

    this.themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  ngAfterViewInit(): void {
    window.addEventListener('theme-changed', () => this.applyChartColors());
  }

  ngOnDestroy(): void {
    this.themeObserver.disconnect();
  }

  // APPLY THEME COLORS
  private applyChartColors() {
    const primary = this.cssVar('--chart-primary');
    const secondary = this.cssVar('--chart-secondary');
    const accent = this.cssVar('--chart-accent');

    this.monthlyInterestData.datasets[0].borderColor = primary;
    this.monthlyInterestData.datasets[0].backgroundColor = primary + '33';

    this.portfolioBarData.datasets[0].backgroundColor = primary;
    this.portfolioBarData.datasets[1].backgroundColor = secondary;

    this.frequencyData.datasets[0].backgroundColor = [
      primary, secondary, accent
    ];

    this.charts?.forEach(c => c.update());
  }

  // ------------------------------------------
  // LOAD DATA FROM API
  // ------------------------------------------
  load(): void {
    this.loading = true;

    this.dashboardService.getSummary().subscribe({
      next: (s: any) => {

        // ----------------------- KPI VALUES
        this.TotalInvested = s.totalInvested;
        this.outstandingPrincipal = s.outstandingPrincipal;

        /** 
         * 👌 FINAL CORRECT MONTHLY RETURN (FROM EMI SCHEDULE)
         *      - Matches Reminder Page
         *      - Matches EMI Schedule Page
         */
        this.MonthlyReturn = s.monthlyReturn;

        this.ActiveInvestors = s.activeInvestors;

        // ----------------------- LINE CHART
        this.monthlyInterestData.labels = s.monthlyLabels;
        this.monthlyInterestData.datasets[0].data = s.monthlyInterestValues;

        // ----------------------- BAR CHART
        this.portfolioBarData.labels = s.investorNames;
        this.portfolioBarData.datasets[0].data = s.investorPrincipal;
        this.portfolioBarData.datasets[1].data = s.investorInterest;

        // ----------------------- DOUGHNUT CHART
        this.frequencyData.labels = s.frequencyLabels;
        this.frequencyData.datasets[0].data = s.frequencyCounts;

        setTimeout(() => this.charts?.forEach(c => c.update()), 200);

        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.error = "Failed to load dashboard";
        this.loading = false;
      }
    });
  }
}
