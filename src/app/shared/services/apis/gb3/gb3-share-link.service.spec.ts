import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {Gb3ShareLinkService} from './gb3-share-link.service';
import {SharedFavorite, SharedFavoriteNew} from '../../../models/gb3-api-generated.interfaces';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {ShareLinkItem} from '../../../interfaces/share-link.interface';
import {Gb3VectorLayer} from '../../../interfaces/gb3-vector-layer.interface';

const mockedVectorLayer = {geojson: {features: []}} as unknown as Gb3VectorLayer; //todo: add tests for vector layer
describe('Gb3ShareLinkService', () => {
  let service: Gb3ShareLinkService;
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
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(Gb3ShareLinkService);
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
