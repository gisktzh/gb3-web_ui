import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseApiService {
  protected abstract apiBaseUrl: string;

  constructor(private readonly http: HttpClient) {}

  protected get<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  protected post<T, R>(url: string, body?: T): Observable<R> {
    return this.http.post<R>(url, body);
  }
}
