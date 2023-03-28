import {BaseApiService} from '../abstract-api.service';
import {Injectable} from '@angular/core';
import {environment} from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export abstract class Gb3ApiService extends BaseApiService {
  protected readonly apiBaseUrl = environment.baseUrls.gb2Api;
  protected abstract endpoint: string;

  protected getFullEndpointUrl(): string {
    return `${this.apiBaseUrl}/${this.endpoint}`;
  }
}
