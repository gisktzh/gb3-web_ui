/* eslint-disable @typescript-eslint/naming-convention */
import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {PersonalFavoriteNew, SharedFavorite, UserFavoritesListData} from '../../../models/gb3-api-generated.interfaces';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {Gb3VectorLayer} from '../../../interfaces/gb3-vector-layer.interface';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectMaps} from '../../../../state/map/selectors/maps.selector';
import {selectActiveMapItemConfigurations} from '../../../../state/map/selectors/active-map-item-configuration.selector';
import {selectFavouriteBaseConfig} from '../../../../state/map/selectors/favourite-base-config.selector';
import {selectUserDrawingsVectorLayers} from '../../../../state/map/selectors/user-drawings-vector-layers.selector';
import {Gb3FavouritesService} from './gb3-favourites.service';
import {CreateFavourite, Favourite} from '../../../interfaces/favourite.interface';

// todo: add tests for vector layers
const mockedVectorLayer = {type: undefined, styles: undefined, geojson: {type: undefined, features: []}} as unknown as Gb3VectorLayer;
describe('Gb3FavouritesService', () => {
  let service: Gb3FavouritesService;
  let store: MockStore;
  const serverDataMock: UserFavoritesListData = [
    {
      east: 2600003,
      north: 1100003,
      scaledenom: 1003,
      basemap: 'basemap3',
      created_at: '11-11-2011',
      updated_at: '11-11-2011',
      id: 'mock-id',
      title: 'mockFavourite',
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
    },
  ];
  const favouriteItemsMock: Favourite[] = [
    {
      id: 'mock-id',
      title: 'mockFavourite',
      baseConfig: {center: {x: 2600003, y: 1100003}, scale: 1003, basemap: 'basemap3'},
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
    },
  ];

  const newFavouriteItemMock: CreateFavourite = {
    title: 'mockFavourite',
    baseConfig: {center: {x: 2600003, y: 1100003}, scale: 1003, basemap: 'basemap3'},
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
  const newPersonalFavourite: PersonalFavoriteNew = {
    east: 2600003,
    north: 1100003,
    scaledenom: 1003,
    basemap: 'basemap3',
    title: 'mockFavourite',
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
  const newSharedFavouriteMock: SharedFavorite = {
    id: 'mock-id',
    owner: null,
    east: 2600003,
    north: 1100003,
    scaledenom: 1003,
    basemap: 'basemap3',
    created_at: '',
    updated_at: '',
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
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({})],
    });
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectActiveMapItemConfigurations, []);
    store.overrideSelector(selectMaps, []);
    store.overrideSelector(selectFavouriteBaseConfig, {center: {x: 0, y: 0}, scale: 0, basemap: ''});
    store.overrideSelector(selectUserDrawingsVectorLayers, {
      drawings: {type: 'Vector', geojson: {type: 'FeatureCollection', features: []}, styles: {}},
      measurements: {type: 'Vector', geojson: {type: 'FeatureCollection', features: []}, styles: {}},
    });
    service = TestBed.inject(Gb3FavouritesService);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spyOn<any>(service, 'getFullEndpointUrl').and.returnValue('');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadFavourites', () => {
    it('should receive the data and transform it correctly', (done: DoneFn) => {
      const httpClient = TestBed.inject(HttpClient);
      const getCallSpy = spyOn(httpClient, 'get').and.returnValue(of(serverDataMock));
      service.loadFavourites().subscribe((favouritesResponse) => {
        expect(getCallSpy).toHaveBeenCalledTimes(1);
        expect(favouritesResponse).toBeDefined();
        expect(favouritesResponse).toEqual(favouriteItemsMock);
        done();
      });
    });
  });

  describe('createFavourite', () => {
    it('should send the data and transform it correctly', (done: DoneFn) => {
      const httpClient = TestBed.inject(HttpClient);
      const postCallSpy = spyOn(httpClient, 'post').and.returnValue(of(newSharedFavouriteMock));
      service.createFavourite(newFavouriteItemMock).subscribe((sharedFavourite) => {
        expect(postCallSpy).toHaveBeenCalledOnceWith('', newPersonalFavourite, {headers: undefined});
        expect(sharedFavourite).toBeDefined();
        expect(sharedFavourite).toBe(newSharedFavouriteMock);
        done();
      });
    });
  });
});
