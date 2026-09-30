/* eslint-disable @typescript-eslint/naming-convention */
import {TestBed} from '@angular/core/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {PersonalFavoriteNew, SharedFavorite, UserFavoritesListData} from '../../../models/gb3-api-generated.interfaces';
import {HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {of} from 'rxjs';
import {Gb3VectorLayer} from '../../../interfaces/gb3-vector-layer.interface';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectMaps} from '../../../../state/map/selectors/maps.selector';
import {selectActiveMapItemConfigurations} from '../../../../state/map/selectors/active-map-item-configuration.selector';
import {selectFavouriteBaseConfig} from '../../../../state/map/selectors/favourite-base-config.selector';
import {selectUserDrawingsVectorLayers} from '../../../../state/map/selectors/user-drawings-vector-layers.selector';
import {Gb3FavouritesService} from './gb3-favourites.service';
import {CreateFavourite, Favourite} from '../../../interfaces/favourite.interface';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {DrawingSymbolServiceStub} from 'src/app/testing/map-testing/drawing-symbol-service.stub';

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

  const loadFavouriteExtentCases = [
    {
      description: 'center and scale are missing',
      east: null,
      north: null,
      scaledenom: null,
      expectedCenter: undefined,
      expectedScale: undefined,
    },
    {
      description: 'only center is missing',
      east: null,
      north: null,
      scaledenom: 1_003,
      expectedCenter: undefined,
      expectedScale: 1_003,
    },
    {
      description: 'only scale is missing',
      east: 2_600_003,
      north: 1_100_003,
      scaledenom: null,
      expectedCenter: {x: 2_600_003, y: 1_100_003},
      expectedScale: undefined,
    },
    {
      description: 'one center coordinate is missing',
      east: null,
      north: 1_100_003,
      scaledenom: 1_003,
      expectedCenter: undefined,
      expectedScale: 1_003,
    },
  ];
  const createFavouriteExtentCases = [
    {
      description: 'center and scale',
      baseConfig: {basemap: 'basemap3'},
      expectedEast: null,
      expectedNorth: null,
      expectedScale: null,
    },
    {
      description: 'center',
      baseConfig: {basemap: 'basemap3', scale: 1_003},
      expectedEast: null,
      expectedNorth: null,
      expectedScale: 1_003,
    },
    {
      description: 'scale',
      baseConfig: {basemap: 'basemap3', center: {x: 2_600_003, y: 1_100_003}},
      expectedEast: 2_600_003,
      expectedNorth: 1_100_003,
      expectedScale: null,
    },
  ];

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
    service = TestBed.inject(Gb3FavouritesService);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(service as any, 'getFullEndpointUrl').mockReturnValue('');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadFavourites', () => {
    it('should receive the data and transform it correctly', () => {
      const httpClient = TestBed.inject(HttpClient);
      const getCallSpy = vi.spyOn(httpClient, 'get').mockReturnValue(of(serverDataMock));
      service.loadFavourites().subscribe((favouritesResponse) => {
        expect(getCallSpy).toHaveBeenCalledTimes(1);
        expect(favouritesResponse).toBeDefined();
        expect(favouritesResponse).toEqual(favouriteItemsMock);
      });
    });

    it.each(loadFavouriteExtentCases)(
      'should preserve an omitted map extent when $description',
      ({east, north, scaledenom, expectedCenter, expectedScale}) => {
        const httpClient = TestBed.inject(HttpClient);
        vi.spyOn(httpClient, 'get').mockReturnValue(
          of([
            {
              ...serverDataMock[0],
              east,
              north,
              scaledenom,
            },
          ] satisfies UserFavoritesListData),
        );

        service.loadFavourites().subscribe(([favourite]) => {
          expect(favourite.baseConfig).toEqual({
            basemap: serverDataMock[0].basemap,
            center: expectedCenter,
            scale: expectedScale,
          });
        });
      },
    );
  });

  describe('createFavourite', () => {
    it('should send the data and transform it correctly', () => {
      const httpClient = TestBed.inject(HttpClient);
      const postCallSpy = vi.spyOn(httpClient, 'post').mockReturnValue(of(newSharedFavouriteMock));
      service.createFavourite(newFavouriteItemMock).subscribe((sharedFavourite) => {
        expect(postCallSpy).toHaveBeenCalledTimes(1);
        expect(postCallSpy).toHaveBeenCalledWith('', newPersonalFavourite, {headers: undefined});
        expect(sharedFavourite).toBeDefined();
        expect(sharedFavourite).toBe(newSharedFavouriteMock);
      });
    });

    it.each(createFavouriteExtentCases)(
      'should send null for an omitted $description',
      ({baseConfig, expectedEast, expectedNorth, expectedScale}) => {
        const httpClient = TestBed.inject(HttpClient);
        const postCallSpy = vi.spyOn(httpClient, 'post').mockReturnValue(of(newSharedFavouriteMock));

        service.createFavourite({...newFavouriteItemMock, baseConfig}).subscribe(() => {
          expect(postCallSpy).toHaveBeenCalledWith(
            '',
            {
              ...newPersonalFavourite,
              east: expectedEast,
              north: expectedNorth,
              scaledenom: expectedScale,
            },
            {headers: undefined},
          );
        });
      },
    );
  });
});
