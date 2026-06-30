import {TestBed} from '@angular/core/testing';
import {EsriMapLoaderService} from './esri-map-loader.service';
import {ExternalWmsActiveMapItem} from '../../models/implementations/external-wms.model';
import {EsriMapService} from './esri-map.service';
import {catchError, EMPTY, of} from 'rxjs';
import Collection from '@arcgis/core/core/Collection';
import {ExternalKmlLayer, ExternalWmsLayer} from '../../../shared/interfaces/external-layer.interface';
import {UuidUtils} from '../../../shared/utils/uuid.utils';
import {ExternalKmlActiveMapItem} from '../../models/implementations/external-kml.model';
import {LayerCouldNotBeLoaded} from './errors/esri.errors';
import {ExternalServiceHasNoLayers} from '../../../shared/errors/map-import.errors';
import EsriError from '@arcgis/core/core/Error';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
import {MAP_SERVICE} from '../../../app.tokens';
import Layer from '@arcgis/core/layers/Layer';
import WMSSublayer from '@arcgis/core/layers/support/WMSSublayer';
import KMLSublayer from '@arcgis/core/layers/support/KMLSublayer';
import KMLLayer from '@arcgis/core/layers/KMLLayer';
import {vi} from 'vitest';

describe('EsriMapLoaderService', () => {
  let service: EsriMapLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: MAP_SERVICE, useClass: EsriMapService}],
    });
    service = TestBed.inject(EsriMapLoaderService);
    vi.spyOn(UuidUtils, 'createUuid').mockReturnValue('not-a-real-uuid');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadService', () => {
    it('throws a `LayerCouldNotBeLoaded` error if something goes wrong during loading', () => {
      const originalMessage = 'oh no! anyway...';
      const originalError = new EsriError('error name', originalMessage);
      const layer: Layer = new WMSLayer();
      vi.spyOn(layer, 'load').mockRejectedValue(originalError);

      const expectedError = new LayerCouldNotBeLoaded(originalMessage);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any)
        .loadService(layer)
        .pipe(
          catchError((actual: unknown) => {
            expect(actual).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('loadExternalService', () => {
    const url = 'www.example.com';
    const title = 'test title';

    it('loads a WMS service and return a ExternalWmsActiveMapItem', () => {
      const externalLayerOne: ExternalWmsLayer = {
        type: 'wms',
        id: 1337,
        name: 'test layer id one',
        title: 'test layer id one',
        visible: true,
      };
      const externalLayerTwo: ExternalWmsLayer = {
        type: 'wms',
        id: 9001,
        name: 'test layer id two',
        title: 'test layer id two',
        visible: false,
      };
      const imageFormat = 'image/png';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(service as any, 'loadService').mockReturnValue(
        of({
          url,
          title,
          imageFormat,
          sublayers: new Collection<Partial<WMSSublayer>>([
            {
              id: externalLayerOne.id,
              name: externalLayerOne.name,
              title: externalLayerOne.title,
              visible: externalLayerOne.visible,
            },
            {
              id: externalLayerTwo.id,
              name: externalLayerTwo.name,
              title: externalLayerTwo.title,
              visible: externalLayerTwo.visible,
            },
          ]),
        } as Partial<WMSLayer>),
      );

      const expected = new ExternalWmsActiveMapItem(url, title, [externalLayerOne, externalLayerTwo], imageFormat);

      service.loadExternalService(url, 'wms').subscribe((actual) => {
        expect(actual).toEqual(expected);
      });
    });

    it('throws an `ExternalServiceHasNoLayers` error if the loaded ExternalWmsActiveMapItem contains no layer', () => {
      const imageFormat = 'image/png';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(service as any, 'loadService').mockReturnValue(
        of({
          url,
          title,
          imageFormat,
          sublayers: new Collection<WMSSublayer>([]),
        } as Partial<WMSLayer>),
      );

      const expectedError = new ExternalServiceHasNoLayers();

      service
        .loadExternalService(url, 'wms')
        .pipe(
          catchError((actual: unknown) => {
            expect(actual).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });

    it('loads a KML service and return a ExternalKmlActiveMapItem', () => {
      const externalLayerOne: ExternalKmlLayer = {
        type: 'kml',
        id: 1337,
        title: 'test layer id one',
        visible: true,
      };
      const externalLayerTwo: ExternalKmlLayer = {
        type: 'kml',
        id: 9001,
        title: 'test layer id two',
        visible: false,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(service as any, 'loadService').mockReturnValue(
        of({
          url,
          title,
          sublayers: new Collection<Partial<KMLSublayer>>([
            {
              id: externalLayerOne.id,
              title: externalLayerOne.title,
              visible: externalLayerOne.visible,
            },
            {
              id: externalLayerTwo.id,
              title: externalLayerTwo.title,
              visible: externalLayerTwo.visible,
            },
          ]),
        } as Partial<KMLLayer>),
      );

      const expected = new ExternalKmlActiveMapItem(url, title, [externalLayerOne, externalLayerTwo]);

      service.loadExternalService(url, 'kml').subscribe((actual) => {
        expect(actual).toEqual(expected);
      });
    });

    it('throws an `ExternalServiceHasNoLayers` error if the loaded ExternalKmlActiveMapItem contains no layer', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(service as any, 'loadService').mockReturnValue(
        of({
          url,
          title,
          sublayers: new Collection<KMLSublayer>([]),
        } as Partial<KMLLayer>),
      );

      const expectedError = new ExternalServiceHasNoLayers();

      service
        .loadExternalService(url, 'kml')
        .pipe(
          catchError((actual: unknown) => {
            expect(actual).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });
});
