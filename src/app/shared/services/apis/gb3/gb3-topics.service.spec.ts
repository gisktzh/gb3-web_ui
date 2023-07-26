import {TestBed} from '@angular/core/testing';
import {Gb3TopicsService} from './gb3-topics.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TopicsListData} from '../../../models/gb3-api-generated.interfaces';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {ConfigService} from '../../config.service';

describe('Gb3TopicsServiceTsService', () => {
  let service: Gb3TopicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(Gb3TopicsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('load topics', () => {
    const mockData: TopicsListData = {
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
              guid: null,
              keywords: ['Gebäudealter', 'stat', 'obs', 'fap', 'denkk', 'fsla'],
              notice: null,
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
                  guid: null,
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
                  guid: null,
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
                  guid: null,
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

    it('should receive the data and transform it without error', (done: DoneFn) => {
      const httpClient = TestBed.inject(HttpClient);
      spyOn(httpClient, 'get').and.returnValue(of(mockData));
      service.loadTopics().subscribe((topicsResponse) => {
        expect(topicsResponse).toBeDefined();
        expect(topicsResponse.topics.length).toBe(mockData.categories.flatMap((category) => category.topics).length);
        done();
      });
    });

    it('should receive the data and transform it correctly', (done: DoneFn) => {
      const configService = TestBed.inject(ConfigService);
      const httpClient = TestBed.inject(HttpClient);
      spyOn(httpClient, 'get').and.returnValue(of(mockData));
      service.loadTopics().subscribe((topicsResponse) => {
        expect(topicsResponse).toBeDefined();
        expect(topicsResponse.topics.length).toBe(1);

        // =============================
        // API category === GB3 topic
        // API topic === GB3 map
        // API layer === GB3 layer
        // =============================

        const expectedTopic = mockData.categories[0];
        const responseTopic = topicsResponse.topics.find((topic) => topic.title === expectedTopic.title);
        expect(responseTopic).toBeDefined();

        expectedTopic.topics.forEach((expectedMap) => {
          const responseMap = responseTopic?.maps.find((map) => map.id === expectedMap.topic);
          expect(responseMap).toBeDefined();
          if (responseMap) {
            expect(responseMap.title).toBe(expectedMap.title);
            expect(responseMap.guid).toBe(expectedMap.guid);
            expect(responseMap.gb2Url).toBe(expectedMap.gb2_url);
            expect(responseMap.filterConfigurations?.length).toBe(expectedMap.filterConfigurations.length);
            expect(responseMap.keywords.length).toBe(expectedMap.keywords.length);
            expect(responseMap.icon).toBe(`${configService.apiConfig.gb2StaticFiles.baseUrl}${expectedMap.icon}`);
            expect(responseMap.layers.length).toBe(expectedMap.layers.length);
            expect(responseMap.minScale).toBe(expectedMap.min_scale);
            expect(responseMap.notice).toBe(expectedMap.notice);
            expect(responseMap.organisation).toBe(expectedMap.organisation);
            expect(responseMap.searchConfigurations?.length).toBe(expectedMap.searchConfigurations?.length);
            expect(responseMap.timeSliderConfiguration?.name).toBe(expectedMap.timesliderConfiguration.name);
            expect(responseMap.wmsUrl).toBe(expectedMap.wms_url);

            // test layer order (which must be inverted)
            expectedMap.layers.forEach((expectedLayer, index) => {
              const position = expectedMap.layers.length - 1 - index;
              const responseLayer = responseMap.layers[position];
              expect(responseLayer.id).toBe(expectedLayer.id);
              expect(responseLayer.layer).toBe(expectedLayer.layer);
              expect(responseLayer.title).toBe(expectedLayer.title);
              expect(responseLayer.visible).toBe(expectedLayer.initially_visible);
            });
          }
        });
        done();
      });
    });
  });
});
