import {BaseApiService} from '../abstract-api.service';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export abstract class Gb3ApiService extends BaseApiService {
  protected readonly apiBaseUrl = `${this.configService.apiConfig.gb2Api.baseUrl}/${this.configService.apiConfig.gb2Api.version}`;
  protected abstract endpoint: string;

  protected getFullEndpointUrl(): string {
    return `${this.apiBaseUrl}/${this.endpoint}`;
  }
}
