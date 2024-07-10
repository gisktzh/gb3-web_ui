/* eslint-disable @typescript-eslint/naming-convention */

import {TestBed} from '@angular/core/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {PrintCreateData, PrintNew} from '../../../models/gb3-api-generated.interfaces';
import {HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {of} from 'rxjs';
import {Gb3PrintService} from './gb3-print.service';
import {PrintCreation} from '../../../interfaces/print.interface';
import {ConfigService} from '../../config.service';
import {PrintableOverlayItem} from '../../../interfaces/overlay-print.interface';
import {FeatureInfoQueryLocation} from '../../../interfaces/feature-info.interface';
import {provideMockStore} from '@ngrx/store/testing';
import {Gb3StyledInternalDrawingRepresentation} from '../../../interfaces/internal-drawing-representation.interface';
import {
  createDrawingMapItemMock,
  createExternalWmsMapItemMock,
  createGb2WmsMapItemMock,
} from '../../../../testing/map-testing/active-map-item-test.utils';
import {UserDrawingLayer} from '../../../enums/drawing-layer.enum';
import {UuidUtils} from '../../../utils/uuid.utils';
import {BasemapConfigService} from '../../../../map/services/basemap-config.service';
import {Basemap} from '../../../interfaces/basemap.interface';
import {PrintData} from '../../../../map/interfaces/print-data.interface';

describe('Gb3PrintService', () => {
  let service: Gb3PrintService;
  let httpClient: HttpClient;
  let configService: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideMockStore(), provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    });
    service = TestBed.inject(Gb3PrintService);
    httpClient = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create print job', () => {
    const printCreationMock: PrintCreation = {
      reportType: 'standard',
      format: 'tschif',
      reportLayout: 'mobile',
      reportOrientation: 'portrait',
      attributes: {
        reportTitle: 'Passierschein a38',
        userTitle: 'Haus, das Verrückte macht',
        userComment: 'Die Spinnen, die Römer',
        showLegend: true,
      },
      map: {
        dpi: 9001,
        rotation: 42,
        scale: 123_456_789,
        center: [12.3, 45.6],
        mapItems: [
          {
            type: 'WMS',
            mapTitle: 'karte 1',
            customParams: {
              myCustomParamOne: 'myCustomValue',
            },
            background: false,
            layers: ['gott', 'würfelt', 'nicht'],
            url: 'url 1',
            opacity: 0.666,
          },
          {
            type: 'WMS',
            mapTitle: 'karte 2',
            background: false,
            layers: ['holla', 'die', 'waldfee'],
            url: 'url 2',
            opacity: 1,
          },
          {
            type: 'WMS',
            mapTitle: 'karte 3',
            background: false,
            layers: ['yolo'],
            url: 'url 3',
            opacity: 1,
          },
          {
            type: 'WMS',
            mapTitle: 'karte 4',
            background: true,
            layers: [],
            url: 'url 4',
            opacity: 1,
          },
        ],
      },
    };

    const transformedPrintCreationMock: PrintNew = {
      format: 'tschif',
      report: 'mobile hoch',
      attributes: {
        report_title: 'Passierschein a38',
        user_title: 'Haus, das Verrückte macht',
        user_comment: 'Die Spinnen, die Römer',
        show_legend: true,
      },
      map: {
        dpi: 9001,
        rotation: 42,
        scale: 123_456_789,
        center: [12.3, 45.6],
        layers: [
          {
            type: 'WMS',
            map_title: 'karte 1',
            custom_params: {
              myCustomParamOne: 'myCustomValue',
            },
            background: false,
            layers: ['gott', 'würfelt', 'nicht'],
            url: 'url 1',
            opacity: 0.666,
          },
          {
            type: 'WMS',
            map_title: 'karte 2',
            custom_params: undefined,
            background: false,
            layers: ['holla', 'die', 'waldfee'],
            url: 'url 2',
            opacity: 1,
          },
          {
            type: 'WMS',
            map_title: 'karte 3',
            custom_params: undefined,
            background: false,
            layers: ['yolo'],
            url: 'url 3',
            opacity: 1,
          },
          {
            type: 'WMS',
            map_title: 'karte 4',
            custom_params: undefined,
            background: true,
            layers: [],
            url: 'url 4',
            opacity: 1,
          },
        ],
      },
    };

    const printResponseMock: PrintCreateData = {report_url: 'result url mock'};

    it('should transform and send print jobs', (done: DoneFn) => {
      const postCallSpy = spyOn(httpClient, 'post').and.returnValue(of(printResponseMock));

      service.createPrintJob(printCreationMock).subscribe((response) => {
        expect(response.reportUrl).toBe(printResponseMock.report_url);
        expect(postCallSpy).toHaveBeenCalledOnceWith(
          `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/print`,
          transformedPrintCreationMock,
          {
            headers: undefined,
          },
        );
        done();
      });
    });
  });

  describe('printLegend', () => {
    it('sends the printLegend request correctly', (done: DoneFn) => {
      const mockResponse: PrintCreateData = {report_url: 'https://www.example.com'};
      const postCallSpy = spyOn(httpClient, 'post').and.returnValue(of(mockResponse));
      const items: PrintableOverlayItem[] = [{topic: 'Legolas', layers: ['Has a mighty bow', 'And surfs on a shield']}];

      service.printLegend(items).subscribe((response) => {
        expect(response.reportUrl).toBe(mockResponse.report_url);
        expect(postCallSpy).toHaveBeenCalledOnceWith(
          `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/print/legend`,
          {legend_topics: items},
          {
            headers: undefined,
          },
        );
        done();
      });
    });
  });

  describe('printFeatureInfo', () => {
    it('sends the printFeatureInfo request correctly', (done: DoneFn) => {
      const mockResponse: PrintCreateData = {report_url: 'https://www.example.com'};
      const postCallSpy = spyOn(httpClient, 'post').and.returnValue(of(mockResponse));
      const mockQueryLocation: FeatureInfoQueryLocation = {x: 1337, y: 9001};
      const items: PrintableOverlayItem[] = [{topic: 'Legolas', layers: ['Has a mighty bow', 'And surfs on a shield']}];

      service.printFeatureInfo(items, mockQueryLocation.x!, mockQueryLocation.y!).subscribe((response) => {
        expect(response.reportUrl).toBe(mockResponse.report_url);
        expect(postCallSpy).toHaveBeenCalledOnceWith(
          `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/print/feature_info`,
          {
            query_topics: items,
            x: mockQueryLocation.x,
            y: mockQueryLocation.y,
          },
          {
            headers: undefined,
          },
        );
        done();
      });
    });
  });

  describe('createPrintCreation', () => {
    it('creates a PrintCreation object from given parameters', () => {
      spyOn(UuidUtils, 'createUuid').and.returnValue('not-a-real-uuid');
      const basemapConfigService = TestBed.inject(BasemapConfigService);
      spyOnProperty(basemapConfigService, 'availableBasemaps', 'get').and.returnValue([
        {
          type: 'wms',
          id: 'test-basemap',
          title: 'test-basemap-title',
          url: 'https://test-basemap.com',
          layers: [{name: 'layer0_test-basemap'}, {name: 'layer1_test-basemap'}],
        } as Basemap,
      ]);

      const printData: PrintData = {
        reportType: 'standard',
        format: 'rom',
        reportLayout: 'A38',
        reportOrientation: 'portrait',
        title: 'Asterix & Obelix',
        comment: 'Die Spinnen, die Römer',
        showLegend: true,
        scale: 666,
        dpi: 1337,
        rotation: 420,
        activeBasemapId: 'test-basemap',
        activeMapItems: [
          createGb2WmsMapItemMock('visible map #1', 2),
          createGb2WmsMapItemMock('invisible map #2', 1, false),
          createDrawingMapItemMock(UserDrawingLayer.Drawings),
          createGb2WmsMapItemMock('visible map #3', 4),
          createExternalWmsMapItemMock('https://www.example.com/wms', 'visible map #4', []),
        ],
        mapCenter: {x: 900, y: 1},
        drawings: [
          {
            id: 'not-a-real-uuid',
            labelText: 'style me up',
            source: UserDrawingLayer.Drawings,
            properties: {style: {type: 'point'}},
          } as Gb3StyledInternalDrawingRepresentation,
        ],
      };

      const result = service.createPrintCreation(printData);

      expect(result).toEqual({
        reportType: printData.reportType,
        format: printData.format,
        reportLayout: printData.reportLayout,
        reportOrientation: printData.reportOrientation,
        attributes: {
          reportTitle: 'visible map #3, visible map #1',
          userTitle: printData.title,
          userComment: printData.comment,
          showLegend: printData.showLegend,
        },
        map: {
          scale: printData.scale,
          dpi: printData.dpi,
          center: [printData.mapCenter.x, printData.mapCenter.y],
          rotation: printData.rotation,
          mapItems: [
            {
              type: 'WMS',
              mapTitle: 'test-basemap-title',
              layers: ['layer0_test-basemap', 'layer1_test-basemap'], // no inversion here because this is not an active map item
              url: 'https://test-basemap.com',
              opacity: 1,
              background: true,
            },
            {
              type: 'WMS',
              mapTitle: 'visible map #3',
              layers: ['layer3_visible map #3', 'layer2_visible map #3', 'layer1_visible map #3', 'layer0_visible map #3'],
              url: 'https://visible map #3.com',
              opacity: 1,
              customParams: {format: 'image/png; mode=8bit', transparent: true},
            },
            {
              type: 'Vector',
              geojson: {
                type: 'FeatureCollection',
                features: [jasmine.objectContaining({properties: jasmine.objectContaining({style: 'not-a-real-uuid'})})],
              },
              styles: {
                'not-a-real-uuid': {type: 'point'},
              },
            },
            {
              type: 'WMS',
              mapTitle: 'visible map #1',
              layers: ['layer1_visible map #1', 'layer0_visible map #1'],
              url: 'https://visible map #1.com',
              opacity: 1,
              customParams: {format: 'image/png; mode=8bit', transparent: true},
            },
          ],
        },
      });
    });
  });
});
