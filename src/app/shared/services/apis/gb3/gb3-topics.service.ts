import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {TopicsFeatureInfoDetailData, TopicsLegendDetailData, TopicsListData} from '../../../models/gb3-api-generated.interfaces';
import {FeatureInfoResponse, LegendResponse, TopicsResponse} from '../../../models/gb3-api.interfaces';
import {Geometry} from 'geojson';
import {QueryLayer} from '../../../interfaces/query-layer.interface';

@Injectable({
  providedIn: 'root'
})
export class Gb3TopicsService extends Gb3ApiService {
  private readonly endpoint = 'v3/topics';

  public async loadTopics(): Promise<TopicsResponse> {
    const requestUrl = this.createTopicsUrl();
    const topicsListData = await this.get<TopicsListData>(requestUrl);
    return this.mapTopicsListDataToTopicsResponse(topicsListData);
  }

  public async loadLegends(topics: string[]): Promise<LegendResponse[]> {
    const topicsLegendDetailDataRequests: Promise<TopicsLegendDetailData>[] = [];
    for (const topic of topics) {
      const requestUrl = this.createLegendUrl(topic);
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

  private createLegendUrl(topicName: string): string {
    return `${this.getFullEndpointUrl()}/${topicName}/legend`;
  }

  /**
   * Maps the generic TopicsLegendDetailData type from the API endpoint to the internal interface LegendResponse
   */
  private mapTopicsLegendDetailDataToLegendResponse(topicsLegendDetailData: TopicsLegendDetailData): LegendResponse {
    return {
      legend: {
        topic: topicsLegendDetailData.legend.topic,
        layers: topicsLegendDetailData.legend.layers.map((layer) => {
          return {
            title: layer.title,
            layer: layer.layer,
            attribution: layer.attribution,
            geolion: layer.geolion,
            layerClasses: layer.layer_classes?.map((layerClass) => {
              return {
                label: layerClass.label,
                image: layerClass.image
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
   * Maps the generic TopicsListData type from the API endpoint to the internal interface TopicsResponse
   */
  private mapTopicsListDataToTopicsResponse(topicsListData: TopicsListData): TopicsResponse {
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
                  editable: layer.editable,
                  queryable: layer.queryable
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
    return {
      featureInfo: {
        x: topicsFeatureInfoDetailData.feature_info.x,
        y: topicsFeatureInfoDetailData.feature_info.y,
        heightDtm: topicsFeatureInfoDetailData.feature_info.height_dtm,
        heightDom: topicsFeatureInfoDetailData.feature_info.height_dom,
        results: {
          topic: topicsFeatureInfoDetailData.feature_info.results.topic,
          layers: topicsFeatureInfoDetailData.feature_info.results.layers.map((layer) => {
            return {
              layer: layer.layer,
              title: layer.title,
              features: layer.features.map((feature) => {
                return {
                  fid: feature.fid,
                  bbox: feature.bbox,
                  fields: feature.fields.map((field) => {
                    return {
                      label: field.label,
                      value: field.value
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
