import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {TopicsLegendDetailData, TopicsListData} from './gb3-generated-api';

@Injectable({
  providedIn: 'root'
})
export class Gb3TopicsService extends Gb3ApiService {
  private readonly endpoint = 'v3/topics';

  public async loadTopics(): Promise<TopicsListData> {
    const requestUrl = this.createTopicsUrl();
    return await this.get<TopicsListData>(requestUrl);
  }

  public async loadLegend(topicName: string): Promise<TopicsLegendDetailData> {
    const requestUrl = this.createLegendUrl(topicName);
    return await this.get<TopicsLegendDetailData>(requestUrl);
  }

  private createLegendUrl(topicName: string): string {
    return `${this.apiBaseUrl}/${this.endpoint}/${topicName}/legend`;
  }

  private createTopicsUrl(): string {
    return `${this.apiBaseUrl}/${this.endpoint}`;
  }
}
