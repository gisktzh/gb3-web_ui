import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {LegendResponse} from './gb3-api.interfaces';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Gb3TopicsService extends Gb3ApiService {
  private readonly endpoint = 'v3/topics';

  public async getLegend(topicName: string): Promise<Observable<LegendResponse>> {
    const requestUrl = this.getLegendUrl(topicName);
    return await this.get<LegendResponse>(requestUrl);
  }

  private getLegendUrl(topicName: string) {
    return `${this.apiBaseUrl}/${this.endpoint}/${topicName}/legend`;
  }
}
