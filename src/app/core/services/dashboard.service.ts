import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';
import { Dashboard } from '../../features/dashboard/dashboard/dashboard';


export interface DashboardSummary {
  totalInvested: number;
  outstandingPrincipal: number;
  monthlyReturn: number;
  activeInvestors: number;

  monthlyLabels: string[];
  monthlyInterestValues: number[];

  investorNames: string[];
  investorPrincipal: number[];
  investorInterest: number[];

  frequencyLabels: string[];
  frequencyCounts: number[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private baseUrl = `${environment.api}dashboard`;

  constructor(private http: HttpClient) { }

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/summary`);
  }
}
