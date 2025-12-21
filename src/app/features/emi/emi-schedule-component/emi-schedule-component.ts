import { Component, inject, OnInit, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmiItem } from '../../../core/models/emi.model';
import { Investment } from '../../../core/models/investment.model';
import { Investor } from '../../../core/models/investor.model';
import { EmiService } from '../../../core/services/emi.service.ts';
import { InvestmentService } from '../../../core/services/investment.service.ts';
import { InvestorService } from '../../../core/services/investor.service.ts';
import { MaterialModule } from '../../../shared/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-emi-schedule-component',
  imports: [MaterialModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './emi-schedule-component.html',
  styleUrl: './emi-schedule-component.scss',
})

export class EmiScheduleComponent implements OnInit {


  private investorService = inject(InvestorService);
  private investmentService = inject(InvestmentService);
  private emiService = inject(EmiService);
  private exportService = inject(ExportService);
  private snack = inject(MatSnackBar);

  investors = signal<Investor[]>([]);
  investments = signal<Investment[]>([]);
  emiList = signal<EmiItem[]>([]);

  selectedInvestor = signal<number | null>(null);
  selectedInvestment = signal<number | null>(null);

  selectedInvestmentInterestType: any | null = null;
  selectedInvestmentPrincipal: number = 0;

  loadingInvestments = signal(false);
  loadingEmi = signal(false);


  today: Date = new Date();
  /** --------------------------
   * PAGING VARIABLES
   * -------------------------- */
  pageSize = 5;
  currentPage = 0;
  pagedEmiList: EmiItem[] = [];

  displayedColumns = [
    'paymentNumber',
    'paymentDate',
    'interestType',
    'investor',
    'financer',
    'brokername',
    'principalComponent',
    'interestRate',
    'interestComponent',
    'remainingPrincipal',
    'isPaid'
  ];

  ngOnInit(): void {
    this.loadInvestors();
  }

  loadInvestors() {
    this.investorService.getAll().subscribe({
      next: data => this.investors.set(data),
      error: () => this.snack.open('Failed to load investors', 'Close', { duration: 3000 }),
    });
  }

  onInvestorSelect(id: number) {
    this.selectedInvestor.set(id);
    this.selectedInvestment.set(null);
    this.emiList.set([]);

    this.loadingInvestments.set(true);
    this.investmentService.getByInvestor(id).subscribe({
      next: data => {
        this.investments.set(data);
        this.loadingInvestments.set(false);
      },
      error: () => {
        this.loadingInvestments.set(false);
        this.snack.open('Failed to load investments', 'Close', { duration: 3000 });
      }
    });
  }

  onInvestmentSelect(id: number) {
    this.selectedInvestment.set(id);

    const inv = this.investments().find(x => x.id === id);
    if (inv) {
      this.selectedInvestmentInterestType = inv.interestType;
      this.selectedInvestmentPrincipal = inv.principal;
    }

    this.loadEmiSchedule(id);
  }

  loadEmiSchedule(id: number) {
    this.loadingEmi.set(true);
    this.emiService.getSchedule(id).subscribe({
      next: data => {
        this.emiList.set(data);
        this.applyPaging();
        this.loadingEmi.set(false);
        console.log('EMI Schedule:', data);
      },
      error: () => {
        this.loadingEmi.set(false);
        this.snack.open('Failed to load EMI schedule', 'Close', { duration: 3000 });
      }
    });
  }

  /** --------------------------
   * PAGING FUNCTIONS
   * -------------------------- */
  applyPaging() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.pagedEmiList = this.emiList().slice(start, end);
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyPaging();
  }

  // Sum of all EMI interests
  totalInterest(): number {
    return this.emiList().reduce((sum, e) => sum + e.interestComponent, 0);
  }

  // Principal + Total Interest
  grandTotal(): number {
    return this.selectedInvestmentPrincipal + this.totalInterest();
  }  

  // --------------------------
  // STATUS HELPERS
  // --------------------------

  // isOverdue(e: EmiItem): boolean {
  //   if (e.isPaid) return false;
  //   const today = new Date();
  //   const due = new Date(e.paymentDate);
  //   today.setHours(0, 0, 0, 0);
  //   due.setHours(0, 0, 0, 0);
  //   return due < today;
  // }

  // getStatusText(e: EmiItem): string {
  //   if (e.isPaid) return 'Completed';
  //   if (this.isOverdue(e)) return 'Overdue';
  //   return 'Pending';
  // }
}


