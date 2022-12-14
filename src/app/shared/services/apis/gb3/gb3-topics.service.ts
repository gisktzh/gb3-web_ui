import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {TopicsFeatureInfoDetailData, TopicsLegendDetailData, TopicsListData} from '../../../models/gb3-api-generated.interfaces';
import {FeatureInfoResponse, LegendResponse} from '../../../models/gb3-api.interfaces';
import {LayerConfig} from '../../../../../assets/layers.config';

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

  public async loadFeatureInfo(x: number, y: number, topics: LayerConfig[]): Promise<FeatureInfoResponse[]> {
    const featureInfoRequests: Promise<TopicsFeatureInfoDetailData>[] = [];
    topics.forEach(({queryLayerName, queryLayers}) => {
      const requestUrl = this.createFeatureInfoUrl(queryLayerName, x, y, queryLayers);
      const request = this.get<TopicsFeatureInfoDetailData>(requestUrl);
      featureInfoRequests.push(request);
    });

    return Promise.all(featureInfoRequests);
  }

  private createLegendUrl(topicName: string): string {
    return `${this.getFullEndpointUrl()}/${topicName}/legend`;
  }

  private createTopicsUrl(): string {
    return `${this.getFullEndpointUrl()}`;
  }

  private createFeatureInfoUrl(topicName: string, x: number, y: number, queryLayers: string): string {
    return `${this.getFullEndpointUrl()}/${topicName}/feature_info?bbox=${x},${y},${x},${y}&queryLayers=${queryLayers}`;
  }

  private getFullEndpointUrl(): string {
    return `${this.apiBaseUrl}/${this.endpoint}`;
  }
}
