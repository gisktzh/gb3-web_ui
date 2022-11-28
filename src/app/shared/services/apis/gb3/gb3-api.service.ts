import {BaseApiService} from '../abstract-api.service';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export abstract class Gb3ApiService extends BaseApiService {
  protected readonly apiBaseUrl = 'https://maps.zh.ch';
}
