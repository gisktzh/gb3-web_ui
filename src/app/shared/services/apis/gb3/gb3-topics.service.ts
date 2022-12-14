import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {TopicsFeatureInfoDetailData, TopicsLegendDetailData, TopicsListData} from '../../../models/gb3-api-generated.interfaces';
import {FeatureInfoResponse, LegendResponse, TopicsResponse} from '../../../models/gb3-api.interfaces';
import {LayerConfig} from '../../../../../assets/layers.config';

@Injectable({
  providedIn: 'root'
})
export class Gb3TopicsService extends Gb3ApiService {
  private readonly endpoint = 'v3/topics';

  public async loadTopics(): Promise<TopicsResponse> {
    const requestUrl = this.createTopicsUrl();
    const topicsListData = await this.get<TopicsListData>(requestUrl);
    return this.mapGenericToApiInterface(topicsListData);
  }

  public async loadLegend(topicName: string): Promise<LegendResponse> {
    const requestUrl = this.createLegendUrl(topicName);
    return await this.get<TopicsLegendDetailData>(requestUrl);
  }

  private mapGenericToApiInterface(topicsListData: TopicsListData): TopicsResponse {
    return {
      layerCatalogItems: topicsListData.categories.map((category) => {
        return {
          title: category.title,
          topics: category.topics.map((topic) => {
            return {
              topic: topic.topic,
              title: topic.title,
              printTitle: topic.print_title,
              icon: topic.icon,
              organisation: topic.organisation,
              geolion: topic.geolion,
              keywords: topic.keywords,
              mainLevel: topic.main_level,
              backgroundLevel: topic.background_level,
              overlayLevel: topic.overlay_level,
              wmsUrl: topic.wms_url,
              minScale: topic.min_scale,
              backgroundTopic: topic.background_topic,
              overlayTopics: topic.overlay_topics,
              tools: topic.tools,
              permissionMissing: topic.permission_missing,
              layers: topic.layers.map((layer) => {
                return {
                  id: layer.id,
                  layer: layer.layer,
                  groupTitle: layer.group_title,
                  title: layer.title,
                  minScale: layer.min_scale,
                  maxScale: layer.max_scale,
                  wmsSort: layer.wms_sort,
                  tocSort: layer.toc_sort,
                  initiallyVisible: layer.initially_visible,
                  editable: layer.editable
                };
              })
            };
          })
        };
      })
    };
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
