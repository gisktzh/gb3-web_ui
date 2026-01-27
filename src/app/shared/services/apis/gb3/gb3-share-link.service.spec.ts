/* eslint-disable @typescript-eslint/naming-convention */
import {TestBed} from '@angular/core/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {Gb3ShareLinkService} from './gb3-share-link.service';
import {SharedFavorite, SharedFavoriteNew} from '../../../models/gb3-api-generated.interfaces';
import {HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {of} from 'rxjs';
import {ShareLinkItem} from '../../../interfaces/share-link.interface';
import {Gb3VectorLayer} from '../../../interfaces/gb3-vector-layer.interface';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectMaps} from '../../../../state/map/selectors/maps.selector';
import {selectActiveMapItemConfigurations} from '../../../../state/map/selectors/active-map-item-configuration.selector';
import {selectFavouriteBaseConfig} from '../../../../state/map/selectors/favourite-base-config.selector';
import {selectUserDrawingsVectorLayers} from '../../../../state/map/selectors/user-drawings-vector-layers.selector';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {DrawingSymbolServiceStub} from 'src/app/testing/map-testing/drawing-symbol-service.stub';

// todo: add tests for vector layers
const mockedVectorLayer = {type: undefined, styles: undefined, geojson: {type: undefined, features: []}} as unknown as Gb3VectorLayer;
describe('Gb3ShareLinkService', () => {
  let service: Gb3ShareLinkService;
  let store: MockStore;
  const shareLinkItemIdMock = 'mock-id';
  const serverDataMock: SharedFavorite = {
    east: 2600003,
    north: 1100003,
    scaledenom: 1003,
    basemap: 'basemap3',
    created_at: '11-11-2011',
    updated_at: '11-11-2011',
    id: 'mock-id',
    owner: null,
    content: [
      {
        id: 'FnsAPFloraMainZH',
        mapId: 'FnsAPFloraMainZH',
        visible: true,
        opacity: 1,
        isSingleLayer: false,
        timeExtent: undefined,
        attributeFilters: undefined,
        layers: [
          {
            id: 113561,
            layer: 'seen',
            visible: true,
          },
        ],
      },
    ],
    drawings: mockedVectorLayer,
    measurements: mockedVectorLayer,
  };
  const shareLinkItemMock: ShareLinkItem = {
    center: {x: 2600003, y: 1100003},
    scale: 1003,
    basemapId: 'basemap3',
    content: [
      {
        id: 'FnsAPFloraMainZH',
        mapId: 'FnsAPFloraMainZH',
        visible: true,
        opacity: 1,
        isSingleLayer: false,
        timeExtent: undefined,
        attributeFilters: undefined,
        layers: [
          {
            id: 113561,
            layer: 'seen',
            visible: true,
          },
        ],
      },
    ],
    drawings: mockedVectorLayer,
    measurements: mockedVectorLayer,
  };
  const shareLinkItemAsDataMock: SharedFavoriteNew = {
    east: 2600003,
    north: 1100003,
    scaledenom: 1003,
    basemap: 'basemap3',
    content: [
      {
        id: 'FnsAPFloraMainZH',
        mapId: 'FnsAPFloraMainZH',
        visible: true,
        opacity: 1,
        isSingleLayer: false,
        timeExtent: undefined,
        attributeFilters: undefined,
        layers: [
          {
            id: 113561,
            layer: 'seen',
            visible: true,
          },
        ],
      },
    ],
    drawings: mockedVectorLayer,
    measurements: mockedVectorLayer,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideMockStore({}),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {provide: DRAWING_SYMBOLS_SERVICE, useClass: DrawingSymbolServiceStub},
      ],
    });
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectActiveMapItemConfigurations, []);
    store.overrideSelector(selectMaps, []);
    store.overrideSelector(selectFavouriteBaseConfig, {center: {x: 0, y: 0}, scale: 0, basemap: ''});
    store.overrideSelector(selectUserDrawingsVectorLayers, {
      drawings: [],
      measurements: [],
    });
    service = TestBed.inject(Gb3ShareLinkService);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spyOn<any>(service, 'getFullEndpointUrl').and.returnValue('');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadShareLink', () => {
    it('should receive the data and transform it correctly', (done: DoneFn) => {
      const httpClient = TestBed.inject(HttpClient);
      const getCallSpy = spyOn(httpClient, 'get').and.returnValue(of(serverDataMock));
      service.loadShareLink(shareLinkItemIdMock).subscribe((shareLinkItem) => {
        expect(getCallSpy).toHaveBeenCalledOnceWith(`/${shareLinkItemIdMock}`);
        expect(shareLinkItem).toBeDefined();
        expect(shareLinkItem).toEqual(shareLinkItemMock);
        done();
      });
    });
  });

  describe('createShareLink', () => {
    it('should send the data and transform it correctly', (done: DoneFn) => {
      const httpClient = TestBed.inject(HttpClient);
      const postCallSpy = spyOn(httpClient, 'post').and.returnValue(of({id: shareLinkItemIdMock}));
      service.createShareLink(shareLinkItemMock).subscribe((shareLinkItemId) => {
        expect(postCallSpy).toHaveBeenCalledOnceWith('', shareLinkItemAsDataMock, {headers: undefined});
        expect(shareLinkItemId).toBeDefined();
        expect(shareLinkItemId).toBe(shareLinkItemIdMock);
        done();
      });
    });
  });
});
