import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environment";
import { Investment } from "../models/investment.model";

@Injectable({ providedIn: 'root' })
export class InvestmentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api}investments`;

  getByInvestor(id: number): Observable<Investment[]> {
    debugger;
    return this.http.get<Investment[]>(`${this.baseUrl}/${id}`);
  }


  /** 🔹 GET ALL INVESTMENTS (GRID) */
  getAll(): Observable<Investment[]> {
    return this.http.get<Investment[]>(`${this.baseUrl}/all`);
  }


  create(investment: Investment): Observable<Investment> {
    return this.http.post<Investment>(`${this.baseUrl}/${investment.investorId}`, investment);
  }

  update(investorId: number, investmentId: number, payload: any) {
    return this.http.put(
      `${this.baseUrl}/${investorId}/${investmentId}`,
      payload
    );
  }

   put(investmentId: number, payload: any) {
    return this.http.put(
      `${this.baseUrl}/${investmentId}`,
      payload
    );
  }
}
