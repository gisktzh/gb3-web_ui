import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {Gb3ShareLinkService} from './gb3-share-link.service';
import {SharedFavorite, SharedFavoriteNew} from '../../../models/gb3-api-generated.interfaces';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {ShareLinkItem} from '../../../interfaces/share-link.interface';

describe('Gb3ShareLinkServiceService', () => {
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
    drawings: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [2600000, 1100000],
            [2600000, 1100001],
            [2600001, 1100001],
            [2600001, 1100000],
            [2600000, 1100000],
          ],
        },
        properties: {
          style: {
            fillColor: '#FF0000',
            fillOpacity: 0,
            rotation: '30',
            externalGraphic: 'identify_marker.png',
            graphicName: 'circle',
            graphicOpacity: 0.4,
            pointRadius: 5,
            strokeColor: '#FFA829',
            strokeOpacity: 1,
            strokeWidth: 5,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeDashstyle: 'dot',
            fontColor: '#000000',
            fontFamily: 'sans-serif',
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: 'bold',
            haloColor: '#123456',
            haloOpacity: '0.7',
            haloRadius: '3.0',
            label: '${name}',
            labelAlign: 'cm',
            labelRotation: '45',
            labelXOffset: '-25.0',
            labelYOffset: '-35.0',
          },
        },
      },
    ],
    measurements: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [2600000, 1100000],
            [2600000, 1100001],
          ],
        },
        properties: {
          label: {
            text: '1m',
            coordinates: [2400000, 1150000],
          },
        },
      },
    ],
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
    drawings: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [2600000, 1100000],
            [2600000, 1100001],
            [2600001, 1100001],
            [2600001, 1100000],
            [2600000, 1100000],
          ],
        },
        properties: {
          style: {
            fillColor: '#FF0000',
            fillOpacity: 0,
            rotation: '30',
            externalGraphic: 'identify_marker.png',
            graphicName: 'circle',
            graphicOpacity: 0.4,
            pointRadius: 5,
            strokeColor: '#FFA829',
            strokeOpacity: 1,
            strokeWidth: 5,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeDashstyle: 'dot',
            fontColor: '#000000',
            fontFamily: 'sans-serif',
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: 'bold',
            haloColor: '#123456',
            haloOpacity: '0.7',
            haloRadius: '3.0',
            label: '${name}',
            labelAlign: 'cm',
            labelRotation: '45',
            labelXOffset: '-25.0',
            labelYOffset: '-35.0',
          },
        },
      },
    ],
    measurements: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [2600000, 1100000],
            [2600000, 1100001],
          ],
        },
        properties: {
          label: {
            text: '1m',
            coordinates: [2400000, 1150000],
          },
        },
      },
    ],
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
    drawings: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [2600000, 1100000],
            [2600000, 1100001],
            [2600001, 1100001],
            [2600001, 1100000],
            [2600000, 1100000],
          ],
        },
        properties: {
          style: {
            fillColor: '#FF0000',
            fillOpacity: 0,
            rotation: '30',
            externalGraphic: 'identify_marker.png',
            graphicName: 'circle',
            graphicOpacity: 0.4,
            pointRadius: 5,
            strokeColor: '#FFA829',
            strokeOpacity: 1,
            strokeWidth: 5,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeDashstyle: 'dot',
            fontColor: '#000000',
            fontFamily: 'sans-serif',
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: 'bold',
            haloColor: '#123456',
            haloOpacity: '0.7',
            haloRadius: '3.0',
            label: '${name}',
            labelAlign: 'cm',
            labelRotation: '45',
            labelXOffset: '-25.0',
            labelYOffset: '-35.0',
          },
        },
      },
    ],
    measurements: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [2600000, 1100000],
            [2600000, 1100001],
          ],
        },
        properties: {
          label: {
            text: '1m',
            coordinates: [2400000, 1150000],
          },
        },
      },
    ],
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
