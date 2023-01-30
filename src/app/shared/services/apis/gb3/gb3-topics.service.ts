import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {TopicsFeatureInfoDetailData, TopicsLegendDetailData, TopicsListData} from '../../../models/gb3-api-generated.interfaces';
import {Geometry} from 'geojson';
import {QueryLayer} from '../../../interfaces/query-layer.interface';
import {QueryLegend} from '../../../interfaces/query-legend.interface';
import {LegendResponse} from '../../../interfaces/legend.interface';
import {TopicsResponse} from '../../../interfaces/topic.interface';
import {FeatureInfoResponse} from '../../../interfaces/feature-info.interface';

@Injectable({
  providedIn: 'root'
})
export class Gb3TopicsService extends Gb3ApiService {
  private readonly endpoint = 'v3/topics';

  public async loadTopics(): Promise<TopicsResponse> {
    const requestUrl = this.createTopicsUrl();
    const topicsListData = await this.get<TopicsListData>(requestUrl);
    return this.transformTopicsListDataToTopicsResponse(topicsListData);
  }

  public async loadLegends(queryLegends: QueryLegend[]): Promise<LegendResponse[]> {
    const topicsLegendDetailDataRequests: Promise<TopicsLegendDetailData>[] = [];
    for (const queryLegend of queryLegends) {
      const requestUrl = this.createLegendUrl(queryLegend);
      const topicsLegendDetailData = this.get<TopicsLegendDetailData>(requestUrl);
      topicsLegendDetailDataRequests.push(topicsLegendDetailData);
    }

    const topicsLegendDetailDataCollection = await Promise.all(topicsLegendDetailDataRequests);
    return topicsLegendDetailDataCollection.map((topicsLegendDetailData) =>
      this.mapTopicsLegendDetailDataToLegendResponse(topicsLegendDetailData)
    );
  }

  public async loadFeatureInfos(x: number, y: number, queryLayers: QueryLayer[]): Promise<FeatureInfoResponse[]> {
    const topicsFeatureInfoDetailDataRequests: Promise<TopicsFeatureInfoDetailData>[] = [];
    queryLayers.forEach(({topic, layersToQuery}) => {
      const requestUrl = this.createFeatureInfoUrl(topic, x, y, layersToQuery);
      const topicsFeatureInfoDetailData = this.get<TopicsFeatureInfoDetailData>(requestUrl);
      topicsFeatureInfoDetailDataRequests.push(topicsFeatureInfoDetailData);
    });

    const topicsFeatureInfoDetailDataCollection = await Promise.all(topicsFeatureInfoDetailDataRequests);
    return topicsFeatureInfoDetailDataCollection.map((topicsFeatureInfoDetailData) =>
      this.mapTopicsFeatureInfoDetailDataToFeatureInfoResponse(topicsFeatureInfoDetailData)
    );
  }

  private createLegendUrl(queryLegend: QueryLegend): string {
    const url = new URL(`${this.getFullEndpointUrl()}/${queryLegend.topic}/legend`);

    if (queryLegend.layer) {
      url.searchParams.set('layer', queryLegend.layer);
    }

    return url.toString();
  }

  /**
   * Maps the generic TopicsLegendDetailData type from the API endpoint to the internal interface LegendResponse
   */
  private mapTopicsLegendDetailDataToLegendResponse(topicsLegendDetailData: TopicsLegendDetailData): LegendResponse {
    const {legend} = topicsLegendDetailData;
    return {
      legend: {
        ...legend,
        layers: legend.layers.map((layer) => {
          return {
            ...layer,
            layerClasses: layer.layer_classes?.map((layerClass) => {
              return {
                ...layerClass
              };
            })
          };
        })
      }
    };
  }

  private createTopicsUrl(): string {
    return `${this.getFullEndpointUrl()}`;
  }

  /**
   * Transforms the generic TopicsListData type from the API endpoint to the internal interface TopicsResponse
   */
  private transformTopicsListDataToTopicsResponse(topicsListData: TopicsListData): TopicsResponse {
    return {
      layerCatalogItems: topicsListData.categories.map((category) => {
        return {
          ...category,
          topics: category.topics.map((topic) => {
            return {
              ...topic,
              printTitle: topic.print_title,
              mainLevel: topic.main_level,
              backgroundLevel: topic.background_level,
              overlayLevel: topic.overlay_level,
              wmsUrl: topic.wms_url,
              minScale: topic.min_scale,
              backgroundTopic: topic.background_topic,
              overlayTopics: topic.overlay_topics,
              permissionMissing: topic.permission_missing,
              layers: topic.layers.map((layer) => {
                return {
                  ...layer,
                  groupTitle: layer.group_title,
                  minScale: layer.min_scale,
                  maxScale: layer.max_scale,
                  wmsSort: layer.wms_sort,
                  tocSort: layer.toc_sort,
                  initiallyVisible: layer.initially_visible,
                  visible: layer.initially_visible
                };
              })
            };
          })
        };
      })
    };
  }

  private createFeatureInfoUrl(topicName: string, x: number, y: number, queryLayers: string): string {
    return `${this.getFullEndpointUrl()}/${topicName}/feature_info?bbox=${x},${y},${x},${y}&queryLayers=${queryLayers}`;
  }

  /**
   * Maps the generic TopicsFeatureInfoDetailData type from the API endpoint to the internal interface FeatureInfoResponse
   */
  private mapTopicsFeatureInfoDetailDataToFeatureInfoResponse(
    topicsFeatureInfoDetailData: TopicsFeatureInfoDetailData
  ): FeatureInfoResponse {
    const {feature_info: featureInfo} = topicsFeatureInfoDetailData;

    return {
      featureInfo: {
        ...featureInfo,
        heightDtm: featureInfo.height_dtm,
        heightDom: featureInfo.height_dom,
        results: {
          topic: featureInfo.results.topic,
          layers: featureInfo.results.layers.map((layer) => {
            return {
              ...layer,
              features: layer.features.map((feature) => {
                return {
                  ...feature,
                  fields: feature.fields.map((field) => {
                    return {
                      ...field
                    };
                  }),
                  // The cast is required because the API typing delivers "type: string" which is not narrow enough
                  geometry: feature.geometry as Geometry
                };
              })
            };
          })
        }
      }
    };
  }

  private getFullEndpointUrl(): string {
    return `${this.apiBaseUrl}/${this.endpoint}`;
  }
}
