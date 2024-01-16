import {TestBed} from '@angular/core/testing';
import {EsriMapLoaderService} from './esri-map-loader.service';
import {ExternalWmsActiveMapItem} from '../../models/implementations/external-wms.model';
import {EsriMapService} from './esri-map.service';
import {MAP_SERVICE} from '../../../app.module';
import {EMPTY, of} from 'rxjs';
import Collection from '@arcgis/core/core/Collection';
import {ExternalKmlLayer, ExternalWmsLayer} from '../../../shared/interfaces/external-layer.interface';
import {UuidUtils} from '../../../shared/utils/uuid.utils';
import {ExternalKmlActiveMapItem} from '../../models/implementations/external-kml.model';
import {LayerCouldNotBeLoaded} from './errors/esri.errors';
import {EsriError, EsriWMSLayer} from './esri.module';
import {catchError} from 'rxjs/operators';
import {ExternalServiceHasNoLayers} from '../../../shared/errors/map-import.errors';

describe('EsriMapLoaderService', () => {
  let service: EsriMapLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: MAP_SERVICE, useClass: EsriMapService}],
    });
    service = TestBed.inject(EsriMapLoaderService);
    spyOn(UuidUtils, 'createUuid').and.returnValue('not-a-real-uuid');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadService', () => {
    it('throws a `LayerCouldNotBeLoaded` error if something goes wrong during loading', (done: DoneFn) => {
      const originalMessage = 'oh no! anyway...';
      const originalError = new EsriError('error name', originalMessage);
      const layer: __esri.Layer = new EsriWMSLayer();
      spyOn(layer, 'load').and.rejectWith(originalError);

      const expectedError = new LayerCouldNotBeLoaded(originalMessage);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any)
        .loadService(layer)
        .pipe(
          catchError((actual) => {
            expect(actual).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('loadExternalService', () => {
    const url = 'www.example.com';
    const title = 'test title';

    it('loads a WMS service and return a ExternalWmsActiveMapItem', (done) => {
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
      spyOn<any>(service, 'loadService').and.returnValue(
        of({
          url,
          title,
          imageFormat,
          sublayers: new Collection<__esri.WMSSublayer>([
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
        } as Partial<__esri.WMSLayer>),
      );

      const expected = new ExternalWmsActiveMapItem(url, title, [externalLayerOne, externalLayerTwo], imageFormat);

      service.loadExternalService(url, 'wms').subscribe((actual) => {
        expect(actual).toEqual(expected);
        done();
      });
    });

    it('throws an `ExternalServiceHasNoLayers` error if the loaded ExternalWmsActiveMapItem contains no layer', (done) => {
      const imageFormat = 'image/png';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      spyOn<any>(service, 'loadService').and.returnValue(
        of({
          url,
          title,
          imageFormat,
          sublayers: new Collection<__esri.WMSSublayer>([]),
        } as Partial<__esri.WMSLayer>),
      );

      const expectedError = new ExternalServiceHasNoLayers();

      service
        .loadExternalService(url, 'wms')
        .pipe(
          catchError((actual) => {
            expect(actual).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });

    it('loads a KML service and return a ExternalKmlActiveMapItem', (done) => {
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
      spyOn<any>(service, 'loadService').and.returnValue(
        of({
          url,
          title,
          sublayers: new Collection<__esri.KMLSublayer>([
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
        } as Partial<__esri.KMLLayer>),
      );

      const expected = new ExternalKmlActiveMapItem(url, title, [externalLayerOne, externalLayerTwo]);

      service.loadExternalService(url, 'kml').subscribe((actual) => {
        expect(actual).toEqual(expected);
        done();
      });
    });

    it('throws an `ExternalServiceHasNoLayers` error if the loaded ExternalKmlActiveMapItem contains no layer', (done) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      spyOn<any>(service, 'loadService').and.returnValue(
        of({
          url,
          title,
          sublayers: new Collection<__esri.KMLSublayer>([]),
        } as Partial<__esri.KMLLayer>),
      );

      const expectedError = new ExternalServiceHasNoLayers();

      service
        .loadExternalService(url, 'kml')
        .pipe(
          catchError((actual) => {
            expect(actual).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });
});
