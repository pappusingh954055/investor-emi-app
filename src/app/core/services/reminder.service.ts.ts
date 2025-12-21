import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { environment } from "../../environment";
import { Reminder } from "../models/reminder.model";
import { ReceiptDto } from "../models/receipt.model";

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api}reminders`;

  /** 🔥 GLOBAL REFRESH EVENT */
  private refresh$ = new Subject<void>();

  /** 🔔 Notify all components */
  notifyRefresh() {
    this.refresh$.next();
  }
  onRefresh() {
    return this.refresh$.asObservable();
  }
  //APIS
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

  getOverdueAndUpcoming() {
    return this.http.get<Reminder[]>(`${this.baseUrl}/overdue-upcoming`);
  }

  // markAsPaid(id: number) {
  //   return this.http.post(`${this.baseUrl}/pay/${id}`, {});
  // }

  payReminder(reminderId: number): Observable<ReceiptDto> {
    return this.http.post<ReceiptDto>(
      `${this.baseUrl}/${reminderId}/pay`,
      {} // no body required
    );
  }

  // 📜 All reminders (history page)
  getAllReminders() {
    return this.http.get<Reminder[]>(`${this.baseUrl}/all`);
  }

  getDashboardCounts() {
    return this.http.get<any>(`${this.baseUrl}/dashboard-counts`);
  }

  snooze(id: number, days: number) {
    return this.http.post<void>(`${this.baseUrl}/${id}/snooze/${days}`, {});
  }
}
