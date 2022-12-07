import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {TopicsFeatureInfoDetailData, TopicsLegendDetailData, TopicsListData} from '../../../models/gb3-api-generated.interfaces';
import {LegendResponse} from '../../../models/gb3-api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class Gb3TopicsService extends Gb3ApiService {
  private readonly endpoint = 'v3/topics';

  public async loadTopics(): Promise<TopicsListData> {
    const requestUrl = this.createTopicsUrl();
    return await this.get<TopicsListData>(requestUrl);
  }

  public async loadLegend(topicName: string): Promise<LegendResponse> {
    const requestUrl = this.createLegendUrl(topicName);
    return await this.get<TopicsLegendDetailData>(requestUrl);
  }

  public async loadFeatureInfo(topicName: string): Promise<TopicsFeatureInfoDetailData> {
    const requestUrl = this.createFeatureInfoUrl(topicName);
    return await this.get<TopicsFeatureInfoDetailData>(requestUrl);
  }

  private createLegendUrl(topicName: string): string {
    return `${this.getFullEndpointUrl()}/${topicName}/legend`;
  }

  private createTopicsUrl(): string {
    return `${this.getFullEndpointUrl()}`;
  }

  private createFeatureInfoUrl(topicName: string): string {
    return `${this.getFullEndpointUrl()}/${topicName}/feature_info`;
  }

  private getFullEndpointUrl(): string {
    return `${this.apiBaseUrl}/${this.endpoint}`;
  }
}
