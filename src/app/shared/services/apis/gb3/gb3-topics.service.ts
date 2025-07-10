import {Injectable, inject} from '@angular/core';
import {forkJoin, map, Observable} from 'rxjs';
import {DataCataloguePage} from '../../../enums/data-catalogue-page.enum';
import {MainPage} from '../../../enums/main-page.enum';
import {FeatureInfoResponse, FeatureInfoResultFeatureField} from '../../../interfaces/feature-info.interface';
import {Layer, LayerClass, LegendResponse} from '../../../interfaces/legend.interface';
import {
  FilterConfiguration,
  FilterValue,
  Map,
  MapLayer,
  TimeSliderConfiguration,
  TimeSliderLayer,
  TimeSliderLayerSource,
  TimeSliderParameterSource,
  TimeSliderSettings,
  TimeSliderSourceType,
  TopicsResponse,
  WmsFilterValue,
} from '../../../interfaces/topic.interface';
import {
  Geometry,
  InfoFeatureField,
  TopicsFeatureInfoDetailData,
  TopicsLegendDetailData,
  TopicsListData,
} from '../../../models/gb3-api-generated.interfaces';
import {Gb3ApiService} from './gb3-api.service';

import {InvalidTimeSliderConfiguration} from '../../../errors/map.errors';
import {QueryTopic} from '../../../interfaces/query-topic.interface';
import {ApiGeojsonGeometryToGb3ConverterUtils} from '../../../utils/api-geojson-geometry-to-gb3-converter.utils';
import {GeometryWithSrs} from '../../../interfaces/geojson-types-with-srs.interface';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '../../config.service';
import {TimeService} from '../../../interfaces/time-service.interface';
import {TimeSliderService} from '../../../../map/services/time-slider.service';
import {TIME_SERVICE} from '../../../../app.tokens';

const INACTIVE_STRING_FILTER_VALUE = '';
const INACTIVE_NUMBER_FILTER_VALUE = -1;

@Injectable({
  providedIn: 'root',
})
export class Gb3TopicsService extends Gb3ApiService {
  private readonly timeSliderService = inject(TimeSliderService);

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
    const legendRequests = queryTopics.map((queryTopic) =>
      this.get<TopicsLegendDetailData>(this.createLegendUrl(queryTopic)).pipe(
        map((data) => this.mapTopicsLegendDetailDataToLegendResponse(data, queryTopic.isSingleLayer)),
      ),
    );
    return forkJoin(legendRequests);
  }

  public loadFeatureInfos(x: number, y: number, queryTopics: QueryTopic[]): Observable<FeatureInfoResponse[]> {
    const featureInfoRequests = queryTopics.map((queryTopic) =>
      this.get<TopicsFeatureInfoDetailData>(this.createFeatureInfoUrl(queryTopic.topic, x, y, queryTopic.layersToQuery)).pipe(
        map((data) => this.mapTopicsFeatureInfoDetailDataToFeatureInfoResponse(data, queryTopic.isSingleLayer)),
      ),
    );
    return forkJoin(featureInfoRequests);
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
  private mapTopicsLegendDetailDataToLegendResponse(
    topicsLegendDetailData: TopicsLegendDetailData,
    isSingleLayer: boolean,
  ): LegendResponse {
    const {legend} = topicsLegendDetailData;

    return {
      legend: {
        topic: legend.topic,
        isSingleLayer: isSingleLayer,
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
          maps: [...category.topics]
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((topic) => {
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
                opacity: topic.opacity,
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
                      permissionMissing: layer.permission_missing,
                      visible: layer.initially_visible,
                      isHidden: false,
                    }),
                  )
                  .reverse(), // reverse the order of the layers because the order in the GB3 interfaces (Topic, ActiveMapItem) is inverted
                // to the order of the WMS specifications
                ...this.handleTimeSliderConfiguration(topic.timesliderConfiguration),
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

  private handleTimeSliderConfiguration(
    timesliderConfiguration: TopicsListData['categories'][0]['topics'][0]['timesliderConfiguration'] | undefined,
  ): TimeSliderSettings {
    if (!timesliderConfiguration) {
      return {
        timeSliderConfiguration: undefined,
        initialTimeSliderExtent: undefined,
      };
    }
    const config: TimeSliderConfiguration = {
      name: timesliderConfiguration.name,
      alwaysMaxRange: timesliderConfiguration.alwaysMaxRange,
      dateFormat: timesliderConfiguration.dateFormat,
      description: timesliderConfiguration.description,
      maximumDate: timesliderConfiguration.maximumDate,
      minimumDate: timesliderConfiguration.minimumDate,
      minimalRange: timesliderConfiguration.minimalRange,
      range: timesliderConfiguration.range,
      sourceType: timesliderConfiguration.sourceType as TimeSliderSourceType,
      source: this.transformTimeSliderConfigurationSource(timesliderConfiguration.source, timesliderConfiguration.sourceType),
    };
    return {
      timeSliderConfiguration: config,
      initialTimeSliderExtent: this.timeSliderService.createInitialTimeSliderExtent(config),
    };
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
    url.searchParams.append('x', x.toString());
    url.searchParams.append('y', y.toString());
    url.searchParams.append('queryLayers', queryLayers);
    return url.toString();
  }

  /**
   * Maps the generic TopicsFeatureInfoDetailData type from the API endpoint to the internal interface FeatureInfoResponse
   */
  private mapTopicsFeatureInfoDetailDataToFeatureInfoResponse(
    topicsFeatureInfoDetailData: TopicsFeatureInfoDetailData,
    isSingleLayer: boolean,
  ): FeatureInfoResponse {
    const {feature_info: featureInfo} = topicsFeatureInfoDetailData;

    return {
      featureInfo: {
        x: featureInfo.query_position.x,
        y: featureInfo.query_position.y,
        results: {
          isSingleLayer: isSingleLayer,
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
                  fields: feature.fields.map((field): FeatureInfoResultFeatureField => {
                    return this.createFeatureInfoField(field);
                  }),
                  geometry: feature.geometry ? this.convertGeometryToSupportedGeometry(feature.geometry) : undefined,
                };
              }),
            };
          }),
        },
      },
    };
  }

  private convertGeometryToSupportedGeometry(geometry: Geometry): GeometryWithSrs {
    return {
      ...ApiGeojsonGeometryToGb3ConverterUtils.castGeometryToSupportedGeometry(geometry),
      srs: this.configService.mapConfig.defaultMapConfig.srsId,
    };
  }

  private createFeatureInfoField(field: InfoFeatureField): FeatureInfoResultFeatureField {
    switch (field.type) {
      case 'image':
        return {type: field.type, value: field.value, label: field.label};
      case 'link':
        return {
          type: field.type,
          value: field.value
            ? {
                title: field.value.title,
                href: field.value.href,
              }
            : null,
          label: field.label,
        };
      case 'text':
        return {type: field.type, value: typeof field.value === 'number' ? field.value.toString() : field.value, label: field.label};
    }
  }
}
