import {Injectable} from '@angular/core';
import {Geometry} from 'geojson';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {DataCataloguePage} from '../../../enums/data-catalogue-page.enum';
import {MainPage} from '../../../enums/main-page.enum';
import {FeatureInfoResponse, FeatureInfoResultFeatureField} from '../../../interfaces/feature-info.interface';
import {Layer, LayerClass, LegendResponse} from '../../../interfaces/legend.interface';
import {
  FilterConfiguration,
  FilterValue,
  Map,
  MapLayer,
  TimeSliderLayer,
  TimeSliderLayerSource,
  TimeSliderParameterSource,
  TimeSliderSourceType,
  TopicsResponse,
  WmsFilterValue,
} from '../../../interfaces/topic.interface';
import {TopicsFeatureInfoDetailData, TopicsLegendDetailData, TopicsListData} from '../../../models/gb3-api-generated.interfaces';
import {SupportedSrs} from '../../../types/supported-srs.type';
import {Gb3ApiService} from './gb3-api.service';

import {InvalidTimeSliderConfiguration} from '../../../errors/map.errors';
import {QueryTopic} from '../../../interfaces/query-topic.interface';

const FEATURE_INFO_SRS: SupportedSrs = 2056;
const INACTIVE_STRING_FILTER_VALUE = '';
const INACTIVE_NUMBER_FILTER_VALUE = -1;

@Injectable({
  providedIn: 'root',
})
export class Gb3TopicsService extends Gb3ApiService {
  protected readonly endpoint = 'topics';
  private readonly staticFilesUrl = this.configService.apiConfig.gb2StaticFiles.baseUrl;
  private readonly dataDatasetTabUrl = `/${MainPage.Data}/${DataCataloguePage.Datasets}`;
  private readonly dataMapTabUrl = `/${MainPage.Data}/${DataCataloguePage.Maps}`;

  public loadTopics(): Observable<TopicsResponse> {
    const requestUrl = this.createTopicsUrl();
    const topicsListData = this.get<TopicsListData>(requestUrl);
    return topicsListData.pipe(map((data) => this.transformTopicsListDataToTopicsResponse(data)));
  }

  public loadLegends(queryTopics: QueryTopic[]): Observable<LegendResponse[]> {
    const requestUrls = queryTopics.map((queryLegend) => this.createLegendUrl(queryLegend));
    return forkJoin(requestUrls.map((requestUrl) => this.get<TopicsLegendDetailData>(requestUrl))).pipe(
      map((data) => this.mapTopicsLegendDetailDataToLegendResponse(data)),
    );
  }

  public loadFeatureInfos(x: number, y: number, queryTopics: QueryTopic[]): Observable<FeatureInfoResponse[]> {
    const requestUrls = queryTopics.map(({topic, layersToQuery}) => this.createFeatureInfoUrl(topic, x, y, layersToQuery));
    return forkJoin(requestUrls.map((requestUrl) => this.get<TopicsFeatureInfoDetailData>(requestUrl))).pipe(
      map((data) => this.mapTopicsFeatureInfoDetailDataToFeatureInfoResponse(data)),
    );
  }

  /**
   * Transforms the given filter configurations to URL parameters (name, value)
   */
  public transformFilterConfigurationToParameters(filterConfigurations: FilterConfiguration[]): WmsFilterValue[] {
    const attributeFilterParameters: {name: string; value: string}[] = [];
    filterConfigurations.forEach((filterConfiguration) => {
      const parameterValue = filterConfiguration.filterValues
        .map((filterValue) => {
          // all filter values must be sent in the correct order; the active filtered ones as an empty string / or -1
          const filterValueValues: (string | number)[] = filterValue.isActive
            ? filterValue.values.map((filterValueValue) =>
                typeof filterValueValue === 'string' ? INACTIVE_STRING_FILTER_VALUE : INACTIVE_NUMBER_FILTER_VALUE,
              )
            : filterValue.values;
          // all filter values of type string (empty or not) must be enclosed by single quotation marks and separated by commas
          return filterValueValues.map((fvValue) => (typeof fvValue === 'string' ? `'${fvValue}'` : fvValue)).join(',');
        })
        .join(',');
      attributeFilterParameters.push({name: filterConfiguration.parameter, value: parameterValue});
    });
    return attributeFilterParameters;
  }

  private createLegendUrl(queryTopic: QueryTopic): string {
    const url = new URL(`${this.getFullEndpointUrl()}/${queryTopic.topic}/legend`);
    url.searchParams.set('layer', queryTopic.layersToQuery);
    return url.toString();
  }

  /**
   * Maps the generic TopicsLegendDetailData type from the API endpoint to the internal interface LegendResponse
   */
  private mapTopicsLegendDetailDataToLegendResponse(topicsLegendDetailData: TopicsLegendDetailData[]): LegendResponse[] {
    return topicsLegendDetailData.map((data): LegendResponse => {
      const {legend} = data;
      return {
        legend: {
          topic: legend.topic,
          metaDataLink: legend.geolion_karten_uuid ? this.createMapTabLink(legend.geolion_karten_uuid) : undefined,
          layers: legend.layers.map((layer): Layer => {
            return {
              layer: layer.layer,
              title: layer.title,
              geolion: layer.geolion_gds ?? undefined,
              attribution: layer.attribution,
              metaDataLink: layer.geolion_geodatensatz_uuid ? this.createDatasetTabLink(layer.geolion_geodatensatz_uuid) : undefined,
              layerClasses: layer.layer_classes?.map((layerClass): LayerClass => {
                return {
                  label: layerClass.label,
                  image: layerClass.image,
                };
              }),
            };
          }),
        },
      };
    });
  }

  private createMapTabLink(uuid: string): string {
    return `${this.dataMapTabUrl}/${uuid}`;
  }

  private createDatasetTabLink(uuid: string): string {
    return `${this.dataDatasetTabUrl}/${uuid}`;
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
          title: category.title,
          maps: category.topics.map((topic) => {
            return {
              id: topic.topic,
              uuid: topic.geolion_karten_uuid,
              printTitle: topic.print_title,
              gb2Url: topic.gb2_url,
              icon: this.createAbsoluteIconUrl(topic.icon),
              wmsUrl: topic.wms_url,
              minScale: topic.min_scale,
              organisation: topic.organisation,
              notice: topic.notice,
              title: topic.title,
              keywords: topic.keywords,
              permissionMissing: topic.permission_missing,
              layers: topic.layers
                .map(
                  (layer): MapLayer => ({
                    id: layer.id,
                    layer: layer.layer,
                    title: layer.title,
                    queryable: layer.queryable,
                    uuid: layer.geolion_geodatensatz_uuid,
                    groupTitle: layer.group_title,
                    minScale: layer.min_scale,
                    maxScale: layer.max_scale,
                    wmsSort: layer.wms_sort,
                    tocSort: layer.toc_sort,
                    initiallyVisible: layer.initially_visible,
                    permissionMissing: layer.permission_missing,
                    visible: layer.initially_visible,
                    isHidden: false,
                  }),
                )
                .reverse(), // reverse the order of the layers because the order in the GB3 interfaces (Topic, ActiveMapItem) is inverted to the order of the WMS specifications
              timeSliderConfiguration: topic.timesliderConfiguration
                ? {
                    name: topic.timesliderConfiguration.name,
                    alwaysMaxRange: topic.timesliderConfiguration.alwaysMaxRange,
                    dateFormat: topic.timesliderConfiguration.dateFormat,
                    description: topic.timesliderConfiguration.description,
                    maximumDate: topic.timesliderConfiguration.maximumDate,
                    minimumDate: topic.timesliderConfiguration.minimumDate,
                    minimalRange: topic.timesliderConfiguration.minimalRange,
                    range: topic.timesliderConfiguration.range,
                    sourceType: topic.timesliderConfiguration.sourceType as TimeSliderSourceType,
                    source: this.transformTimeSliderConfigurationSource(
                      topic.timesliderConfiguration.source,
                      topic.timesliderConfiguration.sourceType,
                    ),
                  }
                : undefined,
              filterConfigurations: topic.filterConfigurations?.map((filterConfiguration): FilterConfiguration => {
                return {
                  name: filterConfiguration.name,
                  description: filterConfiguration.description,
                  parameter: filterConfiguration.parameter,
                  filterValues: filterConfiguration.filterValues.map(
                    (filterValue): FilterValue => ({
                      isActive: false,
                      values: filterValue.values,
                      name: filterValue.name,
                    }),
                  ),
                };
              }),
              searchConfigurations: topic.searchConfigurations ?? undefined,
            };
          }),
        };
      }),
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
    // the following typing for `source` is used to extract a subtype of the generated interface `TopicsListData`
    source: TopicsListData['categories'][0]['topics'][0]['timesliderConfiguration']['source'],
    sourceType: string,
  ): TimeSliderParameterSource | TimeSliderLayerSource {
    const timeSliderSourceType: TimeSliderSourceType = sourceType as TimeSliderSourceType;
    switch (timeSliderSourceType) {
      case 'parameter':
        if (!source.startRangeParameter || !source.endRangeParameter || !source.layerIdentifiers) {
          throw new InvalidTimeSliderConfiguration('Missing attributes inside the parameter configuration.');
          // handling
        }
        return {
          startRangeParameter: source.startRangeParameter,
          endRangeParameter: source.endRangeParameter,
          layerIdentifiers: source.layerIdentifiers,
        } as TimeSliderParameterSource;
      case 'layer':
        if (!source.layers) {
          throw new InvalidTimeSliderConfiguration('Missing attributes inside the layer configuration.');
        }
        return {
          layers: source.layers.map((layer): TimeSliderLayer => {
            return {
              layerName: layer.layerName,
              date: layer.date,
            };
          }),
        } as TimeSliderLayerSource;
    }
  }

  /**
   * Returns whether the given layer should be hidden from all visible layer lists.
   * For example if the layer is part of a time slider it should not be visible in any kind of layer list except the internal time slider
   * control.
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
    const url = new URL(`${this.staticFilesUrl}${relativeIconUrl}`);
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
    topicsFeatureInfoDetailData: TopicsFeatureInfoDetailData[],
  ): FeatureInfoResponse[] {
    return topicsFeatureInfoDetailData.map((data): FeatureInfoResponse => {
      const {feature_info: featureInfo} = data;

      return {
        featureInfo: {
          x: featureInfo.query_position.x,
          y: featureInfo.query_position.y,
          results: {
            topic: featureInfo.results.topic,
            metaDataLink: featureInfo.results.geolion_karten_uuid
              ? this.createMapTabLink(featureInfo.results.geolion_karten_uuid)
              : undefined,
            layers: featureInfo.results.layers.map((layer) => {
              return {
                title: layer.title,
                layer: layer.layer,
                metaDataLink: layer.geolion_geodatensatz_uuid ? this.createDatasetTabLink(layer.geolion_geodatensatz_uuid) : undefined,
                features: layer.features.map((feature) => {
                  return {
                    fid: feature.fid,
                    bbox: feature.bbox,
                    fields: feature.fields.map((field) => {
                      return {
                        label: field.label,
                        value: field.value,
                      } as FeatureInfoResultFeatureField;
                    }),
                    // The cast is required because the API typing delivers "type: string" which is not narrow enough
                    geometry: {...(feature.geometry as Geometry), srs: FEATURE_INFO_SRS},
                  };
                }),
              };
            }),
          },
        },
      };
    });
  }
}
