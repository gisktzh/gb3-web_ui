import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {lastValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseApiService {
  protected abstract apiBaseUrl: string;

  protected constructor(private readonly http: HttpClient) {}

  protected async get<T>(url: string): Promise<T> {
    return lastValueFrom(this.http.get<T>(url));
  }
}
