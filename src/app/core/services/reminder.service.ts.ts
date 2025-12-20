import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environment";
import { Reminder } from "../models/reminder.model";

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api}reminders`;

  getUpcoming(from: string, to: string) {
    return this.http.get<Reminder[]>(`${this.baseUrl}/upcoming?from=${from}&to=${to}`);
  }

  payEmi(payload: { emiScheduleItemId: number; paymentDate: string; amount?: number }) {
    return this.http.post(`${environment.api}emi/pay`, payload);
  }
  getReminderBellCount() {
    return this.http.get<{ pendingCount: number }>(`${this.baseUrl}/bell`);
  }

  /* =====================================================
       🔔 GET OVERDUE / UPCOMING REMINDERS (Bell → Page)
       Logic:
       - Status = Pending
       - ReminderDate <= today
    ===================================================== */
  getOverdue(todayIso: string): Observable<Reminder[]> {
    const params = new HttpParams()
      .set('to', todayIso);

    return this.http.get<Reminder[]>(
      `${this.baseUrl}/upcoming`,
      { params }
    );
  }
  /* =====================================================
      💳 PAY NOW → MARK REMINDER AS PAID
   ===================================================== */
  // markAsPaid(reminderId: number): Observable<void> {
  //   return this.http.post<void>(
  //     `${this.baseUrl}/${reminderId}/pay`,
  //     {}
  //   );
  // }

  getOverdueAndUpcoming() {
    return this.http.get<Reminder[]>(`${this.baseUrl}/overdue-upcoming`);
  }

  markAsPaid(reminderId: number) {
    return this.http.post(`${this.baseUrl}/pay/${reminderId}`, {});
  }
}
