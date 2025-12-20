import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { environment } from "../../environment";

@Injectable({ providedIn: 'root' })
export class ReminderBellService {

    private baseUrl = `${environment.api}reminders`;

    private _count = signal(0);

    count = this._count.asReadonly();

    constructor(private http: HttpClient) {
    }
    getCount() {
        return this.http.get<{ count: number }>(`${this.baseUrl}/bell-count`);
    }

    refresh() {
        this.http.get<any>(`${this.baseUrl}/bell-count`)
            .subscribe(res => this._count.set(res.count));
    }
}
