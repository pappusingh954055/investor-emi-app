import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { environment } from "../../environment";
import { Subject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ReminderBellService {

    private baseUrl = `${environment.api}reminders`;

    public counter = signal(0);

    pending = signal(0);
    overdue = signal(0);
    total = signal(0);

      // 🔄 global refresh trigger
  private refresh$ = new Subject<void>();

  refreshTriggered$ = this.refresh$.asObservable();

    count = this.counter.asReadonly();

    constructor(private http: HttpClient) {
    }
    getCount() {
        return this.http.get<{ count: number }>(`${this.baseUrl}/bell-count`);
    }


    refresh1() {
        this.http.get<any>(`${this.baseUrl}/bell-summary`)
            .subscribe(res => {
                this.pending.set(res.pending);
                this.overdue.set(res.overdue);
                this.total.set(res.total);
            });
    }

    refresh(){
        this.refresh$.next();
    }
}
