// src/app/core/services/micro-financer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MicroFinancer } from '../models/micro-financer.model';
import { environment } from '../../environment';

@Injectable({ providedIn: 'root' })
export class MicroFinancerService {

  private baseUrl = `${environment.api}microfinancers`;

  constructor(private http: HttpClient) { }

  // getAll(): Observable<MicroFinancer[]> {
  //   return this.http.get<MicroFinancer[]>(this.baseUrl);
  // }

  getById(id: number): Observable<MicroFinancer> {
    return this.http.get<MicroFinancer>(`${this.baseUrl}/${id}`);
  }

  getAll(): Observable<MicroFinancer[]> {
    return this.http.get<MicroFinancer[]>(`${this.baseUrl}/getall`);
  }

  create(payload: Partial<MicroFinancer>) {
    return this.http.post(`${this.baseUrl}/create`, payload);
  }

  update(id: number, payload: Partial<MicroFinancer>) {
    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
