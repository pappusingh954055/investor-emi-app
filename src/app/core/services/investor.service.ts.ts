import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environment';
import { Investor } from '../models/investor.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InvestorService {
  private http = inject(HttpClient);
  private base = `${environment.api}investors`;

  getAll(): Observable<Investor[]> {
    return this.http.get<Investor[]>(this.base);
  }

  getById(id: number): Observable<Investor> {
    return this.http.get<Investor>(`${this.base}/${id}`);
  }

  create(data: Omit<Investor, 'id'>): Observable<Investor> {
    return this.http.post<Investor>(this.base, data);
  }

  update(id: number, data: Omit<Investor, 'id'>): Observable<void> {
    const body = { id, ...data }; // API expects Id in body
    return this.http.put<void>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
