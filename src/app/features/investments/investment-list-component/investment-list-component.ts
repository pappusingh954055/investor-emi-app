import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../shared/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Investor } from '../../../core/models/investor.model';
import { InvestmentService } from '../../../core/services/investment.service.ts';
import { InvestorService } from '../../../core/services/investor.service.ts';
import { MicroFinancer } from '../../../core/models/micro-financer.model';
import { MicroFinancerService } from '../../../core/services/micro-financer.service';
import { PageEvent } from '@angular/material/paginator';
import { Investment } from '../../../core/models/investment.model';

@Component({
  selector: 'app-investment-list-component',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './investment-list-component.html',
  styleUrl: './investment-list-component.scss',
})

export class InvestmentListComponent implements OnInit {

  /* =======================
     DEPENDENCY INJECTION
     ======================= */
  private fb = inject(FormBuilder);
  private investmentService = inject(InvestmentService);
  private investorService = inject(InvestorService);
  private microFinancerService = inject(MicroFinancerService);
  private snack = inject(MatSnackBar);

  /* =======================
     SIGNAL STATE
     ======================= */
  investors = signal<Investor[]>([]);
  investments = signal<any[]>([]);
  microFinancers = signal<MicroFinancer[]>([]);

  investmentsData:Investment[] = [];  

  loading = signal(false);
  saving = signal(false);

  selectedInvestor = signal<number | null>(1);

  intrestTerms: string = '';

  /* =======================
     EDIT MODE
     ======================= */
  editingInvestmentId: number | null = null;
  isEditMode = false;

  editId: number | null = null;

  /* =======================
     PAGINATION
     ======================= */
  pageSize = 5;
  currentPage = 0;
  totalRecords = 0;
  pagedInvestments: any[] = [];

  /* =======================
     DROPDOWNS
     ======================= */
  frequencies = [
    { text: 'Monthly', value: 1 },
    { text: 'Yearly', value: 2 },
    { text: 'Short', value: 3 }
  ];

  interestTypes = [
    { label: 'Monthly %', value: 1 },
    { label: 'Yearly %', value: 2 },
    { label: 'Short %', value: 3 },
  ];
  minDate = new Date();   // Today’s date
  dateFilter = (d: Date | null): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!d) return false;

    const date = new Date(d);
    date.setHours(0, 0, 0, 0);

    return date >= today;  // ⛔ Disable all past dates
  };


  /* =======================
     FORM
     ======================= */
  form: FormGroup = this.fb.group({
    principal: [null, [Validators.required, Validators.min(1)]],
    interestRate: [null, [Validators.required, Validators.min(0.1)]],
    interestType: [null, Validators.required],
    termInMonths: [null, [Validators.required, Validators.min(1)]],
    startDate: [null, Validators.required],
    frequency: [null, Validators.required],
    microFinancerId: [null, Validators.required],
    investorId: [null, Validators.required]
  });

  displayedColumns = [
    'principal',
    'interestRate',
    'interestType',
    'investorName',
    'microFinancerName',
    'brokerName',
    'termInMonths',
    'startDate',
    'frequency',
    'actions'
  ];

  /* =======================
     INIT
     ======================= */
  ngOnInit(): void {
    this.loadInvestors();
    this.loadMicroFinancers();
    this.loadAllInvestments();
  }

  /* =======================
     LOAD MASTER DATA
     ======================= */
  loadInvestors() {
    this.investorService.getAll().subscribe({
      next: data => this.investors.set(data),
      error: () => this.snack.open('Failed to load investors', 'Close', { duration: 3000 })
    });
  }

  loadMicroFinancers() {
    this.microFinancerService.getAll().subscribe({
      next: data => this.microFinancers.set(data),
      error: () => this.snack.open('Failed to load micro-financers', 'Close', { duration: 3000 })
    });
  }

  /* =======================
     INVESTOR CHANGE
     ======================= */
  onInvestorSelect(id: number) {
    this.selectedInvestor.set(id);
    this.currentPage = 0;
    this.loadInvestments();
  }

  /* =======================
     LOAD INVESTMENTS
     ======================= */

  loadAllInvestments() {
    this.loading.set(true);

    this.investmentService.getAll().subscribe({
      next: data => {
        this.investmentsData = data;
        this.investments.set(data);
        this.loading.set(false);

        console.log('All Investments:', data);
      },
      error: err => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  loadInvestments() {
    if (!this.selectedInvestor()) return;

    this.loading.set(true);

    this.investmentService.getByInvestor(this.selectedInvestor()!).subscribe({
      next: data => {
        const enriched = data.map(inv => {
          const broker =
            inv.brokerName?.trim() ||
            inv.microFinancerBrokerName?.trim() ||
            '—';

          return {
            ...inv,
            microFinancerName: inv.microFinancerName ?? '—',
            brokerName: broker
          };
        });

        this.investments.set(enriched);
        this.totalRecords = enriched.length;

        this.applyPaging();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Failed to load investments', 'Close', { duration: 3000 });
      }
    });
  }

  /* =======================
     PAGINATION
     ======================= */
  applyPaging() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.pagedInvestments = this.investments().slice(start, end);
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyPaging();
  }

  /* =======================
     EDIT
     ======================= */
  private mapInterestTypeToForm(value: number | string): string {
    if (value === 1 || value === 'Monthly') return 'Monthly';
    if (value === 2 || value === 'Yearly') return 'Yearly';
    if (value === 3 || value === 'Short') return 'Short';
    return 'Monthly'; // default
  }
  private mapInterestTypeToApi(value: string): number {
    switch (value) {
      case 'Monthly': return 1;
      case 'Yearly': return 2;
      case 'Short': return 3;
      default: return 1;
    }
  }
  private toDateOnly(date: Date | string): string {
    const d = (date instanceof Date) ? date : new Date(date);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;
  }
  editInvestment(row: any) {

    this.isEditMode = true;
    this.editingInvestmentId = row.id;
    this.form.patchValue({
      principal: row.principal,
      interestRate: row.interestRate,
      interestType: this.mapInterestTypeToForm(row.interestType),
      termInMonths: row.termInMonths,
      startDate: new Date(this.toDateOnly(row.startDate)),
      frequency: row.frequency,
      microFinancerId: row.microFinancerId,
      investorId: row.investorId
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* =======================
     ADD / UPDATE
     ======================= */

  addInvestment() {
    if (this.form.invalid || !this.selectedInvestor()) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    const payload = {
      investmentId: this.editingInvestmentId!,   // 🔥 REQUIRED
      //investorId: this.selectedInvestor()!,      // 🔥 REQUIRED
      principal: v.principal,
      interestRate: v.interestRate,
      interestType: this.mapInterestTypeToApi(v.interestType),
      termInMonths: v.termInMonths,
      startDate: new Date(this.toDateOnly(v.startDate)),
      frequency: v.frequency,
      microFinancerId: v.microFinancerId,
      investorId: v.investorId
    };

    console.log('Payload:', payload);
    this.saving.set(true);

    const request$ = this.isEditMode
      ? this.investmentService.put(
       // investorId
        this.editingInvestmentId!,       // investmentId
        payload
      )
      : this.investmentService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.resetForm();
        this.loadAllInvestments();
        this.snack.open(
          this.isEditMode ? 'Investment updated' : 'Investment added','Close',
          { duration: 3000 }
        );
      },
      error: () => {
        this.saving.set(false);
        this.snack.open('Operation failed', 'Close', { duration: 3000 });
      }
    });
  }

  /* =======================
     RESET
     ======================= */
  resetForm() {
    this.form.reset({
      interestType: 'Monthly',
      frequency: 1,
      microFinancerId: null
    });

    this.isEditMode = false;
    this.editingInvestmentId = null;
  }

  getTerm(event: any) {
    const interestType = event;
    if (interestType === 'Monthly') {
      this.intrestTerms = interestType;
    } else if (interestType === 'Yearly') {
      this.intrestTerms = interestType;
    } else if (interestType === 'Short') {
      this.intrestTerms = interestType;
    } else {
      this.intrestTerms = '';
    }
  }

   /** 🔹 Interest Type Label */
  interestTypeLabel(type: number): string {
    return type === 1
      ? 'Monthly'
      : type === 2
      ? 'Yearly'
      : 'Short';
  }
}
