import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environment";
import { EmiItem } from "../models/emi.model";

@Injectable({ providedIn: 'root' })
export class EmiService {
  private http = inject(HttpClient);
  private base = `${environment.api}emi`;

  getSchedule(investmentId: number): Observable<EmiItem[]> {
    return this.http.get<EmiItem[]>(`${this.base}/investment/${investmentId}/schedule`);
  }
}
