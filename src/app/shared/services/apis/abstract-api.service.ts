import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ConfigService} from '../config.service';
import {TIME_SERVICE} from '../../../app.tokens';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseApiService {
  protected abstract apiBaseUrl: string;
  protected readonly timeService = inject(TIME_SERVICE);
  protected readonly configService = inject(ConfigService);
  private readonly http = inject(HttpClient);

  protected get<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  protected post<T, R>(
    url: string,
    body?: T,
    headers?: {
      [header: string]: string | string[];
    },
    processAsBlob: boolean = false,
  ): Observable<R> {
    if (processAsBlob) {
      return this.http.post(url, body, {headers, responseType: 'blob'}) as Observable<R>;
    } else {
      return this.http.post<R>(url, body, {headers});
    }
  }

  protected delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }
}
