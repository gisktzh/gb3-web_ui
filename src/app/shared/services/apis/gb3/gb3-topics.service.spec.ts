/* eslint-disable @typescript-eslint/naming-convention */
import {HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {TopicsFeatureInfoDetailData, TopicsLegendDetailData, TopicsListData} from '../../../models/gb3-api-generated.interfaces';
import {ConfigService} from '../../config.service';
import {Gb3TopicsService} from './gb3-topics.service';
import {FilterConfiguration, TopicsResponse, WmsFilterValue} from '../../../interfaces/topic.interface';
import {LegendResponse} from '../../../interfaces/legend.interface';
import {QueryTopic} from '../../../interfaces/query-topic.interface';
import {FeatureInfoResponse} from '../../../interfaces/feature-info.interface';
import {provideMockStore} from '@ngrx/store/testing';

describe('Gb3TopicsService', () => {
  let service: Gb3TopicsService;
  let configService: ConfigService;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideMockStore(), provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    });
    service = TestBed.inject(Gb3TopicsService);
    configService = TestBed.inject(ConfigService);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadTopics', () => {
    it('should receive the data and transform it correctly', (done: DoneFn) => {
      const data: TopicsListData = {
        categories: [
          {
            title: 'Raumplanung, Zonenpläne',
            topics: [
              {
                topic: 'StatGebAlterZH',
                title: 'Gebäudealter',
                print_title: 'Gebäudealter',
                icon: '/images/custom/themekl-statgebalterzh.gif',
                organisation: 'Statistisches Amt',
                geolion_karten_uuid: '246fe226-ead7-4f91-b735-d294994913e0',
                geolion_gdd: null,
                keywords: ['Gebäudealter', 'stat', 'obs', 'fap', 'denkk', 'fsla'],
                notice: null,
                opacity: 0.1337,
                timesliderConfiguration: {
                  name: 'Aktueller Gebäudebestand nach Baujahr',
                  source: {
                    layerIdentifiers: ['geb-alter_wohnen', 'geb-alter_grau', 'geb-alter_2'],
                    endRangeParameter: 'FILTER_BIS',
                    startRangeParameter: 'FILTER_VON',
                  },
                  dateFormat: 'YYYY',
                  sourceType: 'parameter',
                  description: 'Gebäude bis 2020',
                  maximumDate: '2020',
                  minimumDate: '1850',
                  minimalRange: 'P1Y',
                  alwaysMaxRange: false,
                },
                filterConfigurations: [
                  {
                    name: 'Anzeigeoptionen nach Hauptnutzung',
                    parameter: 'FILTER_GEBART',
                    filterValues: [
                      {
                        name: 'Wohnen',
                        values: ['Gebäude Wohnen'],
                      },
                      {
                        name: 'Gewerbe und Verwaltung',
                        values: ['Gebäude Landwirtschaft', 'Gebäude Industrie', 'Gebäude Verwaltung'],
                      },
                      {
                        name: 'Andere',
                        values: ['Nebengebäude', 'Gebäude Handel', 'Gebäude Gastgewerbe', 'Gebäude Verkehrswesen', 'unbekannt'],
                      },
                    ],
                  },
                ],
                searchConfigurations: null,
                wms_url: 'https://maps.zh.ch/wms/StatGebAlterZH',
                gb2_url: 'https://maps.zh.ch/?topic=StatGebAlterZH',
                layers: [
                  {
                    id: 132494,
                    geolion_gds: null,
                    geolion_geodatensatz_uuid: null,
                    layer: 'geb-alter_wohnen',
                    group_title: 'Gebäudealter - Polygone',
                    title: 'Baujahr',
                    min_scale: 1,
                    max_scale: 100000,
                    wms_sort: 9,
                    toc_sort: 900,
                    initially_visible: true,
                    queryable: true,
                  },
                  {
                    id: 132495,
                    geolion_geodatensatz_uuid: null,
                    geolion_gds: null,
                    layer: 'geb-alter_grau',
                    group_title: 'Gebäudealter - Polygone',
                    title: 'Baujahr',
                    min_scale: 1,
                    max_scale: 100000,
                    wms_sort: 10,
                    toc_sort: 1000,
                    initially_visible: false,
                    queryable: false,
                  },
                  {
                    id: 132496,
                    geolion_geodatensatz_uuid: null,
                    geolion_gds: null,
                    layer: 'geb-alter_2',
                    group_title: 'Gebäudealter',
                    title: 'Gebäude mit Baujahr x und älter',
                    min_scale: 100001,
                    max_scale: 15000001,
                    wms_sort: 11,
                    toc_sort: 1100,
                    initially_visible: true,
                    queryable: false,
                  },
                ],
                min_scale: null,
              },
            ],
          },
        ],
      };
      const httpGetSpy = spyOn(httpClient, 'get').and.returnValue(of(data));

      const expectedUrl = `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/topics`;
      const expected: TopicsResponse = {
        topics: [
          {
            title: 'Raumplanung, Zonenpläne',
            maps: [
              {
                id: 'StatGebAlterZH',
                title: 'Gebäudealter',
                printTitle: 'Gebäudealter',
                icon: `${configService.apiConfig.gb2StaticFiles.baseUrl}/images/custom/themekl-statgebalterzh.gif`,
                organisation: 'Statistisches Amt',
                uuid: '246fe226-ead7-4f91-b735-d294994913e0',
                keywords: ['Gebäudealter', 'stat', 'obs', 'fap', 'denkk', 'fsla'],
                notice: null,
                opacity: 0.1337,
                timeSliderConfiguration: {
                  name: 'Aktueller Gebäudebestand nach Baujahr',
                  source: {
                    layerIdentifiers: ['geb-alter_wohnen', 'geb-alter_grau', 'geb-alter_2'],
                    endRangeParameter: 'FILTER_BIS',
                    startRangeParameter: 'FILTER_VON',
                  },
                  dateFormat: 'YYYY',
                  sourceType: 'parameter',
                  description: 'Gebäude bis 2020',
                  maximumDate: '2020',
                  minimumDate: '1850',
                  minimalRange: 'P1Y',
                  alwaysMaxRange: false,
                  range: undefined,
                },
                initialTimeSliderExtent: {
                  start: new Date('1850'),
                  end: new Date('2020'),
                },
                filterConfigurations: [
                  {
                    name: 'Anzeigeoptionen nach Hauptnutzung',
                    parameter: 'FILTER_GEBART',
                    filterValues: [
                      {
                        name: 'Wohnen',
                        values: ['Gebäude Wohnen'],
                        isActive: false,
                      },
                      {
                        name: 'Gewerbe und Verwaltung',
                        values: ['Gebäude Landwirtschaft', 'Gebäude Industrie', 'Gebäude Verwaltung'],
                        isActive: false,
                      },
                      {
                        name: 'Andere',
                        values: ['Nebengebäude', 'Gebäude Handel', 'Gebäude Gastgewerbe', 'Gebäude Verkehrswesen', 'unbekannt'],
                        isActive: false,
                      },
                    ],
                    description: undefined,
                  },
                ],
                searchConfigurations: undefined,
                wmsUrl: 'https://maps.zh.ch/wms/StatGebAlterZH',
                gb2Url: 'https://maps.zh.ch/?topic=StatGebAlterZH',
                layers: [
                  {
                    id: 132496,
                    uuid: null,
                    layer: 'geb-alter_2',
                    groupTitle: 'Gebäudealter',
                    title: 'Gebäude mit Baujahr x und älter',
                    minScale: 100001,
                    maxScale: 15000001,
                    wmsSort: 11,
                    tocSort: 1100,
                    visible: true,
                    queryable: false,
                    isHidden: false,
                    permissionMissing: undefined,
                  },
                  {
                    id: 132495,
                    uuid: null,
                    layer: 'geb-alter_grau',
                    groupTitle: 'Gebäudealter - Polygone',
                    title: 'Baujahr',
                    minScale: 1,
                    maxScale: 100000,
                    wmsSort: 10,
                    tocSort: 1000,
                    visible: false,
                    queryable: false,
                    isHidden: false,
                    permissionMissing: undefined,
                  },
                  {
                    id: 132494,
                    uuid: null,
                    layer: 'geb-alter_wohnen',
                    groupTitle: 'Gebäudealter - Polygone',
                    title: 'Baujahr',
                    minScale: 1,
                    maxScale: 100000,
                    wmsSort: 9,
                    tocSort: 900,
                    queryable: true,
                    visible: true,
                    isHidden: false,
                    permissionMissing: undefined,
                  },
                ],
                minScale: null,
                permissionMissing: undefined,
              },
            ],
          },
        ],
      };

      service.loadTopics().subscribe((actual) => {
        expect(httpGetSpy).toHaveBeenCalledOnceWith(expectedUrl);
        expect(actual).toEqual(expected);
        done();
      });
    });

    it('should sort topics alphabetically ascending by title', (done: DoneFn) => {
      const randomOrder = ['B-2', 'B-3', 'A-1', 'AA 2', 'AA 1', '-1'];
      const data: TopicsListData = {
        categories: [
          {
            title: 'Raumplanung, Zonenpläne',
            topics: [
              ...randomOrder.map((title) => ({
                title,
                topic: 'StatGebAlterZH',
                print_title: 'Gebäudealter',
                icon: '/images/custom/themekl-statgebalterzh.gif',
                organisation: 'Statistisches Amt',
                geolion_karten_uuid: '246fe226-ead7-4f91-b735-d294994913e0',
                geolion_gdd: null,
                keywords: [],
                notice: null,
                opacity: 0.1337,
                timesliderConfiguration: {
                  name: 'Aktueller Gebäudebestand nach Baujahr',
                  source: {
                    layerIdentifiers: ['geb-alter_wohnen', 'geb-alter_grau', 'geb-alter_2'],
                    endRangeParameter: 'FILTER_BIS',
                    startRangeParameter: 'FILTER_VON',
                  },
                  dateFormat: 'YYYY',
                  sourceType: 'parameter',
                  description: 'Gebäude bis 2020',
                  maximumDate: '2020',
                  minimumDate: '1850',
                  minimalRange: 'P1Y',
                  alwaysMaxRange: false,
                },
                filterConfigurations: [],
                searchConfigurations: null,
                wms_url: 'https://maps.zh.ch/wms/StatGebAlterZH',
                gb2_url: 'https://maps.zh.ch/?topic=StatGebAlterZH',
                layers: [],
                min_scale: null,
              })),
            ],
          },
        ],
      };

      spyOn(httpClient, 'get').and.returnValue(of(data));

      const expectedOrder = ['-1', 'A-1', 'AA 1', 'AA 2', 'B-2', 'B-3'];
      service.loadTopics().subscribe((actual) => {
        const actualTitles = actual.topics.map((topic) => topic.maps.map((map) => map.title)).flat();
        expect(actualTitles).toEqual(expectedOrder);
        done();
      });
    });
  });

  describe('loadLegends', () => {
    it('should receive the data and transform it correctly', (done: DoneFn) => {
      const data: TopicsLegendDetailData = {
        legend: {
          topic: 'Lageklassen2003ZH',
          geolion_gdd: null,
          geolion_karten_uuid: 'aaaa-bbbb-cccc-dddd',
          layers: [
            {
              layer: 'haltestellen',
              title: 'Haltestellen',
              geolion_gds: 140,
              geolion_geodatensatz_uuid: null,
            },
            {
              layer: 'lageklassen-2003-einzelobjekte',
              title: 'Lageklassen 2003 (Einzelobjekte)',
              geolion_gds: 147,
              geolion_geodatensatz_uuid: '96d404bb-7b29-e291-42f5-1e42086ffa43',
              layer_classes: [
                {
                  label: 'Lageklasse 1',
                  image: '/images/custom/lageklassen2003zh/lageklassen-2003-einzelobjekte0.png',
                },
                {
                  label: 'Lageklasse 2',
                  image: '/images/custom/lageklassen2003zh/lageklassen-2003-einzelobjekte1.png',
                },
                {
                  label: 'Lageklasse 3',
                  image: '/images/custom/lageklassen2003zh/lageklassen-2003-einzelobjekte2.png',
                },
                {
                  label: 'Lageklasse 4',
                  image: '/images/custom/lageklassen2003zh/lageklassen-2003-einzelobjekte3.png',
                },
                {
                  label: 'Lageklasse 5',
                  image: '/images/custom/lageklassen2003zh/lageklassen-2003-einzelobjekte4.png',
                },
                {
                  label: 'Lageklasse 6',
                  image: '/images/custom/lageklassen2003zh/lageklassen-2003-einzelobjekte5.png',
                },
                {
                  label: 'Lageklasse 7',
                  image: '/images/custom/lageklassen2003zh/lageklassen-2003-einzelobjekte6.png',
                },
              ],
            },
            {
              layer: 'lageklassen-2003-flaechen',
              title: 'Lageklassen 2003 (Flächen)',
              geolion_gds: 147,
              geolion_geodatensatz_uuid: '96d404bb-7b29-e291-42f5-1e42086ffa43',
              layer_classes: [
                {
                  label: 'Lageklasse 1',
                  image: '/images/custom/lageklassen2003zh/lageklassen-2003-flaechen0.png',
                },
                {
                  label: 'Lageklasse 2',
                  image: '/images/custom/lageklassen2003zh/lageklassen-2003-flaechen1.png',
                },
                {
                  label: 'Lageklasse 3',
                  image: '/images/custom/lageklassen2003zh/lageklassen-2003-flaechen2.png',
                },
                {
                  label: 'Lageklasse 4',
                  image: '/images/custom/lageklassen2003zh/lageklassen-2003-flaechen3.png',
                },
                {
                  label: 'Lageklasse 5',
                  image: '/images/custom/lageklassen2003zh/lageklassen-2003-flaechen4.png',
                },
                {
                  label: 'Lageklasse 6',
                  image: '/images/custom/lageklassen2003zh/lageklassen-2003-flaechen5.png',
                },
                {
                  label: 'Lageklasse 7',
                  image: '/images/custom/lageklassen2003zh/lageklassen-2003-flaechen6.png',
                },
              ],
            },
          ],
        },
      };
      const httpGetSpy = spyOn(httpClient, 'get').and.returnValue(of(data));
      const queryTopics: QueryTopic[] = [
        {
          topic: 'Lageklassen2003ZH',
          isSingleLayer: false,
          layersToQuery: 'haltestellen,lageklassen-2003-einzelobjekte,lageklassen-2003-flaechen',
        },
      ];

      const expectedUrl =
        `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/` +
        `topics/Lageklassen2003ZH/legend?layer=haltestellen%2Clageklassen-2003-einzelobjekte%2Clageklassen-2003-flaechen`;
      const expected: LegendResponse[] = [
        {
          legend: {
            topic: 'Lageklassen2003ZH',
            isSingleLayer: false,
            metaDataLink: '/data/maps/aaaa-bbbb-cccc-dddd',
            layers: [
              {
                layer: 'haltestellen',
                title: 'Haltestellen',
                geolion: 140,
                metaDataLink: undefined,
                layerClasses: undefined,
                attribution: undefined,
              },
              {
                layer: 'lageklassen-2003-einzelobjekte',
                title: 'Lageklassen 2003 (Einzelobjekte)',
                geolion: 147,
                metaDataLink: '/data/datasets/96d404bb-7b29-e291-42f5-1e42086ffa43',
                layerClasses: [
                  {
                    label: 'Lageklasse 1',
                    image: '/images/custom/lageklassen2003zh/lageklassen-2003-einzelobjekte0.png',
                  },
                  {
                    label: 'Lageklasse 2',
                    image: '/images/custom/lageklassen2003zh/lageklassen-2003-einzelobjekte1.png',
                  },
                  {
                    label: 'Lageklasse 3',
                    image: '/images/custom/lageklassen2003zh/lageklassen-2003-einzelobjekte2.png',
                  },
                  {
                    label: 'Lageklasse 4',
                    image: '/images/custom/lageklassen2003zh/lageklassen-2003-einzelobjekte3.png',
                  },
                  {
                    label: 'Lageklasse 5',
                    image: '/images/custom/lageklassen2003zh/lageklassen-2003-einzelobjekte4.png',
                  },
                  {
                    label: 'Lageklasse 6',
                    image: '/images/custom/lageklassen2003zh/lageklassen-2003-einzelobjekte5.png',
                  },
                  {
                    label: 'Lageklasse 7',
                    image: '/images/custom/lageklassen2003zh/lageklassen-2003-einzelobjekte6.png',
                  },
                ],
                attribution: undefined,
              },
              {
                layer: 'lageklassen-2003-flaechen',
                title: 'Lageklassen 2003 (Flächen)',
                geolion: 147,
                metaDataLink: '/data/datasets/96d404bb-7b29-e291-42f5-1e42086ffa43',
                layerClasses: [
                  {
                    label: 'Lageklasse 1',
                    image: '/images/custom/lageklassen2003zh/lageklassen-2003-flaechen0.png',
                  },
                  {
                    label: 'Lageklasse 2',
                    image: '/images/custom/lageklassen2003zh/lageklassen-2003-flaechen1.png',
                  },
                  {
                    label: 'Lageklasse 3',
                    image: '/images/custom/lageklassen2003zh/lageklassen-2003-flaechen2.png',
                  },
                  {
                    label: 'Lageklasse 4',
                    image: '/images/custom/lageklassen2003zh/lageklassen-2003-flaechen3.png',
                  },
                  {
                    label: 'Lageklasse 5',
                    image: '/images/custom/lageklassen2003zh/lageklassen-2003-flaechen4.png',
                  },
                  {
                    label: 'Lageklasse 6',
                    image: '/images/custom/lageklassen2003zh/lageklassen-2003-flaechen5.png',
                  },
                  {
                    label: 'Lageklasse 7',
                    image: '/images/custom/lageklassen2003zh/lageklassen-2003-flaechen6.png',
                  },
                ],
                attribution: undefined,
              },
            ],
          },
        },
      ];

      service.loadLegends(queryTopics).subscribe((actual) => {
        expect(httpGetSpy).toHaveBeenCalledOnceWith(expectedUrl);
        expect(actual).toEqual(expected);
        done();
      });
    });
  });

  describe('loadFeatureInfos', () => {
    it('should receive the data and transform it correctly', (done: DoneFn) => {
      const data: TopicsFeatureInfoDetailData = {
        feature_info: {
          query_position: {
            x: 2682707.901193953,
            y: 1247901.6586536092,
            srid: 2056,
          },
          results: {
            topic: 'AVfarbigZH',
            geolion_gdd: 263,
            geolion_karten_uuid: '26d7c027-38f2-42cb-a17a-99f17a2e383e',
            report: {
              url: null,
              description: null,
            },
            layers: [
              {
                layer: 'RESF-1',
                title: 'Liegenschaften',
                geolion_gds: 447,
                geolion_geodatensatz_uuid: 'f1cb4419-8bab-ed44-ab87-d65b73da882c',
                features: [
                  {
                    fid: 179992462,
                    fields: [
                      {
                        label: 'BFSNr',
                        value: 261,
                        type: 'text',
                      },
                      {
                        label: 'Nummer',
                        value: {url: {href: 'https://www.example.com'}, src: {href: 'https://www.example.com'}, alt: 'Text'},
                        type: 'image',
                      },
                      {
                        label: 'This image is actually null :)',
                        value: null,
                        type: 'image',
                      },
                      {
                        label: 'EGRIS_EGRID',
                        value: 'CH327810999162',
                        type: 'text',
                      },
                      {
                        label: 'Vollständigkeit',
                        value: 'Vollstaendig',
                        type: 'text',
                      },
                      {
                        label: 'Fläche [m\u0026sup2;]',
                        value: 2874,
                        type: 'text',
                      },
                      {
                        label: 'Value might be null',
                        value: null,
                        type: 'text',
                      },
                      {
                        label: 'A LinkObject',
                        value: {
                          title: 'Amon Amarth',
                          href: 'not just a LOTR location',
                          hreflang: 'test',
                        },
                        type: 'link',
                      },
                    ],
                    geometry: {
                      type: 'MultiPolygon',
                      crs: {
                        type: 'name',
                        properties: {
                          name: 'EPSG:2056',
                        },
                      },
                      coordinates: [
                        [
                          [
                            [2682753.58, 1247894.45],
                            [2682745.34, 1247885.4],
                            [2682743.1, 1247887.41],
                            [2682753.58, 1247894.45],
                          ],
                        ],
                      ],
                    },
                  },
                ],
              },
              {
                layer: 'LCSFC-1',
                title: 'Bodenbedeckung farbig',
                geolion_gds: 443,
                geolion_geodatensatz_uuid: 'fb89c857-84d3-73a4-abbc-39415b21f8c9',
                features: [
                  {
                    fid: 422973978,
                    fields: [
                      {
                        label: 'BFSNr',
                        value: 261,
                        type: 'text',
                      },
                      {
                        label: 'Qualität',
                        value: 'AV93',
                        type: 'text',
                      },
                      {
                        label: 'Art',
                        value: 'Gebäude Verwaltung',
                        type: 'text',
                      },
                      {
                        label: 'GWR_EGID',
                        value: 302019364,
                        type: 'text',
                      },
                      {
                        label: 'GVZ Nr.',
                        value: 'AU04950',
                        type: 'text',
                      },
                      {
                        label: 'Geometrie [m\u0026sup2;]',
                        value: 2159.843540479304,
                        type: 'text',
                      },
                    ],
                    geometry: {
                      type: 'MultiPolygon',
                      crs: {
                        type: 'name',
                        properties: {
                          name: 'EPSG:2056',
                        },
                      },
                      coordinates: [
                        [
                          [
                            [2682714.88, 1247921.79],
                            [2682715.89, 1247922.88],
                            [2682725.14, 1247914.48],
                            [2682714.88, 1247921.79],
                          ],
                        ],
                      ],
                    },
                  },
                ],
              },
              {
                layer: 'MBSF-1',
                title: 'Gemeindegrenzen',
                geolion_gds: 0,
                geolion_geodatensatz_uuid: null,
                features: [
                  {
                    fid: 76900,
                    fields: [
                      {
                        label: 'BFSNr',
                        value: 261,
                        type: 'text',
                      },
                      {
                        label: 'Name',
                        value: 'Zürich',
                        type: 'text',
                      },
                      {
                        label: 'Stand AV',
                        value: '11.12.2023',
                        type: 'text',
                      },
                    ],
                    geometry: undefined,
                  },
                ],
              },
            ],
          },
        },
      };
      const httpGetSpy = spyOn(httpClient, 'get').and.returnValue(of(data));
      const x = 1337;
      const y = 42.666;
      const scale = 1408;
      const queryTopics: QueryTopic[] = [
        {
          topic: 'AVfarbigZH',
          isSingleLayer: false,
          layersToQuery: 'TBLI-1,MBSF-1,RESF-1,SOSFC-1,LCSFC-1',
        },
      ];

      const expectedUrl =
        `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/` +
        `topics/AVfarbigZH/feature_info?x=${x}&y=${y}&scale=${scale}&queryLayers=TBLI-1%2CMBSF-1%2CRESF-1%2CSOSFC-1%2CLCSFC-1`;
      const expected: FeatureInfoResponse[] = [
        {
          featureInfo: {
            x: 2682707.901193953,
            y: 1247901.6586536092,
            results: {
              isSingleLayer: false,
              topic: 'AVfarbigZH',
              metaDataLink: '/data/maps/26d7c027-38f2-42cb-a17a-99f17a2e383e',
              report: {
                url: null,
                description: null,
              },
              layers: [
                {
                  layer: 'RESF-1',
                  title: 'Liegenschaften',
                  metaDataLink: '/data/datasets/f1cb4419-8bab-ed44-ab87-d65b73da882c',
                  features: [
                    {
                      fid: 179992462,
                      fields: [
                        {
                          label: 'BFSNr',
                          value: '261',
                          type: 'text',
                        },
                        {
                          label: 'Nummer',
                          value: {url: {href: 'https://www.example.com'}, src: {href: 'https://www.example.com'}, alt: 'Text'},
                          type: 'image',
                        },

                        {
                          label: 'This image is actually null :)',
                          value: null,
                          type: 'image',
                        },
                        {
                          label: 'EGRIS_EGRID',
                          value: 'CH327810999162',
                          type: 'text',
                        },
                        {
                          label: 'Vollständigkeit',
                          value: 'Vollstaendig',
                          type: 'text',
                        },
                        {
                          label: 'Fläche [m\u0026sup2;]',
                          value: '2874',
                          type: 'text',
                        },
                        {
                          label: 'Value might be null',
                          value: null,
                          type: 'text',
                        },
                        {
                          label: 'A LinkObject',
                          value: {
                            title: 'Amon Amarth',
                            href: 'not just a LOTR location',
                          },
                          type: 'link',
                        },
                      ],
                      geometry: {
                        type: 'MultiPolygon',
                        coordinates: [
                          [
                            [
                              [2682753.58, 1247894.45],
                              [2682745.34, 1247885.4],
                              [2682743.1, 1247887.41],
                              [2682753.58, 1247894.45],
                            ],
                          ],
                        ],
                        srs: 2056,
                      },
                    },
                  ],
                },
                {
                  layer: 'LCSFC-1',
                  title: 'Bodenbedeckung farbig',
                  metaDataLink: '/data/datasets/fb89c857-84d3-73a4-abbc-39415b21f8c9',
                  features: [
                    {
                      fid: 422973978,
                      fields: [
                        {
                          label: 'BFSNr',
                          value: '261',
                          type: 'text',
                        },
                        {
                          label: 'Qualität',
                          value: 'AV93',
                          type: 'text',
                        },
                        {
                          label: 'Art',
                          value: 'Gebäude Verwaltung',
                          type: 'text',
                        },
                        {
                          label: 'GWR_EGID',
                          value: '302019364',
                          type: 'text',
                        },
                        {
                          label: 'GVZ Nr.',
                          value: 'AU04950',
                          type: 'text',
                        },
                        {
                          label: 'Geometrie [m\u0026sup2;]',
                          value: '2159.843540479304',
                          type: 'text',
                        },
                      ],
                      geometry: {
                        type: 'MultiPolygon',
                        coordinates: [
                          [
                            [
                              [2682714.88, 1247921.79],
                              [2682715.89, 1247922.88],
                              [2682725.14, 1247914.48],
                              [2682714.88, 1247921.79],
                            ],
                          ],
                        ],
                        srs: 2056,
                      },
                    },
                  ],
                },
                {
                  layer: 'MBSF-1',
                  title: 'Gemeindegrenzen',
                  metaDataLink: undefined,
                  features: [
                    {
                      fid: 76900,
                      fields: [
                        {
                          label: 'BFSNr',
                          value: '261',
                          type: 'text',
                        },
                        {
                          label: 'Name',
                          value: 'Zürich',
                          type: 'text',
                        },
                        {
                          label: 'Stand AV',
                          value: '11.12.2023',
                          type: 'text',
                        },
                      ],
                      geometry: undefined,
                    },
                  ],
                },
              ],
            },
          },
        },
      ];

      service.loadFeatureInfos(x, y, scale, queryTopics).subscribe((actual) => {
        expect(httpGetSpy).toHaveBeenCalledOnceWith(expectedUrl);
        expect(actual).toEqual(expected);
        done();
      });
    });
  });

  describe('transformFilterConfigurationToParameters', () => {
    const stringBasedFilterConfigurationsMock: FilterConfiguration[] = [
      {
        name: 'GVZ Schätzungen und Schäden',
        parameter: 'FILTER_REGIO',
        description: 'Region',
        filterValues: [
          {
            isActive: false,
            name: 'Region 1 und 3',
            values: ['Region 1', 'Region 3'],
          },
          {
            isActive: true,
            name: 'Region 2',
            values: ['Region 2'],
          },
          {
            isActive: false,
            name: 'Region 4',
            values: ['Region 4'],
          },
          {
            isActive: true,
            name: 'Region 5 und 6',
            values: ['Region 5', 'Region 6'],
          },
        ],
      },
      {
        name: 'GVZ Schätzungen und Schäden',
        parameter: 'FILTER_TYP',
        description: 'Grundstück/Gebäude',
        filterValues: [
          {
            isActive: false,
            name: 'Einzelschätzung',
            values: ['Schätzungsbegehren'],
          },
          {
            isActive: false,
            name: 'Revisionsschätzung',
            values: ['Revisionsschätzung'],
          },
        ],
      },
    ];

    const numberBasedFilterConfigurationsMock: FilterConfiguration[] = [
      {
        name: 'GVZ Schätzungen und Schäden',
        parameter: 'FILTER_STATUS',
        description: 'Zugeteilt',
        filterValues: [
          {
            isActive: false,
            name: 'Ja',
            values: [1],
          },
          {
            isActive: false,
            name: 'Nein',
            values: [0],
          },
        ],
      },
      {
        name: 'GVZ Gigaparser',
        parameter: 'PARSER_MAXIMUM',
        description: 'Parsing it all',
        filterValues: [
          {
            isActive: true,
            name: 'Blazing',
            values: [420],
          },
          {
            isActive: true,
            name: 'answer',
            values: [42],
          },
          {
            isActive: false,
            name: 'No scope',
            values: [360, 720],
          },
          {
            isActive: true,
            name: 'Powerlevel',
            values: [9001, 9002],
          },
        ],
      },
    ];

    it('should transform string based filter values correctly', () => {
      const expectedFilterValues: WmsFilterValue[] = [
        {name: 'FILTER_REGIO', value: `'Region 1','Region 3','','Region 4','',''`},
        {name: 'FILTER_TYP', value: `'Schätzungsbegehren','Revisionsschätzung'`},
      ];
      const actualFilterValues = service.transformFilterConfigurationToParameters(stringBasedFilterConfigurationsMock);

      expect(actualFilterValues).toEqual(expectedFilterValues);
    });

    it('should transform number based filter values correctly', () => {
      const expectedFilterValues: WmsFilterValue[] = [
        {name: 'FILTER_STATUS', value: `1,0`},
        {name: 'PARSER_MAXIMUM', value: `-1,-1,360,720,-1,-1`},
      ];
      const actualFilterValues = service.transformFilterConfigurationToParameters(numberBasedFilterConfigurationsMock);

      expect(actualFilterValues).toEqual(expectedFilterValues);
    });
  });
});
