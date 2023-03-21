import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {TopicsFeatureInfoDetailData, TopicsLegendDetailData, TopicsListData} from '../../../models/gb3-api-generated.interfaces';
import {Geometry} from 'geojson';
import {QueryLayer} from '../../../interfaces/query-layer.interface';
import {QueryLegend} from '../../../interfaces/query-legend.interface';
import {LegendResponse} from '../../../interfaces/legend.interface';
import {
  Map,
  TimeSliderLayerSource,
  TimeSliderParameterSource,
  TimeSliderSourceType,
  TopicsResponse
} from '../../../interfaces/topic.interface';
import {FeatureInfoResponse} from '../../../interfaces/feature-info.interface';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class Gb3TopicsService extends Gb3ApiService {
  private readonly endpoint = 'v3/topics';

  public loadTopics(): Observable<TopicsResponse> {
    const requestUrl = this.createTopicsUrl();
    const topicsListData = this.get<TopicsListData>(requestUrl);
    return topicsListData.pipe(map((data) => this.transformTopicsListDataToTopicsResponse(data)));
  }

  public loadLegends(queryLegends: QueryLegend[]): Observable<LegendResponse[]> {
    const requestUrls = queryLegends.map((queryLegend) => this.createLegendUrl(queryLegend));
    return forkJoin(requestUrls.map((requestUrl) => this.get<TopicsLegendDetailData>(requestUrl))).pipe(
      map((data) => this.mapTopicsLegendDetailDataToLegendResponse(data))
    );
  }

  public loadFeatureInfos(x: number, y: number, queryLayers: QueryLayer[]): Observable<FeatureInfoResponse[]> {
    const requestUrls = queryLayers.map(({topic, layersToQuery}) => this.createFeatureInfoUrl(topic, x, y, layersToQuery));
    return forkJoin(requestUrls.map((requestUrl) => this.get<TopicsFeatureInfoDetailData>(requestUrl))).pipe(
      map((data) => this.mapTopicsFeatureInfoDetailDataToFeatureInfoResponse(data))
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
  private mapTopicsLegendDetailDataToLegendResponse(topicsLegendDetailData: TopicsLegendDetailData[]): LegendResponse[] {
    return topicsLegendDetailData.map((data) => {
      const {legend} = data;
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
    });
  }

  private createTopicsUrl(): string {
    return `${this.getFullEndpointUrl()}`;
  }

  /**
   * Transforms the generic TopicsListData type from the API endpoint to the internal interface TopicsResponse
   */
  private transformTopicsListDataToTopicsResponse(topicsListData: TopicsListData): TopicsResponse {
    const topicsResponse: TopicsResponse = {
      topics: topicsListData.categories.map((category) => {
        return {
          ...category,
          maps: category.topics.map((topic) => {
            return {
              ...topic,
              id: topic.topic,
              printTitle: topic.print_title,
              icon: this.createAbsoluteIconUrl(topic.icon),
              wmsUrl: topic.wms_url,
              minScale: topic.min_scale,
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
                  permissionMissing: layer.permission_missing,
                  visible: layer.initially_visible,
                  isHidden: false
                };
              }),
              timeSliderConfiguration: topic.timesliderConfiguration
                ? {
                    ...topic.timesliderConfiguration,
                    sourceType: topic.timesliderConfiguration.sourceType as TimeSliderSourceType,
                    source: this.transformTimeSliderConfigurationSource(
                      topic.timesliderConfiguration.source,
                      topic.timesliderConfiguration.sourceType
                    )
                  }
                : undefined,
              filterConfigurations: topic.filterConfigurations?.map((filterConfiguration) => {
                return {
                  ...filterConfiguration,
                  filterValues: filterConfiguration.filterValues.map((filterValue) => {
                    return {
                      ...filterValue,
                      isActive: false
                    };
                  })
                };
              })
            };
          })
        };
      })
    };
    topicsResponse.topics.forEach((topic) => {
      topic.maps.forEach((topicMap) => {
        topicMap.layers.forEach((layer) => {
          layer.isHidden = this.isHiddenLayer(layer.layer, topicMap);
        });
      });
    });
    return topicsResponse;
  }

  private transformTimeSliderConfigurationSource(
    source: TopicsListData['categories'][0]['topics'][0]['timesliderConfiguration']['source'],
    sourceType: string
  ): TimeSliderParameterSource | TimeSliderLayerSource {
    const timeSliderSourceType: TimeSliderSourceType = sourceType as TimeSliderSourceType;
    switch (timeSliderSourceType) {
      case 'parameter':
        if (!source.startRangeParameter || !source.endRangeParameter || !source.layerIdentifiers) {
          throw new Error(`Invalid time slider configuration! Missing attributes inside the parameter configuration.`); // todo error handling
        }
        return {
          startRangeParameter: source.startRangeParameter,
          endRangeParameter: source.endRangeParameter,
          layerIdentifiers: source.layerIdentifiers
        } as TimeSliderParameterSource;
      case 'layer':
        if (!source.layers) {
          throw new Error(`Invalid time slider configuration! Missing attributes inside the layer configuration.`); // todo error handling
        }
        return {
          layers: source.layers.map((layer) => {
            return {
              layerName: layer.layerName,
              date: layer.date
            };
          })
        } as TimeSliderLayerSource;
    }
  }

  /**
   * Returns whether the given layer should be hidden from all visible layer lists.
   * For example if the layer is part of a time slider it should not be visible in any kind of layer list except the internal time slider control.
   */
  private isHiddenLayer(layer: string, topicMap: Map): boolean {
    let isHidden = false;
    if (topicMap.timeSliderConfiguration && topicMap.timeSliderConfiguration.sourceType === 'layer') {
      const timeSliderLayerSource = topicMap.timeSliderConfiguration.source as TimeSliderLayerSource;
      isHidden = timeSliderLayerSource.layers.some((l) => l.layerName === layer);
    }
    return isHidden;
  }

  private createAbsoluteIconUrl(relativeIconUrl: string): string {
    const url = new URL(`${this.apiBaseUrl}${relativeIconUrl}`);
    return url.toString();
  }

  private createFeatureInfoUrl(topicName: string, x: number, y: number, queryLayers: string): string {
    const url = new URL(`${this.getFullEndpointUrl()}/${topicName}/feature_info`);
    url.searchParams.append('bbox', `${x},${y},${x},${y}`);
    url.searchParams.append('queryLayers', queryLayers);
    return url.toString();
  }

  /**
   * Maps the generic TopicsFeatureInfoDetailData type from the API endpoint to the internal interface FeatureInfoResponse
   */
  private mapTopicsFeatureInfoDetailDataToFeatureInfoResponse(
    topicsFeatureInfoDetailData: TopicsFeatureInfoDetailData[]
  ): FeatureInfoResponse[] {
    return topicsFeatureInfoDetailData.map((data) => {
      const {feature_info: featureInfo} = data;

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
    });
  }

  private getFullEndpointUrl(): string {
    return `${this.apiBaseUrl}/${this.endpoint}`;
  }
}
