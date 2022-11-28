import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseApiService {
  protected abstract apiBaseUrl: string;

  protected constructor(private readonly http: HttpClient) {}

  protected async get<T>(url: string) {
    return this.http.get<T>(url);
  }
}
