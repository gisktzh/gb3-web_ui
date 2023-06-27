import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ConfigService} from '../config.service';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseApiService {
  protected abstract apiBaseUrl: string;

  constructor(private readonly http: HttpClient, protected readonly configService: ConfigService) {}

  protected get<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  protected post<T, R>(url: string, body?: T, headers?: {[header: string]: string | string[]}): Observable<R> {
    return this.http.post<R>(url, body, {headers});
  }

  protected delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }
}
