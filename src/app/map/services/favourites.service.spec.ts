import {TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {FavouritesService} from './favourites.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {selectActiveMapItemConfigurations} from '../../state/map/selectors/active-map-item-configuration.selector';
import {selectMaps} from '../../state/map/selectors/maps.selector';
import {selectFavouriteBaseConfig} from '../../state/map/selectors/favourite-base-config.selector';
import {selectUserDrawingsVectorLayers} from '../../state/map/selectors/user-drawings-vector-layers.selector';
import {Gb3FavouritesService} from '../../shared/services/apis/gb3/gb3-favourites.service';
import {CreateFavourite, Favourite, FavouritesResponse} from '../../shared/interfaces/favourite.interface';
import {of} from 'rxjs';
import {SharedFavorite} from '../../shared/models/gb3-api-generated.interfaces';
import {ActiveMapItemConfiguration} from '../../shared/interfaces/active-map-item-configuration.interface';
import {ActiveMapItem} from '../models/active-map-item.model';
import {ActiveMapItemFactory} from '../../shared/factories/active-map-item.factory';
import {FavouriteIsInvalid} from '../../shared/errors/favourite.errors';
import {Gb3VectorLayer} from '../../shared/interfaces/gb3-vector-layer.interface';
import {Gb3StyledInternalDrawingRepresentation} from '../../shared/interfaces/internal-drawing-representation.interface';
import {DrawingActiveMapItem} from '../models/implementations/drawing.model';
import {MapConstants} from '../../shared/constants/map.constants';
import {UserDrawingLayer} from '../../shared/enums/drawing-layer.enum';
import {SymbolizationToGb3ConverterUtils} from '../../shared/utils/symbolization-to-gb3-converter.utils';
import {FavouriteFilterConfiguration, FilterConfiguration, Map, TimeSliderConfiguration} from '../../shared/interfaces/topic.interface';
import {TimeExtentUtils} from '../../shared/utils/time-extent.utils';
import {TimeExtent} from '../interfaces/time-extent.interface';

describe('FavouritesService', () => {
  let service: FavouritesService;
  let store: MockStore;
  let gb3FavouritesService: Gb3FavouritesService;

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
    service = TestBed.inject(FavouritesService);
    gb3FavouritesService = TestBed.inject(Gb3FavouritesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createFavourite', () => {
    it('calls the Gb3FavouritesService.createFavourite using the given title and returns the result', (done: DoneFn) => {
      const title = 'test title';
      const createFavouriteResult = {id: 'a'} as SharedFavorite;
      const gb3FavouritesServiceSpy = spyOn(gb3FavouritesService, 'createFavourite').and.returnValue(of(createFavouriteResult));

      const expectedServiceCallObject = jasmine.objectContaining<CreateFavourite>({title});

      service.createFavourite(title).subscribe((actual) => {
        expect(gb3FavouritesServiceSpy).toHaveBeenCalledOnceWith(expectedServiceCallObject);
        expect(actual).toEqual(createFavouriteResult);
        done();
      });
    });
  });

  describe('loadFavourites', () => {
    it('calls the Gb3FavouritesService.loadFavourites and returns the result', (done: DoneFn) => {
      const favouriteResponse = [] as FavouritesResponse;
      const gb3FavouritesServiceSpy = spyOn(gb3FavouritesService, 'loadFavourites').and.returnValue(of(favouriteResponse));

      service.loadFavourites().subscribe((actual) => {
        expect(gb3FavouritesServiceSpy).toHaveBeenCalledOnceWith();
        expect(actual).toEqual(favouriteResponse);
        done();
      });
    });
  });

  describe('getActiveMapItemsForFavourite', () => {
    const availableMaps: Map[] = [
      {
        id: 'FaBoFFFZH',
        uuid: '27fd3dc4-a4d8-450c-837f-70dd2f5cd5fe',
        printTitle: 'Fruchtfolgeflächen (FFF)',
        gb2Url: null,
        icon: 'https://maps.zh.ch/images/custom/themekl-fabofffzh.gif',
        wmsUrl: 'https://maps.zh.ch/wms/FaBoFFFZH',
        minScale: 2500,
        organisation: 'ALN Bodenschutz',
        notice: null,
        title: 'Fruchtfolgeflächen (FFF)',
        keywords: ['Fruchtfolgeflächen', '(FFF)', 'bvv', 'boden', 'TBAK2', 'fsla', 'fabo', 'vp', 'fap'],
        opacity: 1,
        layers: [
          {
            id: 157886,
            layer: 'fff',
            title: 'Fruchtfolgeflächen',
            queryable: true,
            uuid: '0aa893ad-c264-ce46-bf1f-6fa785998b8c',
            groupTitle: 'Fruchtfolgeflächen',
            minScale: 1,
            maxScale: 50000,
            wmsSort: 2,
            tocSort: 200,
            initiallyVisible: true,
            visible: true,
            isHidden: false,
          },
          {
            id: 157885,
            layer: 'perimeter-fff',
            title: 'Fruchtfolgeflächen',
            queryable: true,
            uuid: '0aa893ad-c264-ce46-bf1f-6fa785998b8c',
            groupTitle: 'Fruchtfolgeflächen',
            minScale: 50000,
            maxScale: 500000,
            wmsSort: 1,
            tocSort: 100,
            initiallyVisible: true,
            visible: true,
            isHidden: false,
          },
        ],
      },
      {
        id: 'AVfarbigZH',
        uuid: '26d7c027-38f2-42cb-a17a-99f17a2e383e',
        printTitle: 'Amtliche Vermessung in Farbe',
        gb2Url: null,
        icon: 'https://maps.zh.ch/images/custom/themekl-avfarbigzh.gif',
        wmsUrl: 'https://maps.zh.ch/wms/AVfarbigZH',
        minScale: 100,
        organisation: 'ARE Geoinformation',
        notice: null,
        title: 'Amtliche Vermessung in Farbe',
        keywords: ['Amtliche', 'Vermessung', 'in', 'Farbe', 'pk', 'Amtlichen Vermessung', 'AV'],
        opacity: 1,
        layers: [
          {
            id: 151493,
            layer: 'liegensch-einzelobj',
            title: 'Einzelobjekte (Flächen) innerhalb Liegenschaften',
            queryable: true,
            uuid: null,
            groupTitle: null,
            minScale: 99,
            maxScale: 2500,
            wmsSort: 49,
            tocSort: 4900,
            initiallyVisible: true,
            visible: true,
            isHidden: false,
          },
          {
            id: 151492,
            layer: 'TBBP',
            title: 'Hoheitsgrenzpunkte',
            queryable: true,
            uuid: '1466f09e-702d-7b38-053c-7b85f8e82549',
            groupTitle: 'Hoheitsgrenzen',
            minScale: 99,
            maxScale: 1000,
            wmsSort: 47,
            tocSort: 9099,
            initiallyVisible: true,
            visible: true,
            isHidden: false,
          },
          {
            id: 151491,
            layer: 'av-fixpunkte-nummern',
            title: 'Fixpunkte Nummern',
            queryable: false,
            uuid: '75fe4385-de51-3588-40e2-be8575166f2a',
            groupTitle: 'Fixpunkte',
            minScale: 99,
            maxScale: 1000,
            wmsSort: 46,
            tocSort: 9089,
            initiallyVisible: true,
            visible: true,
            isHidden: false,
          },
        ],
        searchConfigurations: [
          {
            index: 'gvz',
            title: 'GVZ-Nr.',
          },
        ],
      },
      {
        id: 'StatGebAlterZH',
        uuid: '246fe226-ead7-4f91-b735-d294994913e0',
        printTitle: 'Gebäudealter',
        gb2Url: null,
        icon: 'https://maps.zh.ch/images/custom/themekl-statgebalterzh.gif',
        wmsUrl: 'https://maps.zh.ch/wms/StatGebAlterZH',
        minScale: null,
        organisation: 'Statistisches Amt',
        notice: null,
        title: 'Gebäudealter',
        keywords: ['Gebäudealter', 'stat', 'obs', 'fap', 'denkk', 'fsla'],
        opacity: 1,
        layers: [
          {
            id: 160331,
            layer: 'geb-alter_2',
            title: 'Gebäude mit Baujahr x und älter',
            queryable: false,
            uuid: null,
            groupTitle: 'Gebäudealter',
            minScale: 100001,
            maxScale: 15000001,
            wmsSort: 11,
            tocSort: 1100,
            initiallyVisible: true,
            visible: true,
            isHidden: false,
          },
          {
            id: 160330,
            layer: 'geb-alter_grau',
            title: 'Baujahr',
            queryable: false,
            uuid: null,
            groupTitle: 'Gebäudealter - Polygone',
            minScale: 1,
            maxScale: 100000,
            wmsSort: 10,
            tocSort: 1000,
            initiallyVisible: false,
            visible: false,
            isHidden: false,
          },
          {
            id: 160329,
            layer: 'geb-alter_wohnen',
            title: 'Baujahr',
            queryable: true,
            uuid: null,
            groupTitle: 'Gebäudealter - Polygone',
            minScale: 1,
            maxScale: 100000,
            wmsSort: 9,
            tocSort: 900,
            initiallyVisible: true,
            visible: true,
            isHidden: false,
          },
        ],
        timeSliderConfiguration: {
          name: 'Aktueller Gebäudebestand nach Baujahr',
          alwaysMaxRange: false,
          dateFormat: 'YYYY',
          description: 'Gebäude bis 2020',
          maximumDate: '2020',
          minimumDate: '1000',
          minimalRange: 'P1Y',
          sourceType: 'parameter',
          source: {
            startRangeParameter: 'FILTER_VON',
            endRangeParameter: 'FILTER_BIS',
            layerIdentifiers: ['geb-alter_wohnen', 'geb-alter_grau', 'geb-alter_2'],
          },
        },
        filterConfigurations: [
          {
            name: 'Anzeigeoptionen nach Hauptnutzung',
            parameter: 'FILTER_GEBART',
            filterValues: [
              {
                isActive: true,
                values: ['Gebäude Wohnen'],
                name: 'Wohnen',
              },
              {
                isActive: false,
                values: ['Gebäude Wohnen'],
                name: 'Gewerbe und Verwaltung',
              },
              {
                isActive: false,
                values: ['Gebäude Wohnen'],
                name: 'Andere',
              },
            ],
          },
        ],
      },
      {
        id: 'Lidar2021BefliegungZH',
        uuid: '1dac9be1-1412-45dd-a1dd-c151c737272b',
        printTitle: 'LiDAR-Befliegung 2021 ZH',
        gb2Url: null,
        icon: 'https://maps.zh.ch/images/custom/themekl-lidar2021befliegungzh.gif',
        wmsUrl: 'https://maps.zh.ch/wms/Lidar2021BefliegungZH',
        minScale: null,
        organisation: 'ARE Geoinformation',
        notice:
          'Die kantonale LiDAR-Befliegungen sind die Basis für die Berechnung der Höhemodelle und decken den ganzen Kanton ab. Diese Karte zeigt die abgedeckte Fläche jeder aufgenommenen Überfliegung, die während dem Projekt stattgefunden hat. Die Überlappung der Flächen wird benötigt, um die einzelnen Streifen zusammenführen zu können und eine höhere Genauigkeit zu erhalten.',
        title: 'LiDAR-Befliegung 2021 ZH',
        keywords: ['LiDAR-Befliegung', '2021', 'ZH'],
        opacity: 1,
        layers: [
          {
            id: 159533,
            layer: 'lidarbefliegung',
            title: 'LiDAR-Befliegung',
            queryable: true,
            uuid: '10b88da3-3715-44f5-9480-eb754955a892',
            groupTitle: 'Inventar',
            minScale: 1,
            maxScale: 1000000,
            wmsSort: 0,
            tocSort: 0,
            initiallyVisible: true,
            visible: true,
            isHidden: false,
          },
        ],
      },
    ];

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      service['availableMaps'] = availableMaps;
    });

    it('converts the given active map item configurations to active map items', () => {
      const activeMapItemConfigurations: ActiveMapItemConfiguration[] = [
        {
          id: 'FaBoFFFZH_fff',
          mapId: 'FaBoFFFZH',
          layers: [
            {
              id: 157886,
              layer: 'fff',
              visible: true,
            },
          ],
          opacity: 1,
          visible: true,
          isSingleLayer: true,
          attributeFilters: undefined,
          timeExtent: undefined,
        },
        {
          id: 'StatGebAlterZH',
          mapId: 'StatGebAlterZH',
          layers: [
            {
              id: 160331,
              layer: 'geb-alter_2',
              visible: true,
            },
            {
              id: 160330,
              layer: 'geb-alter_grau',
              visible: false,
            },
            {
              id: 160329,
              layer: 'geb-alter_wohnen',
              visible: true,
            },
          ],
          opacity: 0.71,
          visible: true,
          isSingleLayer: false,
          attributeFilters: [
            {
              parameter: 'FILTER_GEBART',
              name: 'Anzeigeoptionen nach Hauptnutzung',
              activeFilters: [
                {
                  name: 'Wohnen',
                  isActive: true,
                },
                {
                  name: 'Gewerbe und Verwaltung',
                  isActive: false,
                },
                {
                  name: 'Andere',
                  isActive: false,
                },
              ],
            },
          ],
          timeExtent: {
            start: TimeExtentUtils.getUTCDate('1000-01-01T00:00:00.000Z'),
            end: TimeExtentUtils.getUTCDate('2020-01-01T00:00:00.000Z'),
          },
        },
        {
          id: 'AVfarbigZH',
          mapId: 'AVfarbigZH',
          layers: [
            {
              id: 151493,
              layer: 'liegensch-einzelobj',
              visible: false,
            },
            {
              id: 151492,
              layer: 'TBBP',
              visible: false,
            },
            {
              id: 151491,
              layer: 'av-fixpunkte-nummern',
              visible: true,
            },
          ],
          opacity: 1,
          visible: false,
          isSingleLayer: false,
          timeExtent: undefined,
          attributeFilters: undefined,
        },
      ];

      const actual = service.getActiveMapItemsForFavourite(activeMapItemConfigurations, false);
      const expected: ActiveMapItem[] = [
        ActiveMapItemFactory.createGb2WmsMapItem(availableMaps[0], availableMaps[0].layers[0], true, 1),
        ActiveMapItemFactory.createGb2WmsMapItem(availableMaps[2], undefined, true, 0.71),
        ActiveMapItemFactory.createGb2WmsMapItem(
          {
            ...availableMaps[1],
            layers: [
              {...availableMaps[1].layers[0], visible: false},
              {...availableMaps[1].layers[1], visible: false},
              {...availableMaps[1].layers[2], visible: true},
            ],
          },
          undefined,
          false,
          1,
        ),
      ];

      expect(actual).toEqual(expected);
    });

    it('throws an "FavouriteIsInvalid" if a map is missing', () => {
      const activeMapItemConfigurations: ActiveMapItemConfiguration[] = [
        {
          id: 'missing_id',
          mapId: 'missing_map_id',
          layers: [],
          opacity: 1,
          visible: true,
          isSingleLayer: false,
          attributeFilters: undefined,
          timeExtent: undefined,
        },
      ];

      const expectedError = new FavouriteIsInvalid(`Die Karte '${activeMapItemConfigurations[0].mapId}' existiert nicht (mehr).`);

      expect(() => service.getActiveMapItemsForFavourite(activeMapItemConfigurations, false)).toThrow(expectedError);
    });

    it('returns a list where all missing maps are skipped if "ignoreErrors" is true', () => {
      const activeMapItemConfigurations: ActiveMapItemConfiguration[] = [
        {
          id: 'missing_id',
          mapId: 'missing_map_id',
          layers: [],
          opacity: 1,
          visible: true,
          isSingleLayer: false,
          attributeFilters: undefined,
          timeExtent: undefined,
        },
        {
          id: 'FaBoFFFZH_fff',
          mapId: 'FaBoFFFZH',
          layers: [
            {
              id: 157886,
              layer: 'fff',
              visible: true,
            },
          ],
          opacity: 1,
          visible: true,
          isSingleLayer: true,
          attributeFilters: undefined,
          timeExtent: undefined,
        },
        {
          id: 'StatGebAlterZH',
          mapId: 'StatGebAlterZH',
          layers: [
            {
              id: 160331,
              layer: 'geb-alter_2',
              visible: true,
            },
            {
              id: 160330,
              layer: 'geb-alter_grau',
              visible: false,
            },
            {
              id: 160329,
              layer: 'geb-alter_wohnen',
              visible: true,
            },
          ],
          opacity: 0.71,
          visible: true,
          isSingleLayer: false,
          attributeFilters: [
            {
              parameter: 'FILTER_GEBART',
              name: 'Anzeigeoptionen nach Hauptnutzung',
              activeFilters: [
                {
                  name: 'Wohnen',
                  isActive: true,
                },
                {
                  name: 'Gewerbe und Verwaltung',
                  isActive: false,
                },
                {
                  name: 'Andere',
                  isActive: false,
                },
              ],
            },
          ],
          timeExtent: {
            start: TimeExtentUtils.getUTCDate('1000-01-01T00:00:00.000Z'),
            end: TimeExtentUtils.getUTCDate('2020-01-01T00:00:00.000Z'),
          },
        },
      ];

      const actual = service.getActiveMapItemsForFavourite(activeMapItemConfigurations, true);
      const expected: ActiveMapItem[] = [
        ActiveMapItemFactory.createGb2WmsMapItem(availableMaps[0], availableMaps[0].layers[0], true, 1),
        ActiveMapItemFactory.createGb2WmsMapItem(availableMaps[2], undefined, true, 0.71),
      ];

      expect(actual).toEqual(expected);
    });

    it('throws an "FavouriteIsInvalid" if a single layer is missing', () => {
      const activeMapItemConfigurations: ActiveMapItemConfiguration[] = [
        {
          id: 'AVfarbigZH_missing_layer',
          mapId: 'AVfarbigZH',
          layers: [
            {
              id: 1337,
              layer: 'missing_layer',
              visible: true,
            },
          ],
          opacity: 1,
          visible: true,
          isSingleLayer: true,
          timeExtent: undefined,
          attributeFilters: undefined,
        },
      ];

      const expectedError = new FavouriteIsInvalid(`Der Layer '${activeMapItemConfigurations[0].layers[0].layer}' existiert nicht (mehr).`);

      expect(() => service.getActiveMapItemsForFavourite(activeMapItemConfigurations, false)).toThrow(expectedError);
    });

    it('returns a list where all missing single layers are skipped if "ignoreErrors" is true', () => {
      const activeMapItemConfigurations: ActiveMapItemConfiguration[] = [
        {
          id: 'AVfarbigZH_missing_layer',
          mapId: 'AVfarbigZH',
          layers: [
            {
              id: 1337,
              layer: 'missing_layer',
              visible: true,
            },
          ],
          opacity: 1,
          visible: true,
          isSingleLayer: true,
          timeExtent: undefined,
          attributeFilters: undefined,
        },
        {
          id: 'FaBoFFFZH_fff',
          mapId: 'FaBoFFFZH',
          layers: [
            {
              id: 157886,
              layer: 'fff',
              visible: true,
            },
          ],
          opacity: 1,
          visible: true,
          isSingleLayer: true,
          timeExtent: undefined,
          attributeFilters: undefined,
        },
        {
          id: 'StatGebAlterZH',
          mapId: 'StatGebAlterZH',
          layers: [
            {
              id: 160331,
              layer: 'geb-alter_2',
              visible: true,
            },
            {
              id: 160330,
              layer: 'geb-alter_grau',
              visible: false,
            },
            {
              id: 160329,
              layer: 'geb-alter_wohnen',
              visible: true,
            },
          ],
          opacity: 0.71,
          visible: true,
          isSingleLayer: false,
          attributeFilters: [
            {
              parameter: 'FILTER_GEBART',
              name: 'Anzeigeoptionen nach Hauptnutzung',
              activeFilters: [
                {
                  name: 'Wohnen',
                  isActive: true,
                },
                {
                  name: 'Gewerbe und Verwaltung',
                  isActive: false,
                },
                {
                  name: 'Andere',
                  isActive: false,
                },
              ],
            },
          ],
          timeExtent: {
            start: TimeExtentUtils.getUTCDate('1000-01-01T00:00:00.000Z'),
            end: TimeExtentUtils.getUTCDate('2020-01-01T00:00:00.000Z'),
          },
        },
      ];

      const actual = service.getActiveMapItemsForFavourite(activeMapItemConfigurations, true);
      const expected: ActiveMapItem[] = [
        ActiveMapItemFactory.createGb2WmsMapItem(availableMaps[0], availableMaps[0].layers[0], true, 1),
        ActiveMapItemFactory.createGb2WmsMapItem(availableMaps[2], undefined, true, 0.71),
      ];

      expect(actual).toEqual(expected);
    });
  });

  describe('deleteFavourite', () => {
    it('calls the Gb3FavouritesService.deleteFavourite using the given favourite', (done: DoneFn) => {
      const favourite = {id: 'a'} as Favourite;
      const gb3FavouritesServiceSpy = spyOn(gb3FavouritesService, 'deleteFavourite').and.returnValue(of(void 0));

      service.deleteFavourite(favourite).subscribe(() => {
        expect(gb3FavouritesServiceSpy).toHaveBeenCalledOnceWith(favourite);
        done();
      });
    });
  });

  describe('getDrawingsForFavourite', () => {
    it('converts the given vector layers to active map items and drawing representations', () => {
      const drawings: Gb3VectorLayer = {
        type: 'Vector',
        styles: {
          '3241409f-747b-4397-a829-037a0202083a': {
            type: 'text',
            label: '[text]',
            fontSize: '12',
            fontColor: '#00fbff',
            haloColor: '#ffffff',
            fontFamily: 'sans-serif',
            haloRadius: '1',
            labelAlign: 'ct',
            labelYOffset: '6',
          },
          '7273f5c3-58e9-429a-82f3-d49ea8730f5b': {
            type: 'polygon',
            fillColor: '#1e00ff',
            fillOpacity: 0.3,
            strokeColor: '#c8ff00',
            strokeWidth: 11,
            strokeOpacity: 1,
          },
          'c65f3e07-a99f-4417-bc92-f7b938c558ba': {
            type: 'line',
            strokeColor: '#ff0000',
            strokeWidth: 2,
            strokeOpacity: 1,
          },
        },
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [2681690.1092337556, 1249147.0201337899],
                    [2681624.6936584446, 1248999.1240504778],
                    [2681690.1092337556, 1249147.0201337899],
                  ],
                ],
              },
              properties: {
                id: 'e3f511b7-ffdc-44bc-af12-8ddf0b5cfd16',
                style: '7273f5c3-58e9-429a-82f3-d49ea8730f5b',
              },
            },
            {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [
                  [2681739.881954101, 1249299.1824502745],
                  [2681462.5767978905, 1248872.559133028],
                ],
              },
              properties: {
                id: 'a28d0209-8203-4715-9abe-3761bae66354',
                style: 'c65f3e07-a99f-4417-bc92-f7b938c558ba',
              },
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [2681505.876779236, 1249212.4326835154],
                    [2681505.1220329115, 1249226.8341012998],
                    [2681505.876779236, 1249212.4326835154],
                  ],
                ],
              },
              properties: {
                id: '57ecf144-aad4-4e7d-9600-ff8a108b94a9',
                style: '7273f5c3-58e9-429a-82f3-d49ea8730f5b',
              },
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [2681895.61682965, 1249290.6357357549],
              },
              properties: {
                id: '3e17055c-505d-43c3-981a-0b89eeda8d12',
                text: 'Test text',
                style: '3241409f-747b-4397-a829-037a0202083a',
              },
            },
          ],
        },
      };
      const measurements: Gb3VectorLayer = {
        type: 'Vector',
        styles: {
          '6b36dba4-d168-4565-9468-ffb5b3e93a2a': {
            type: 'text',
            label: '[text]',
            fontSize: '12',
            fontColor: '#ff0000',
            haloColor: '#ffffff',
            fontFamily: 'sans-serif',
            haloRadius: '1',
            labelAlign: 'ct',
            labelYOffset: '6',
          },
          '8bcd01df-e5a0-45a5-933f-5ae9abd66253': {
            type: 'point',
            fillColor: '#ff0000',
            fillOpacity: 1,
            pointRadius: 5,
            strokeColor: '#ffffff',
            strokeWidth: 1,
            strokeOpacity: 1,
          },
        },
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [2681612.663967911, 1249387.3231457963],
              },
              properties: {
                id: '27468688-3e9e-4147-8d13-fa50fd4d0a1b',
                style: '8bcd01df-e5a0-45a5-933f-5ae9abd66253',
              },
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [2681612.663967911, 1249387.3231457963],
              },
              properties: {
                id: 'ba9bb1d5-bfb3-48b6-bddf-608625e7657f',
                text: '2681612.66/1249387.32',
                style: '6b36dba4-d168-4565-9468-ffb5b3e93a2a',
                belongsTo: '27468688-3e9e-4147-8d13-fa50fd4d0a1b',
              },
            },
          ],
        },
      };
      const converterSpy = spyOn(SymbolizationToGb3ConverterUtils, 'convertExternalToInternalRepresentation').and.callFake(
        (gb3VectorLayer: Gb3VectorLayer, source: UserDrawingLayer) => {
          return [
            {
              id: `id_${gb3VectorLayer.geojson.features.length}_${source}`,
            } as Gb3StyledInternalDrawingRepresentation,
          ];
        },
      );

      const actual = service.getDrawingsForFavourite(drawings, measurements);
      const expected: {drawingsToAdd: Gb3StyledInternalDrawingRepresentation[]; drawingActiveMapItems: DrawingActiveMapItem[]} = {
        drawingsToAdd: [
          {id: 'id_2_measurements'} as Gb3StyledInternalDrawingRepresentation,
          {id: 'id_4_drawings'} as Gb3StyledInternalDrawingRepresentation,
        ],
        drawingActiveMapItems: [
          ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Measurements, MapConstants.USER_DRAWING_LAYER_PREFIX, true, 1),
          ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Drawings, MapConstants.USER_DRAWING_LAYER_PREFIX, true, 1),
        ],
      };

      expect(actual).toEqual(expected);
      expect(converterSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('mapFavouriteFilterConfigurationsToFilterConfigurations', () => {
    it('returns the filterConfigurations with the respective flags from the FavouriteFilterConfiguration', () => {
      const attributeFilters: FavouriteFilterConfiguration[] = [
        {
          name: 'Anzeigeoptionen nach Hauptnutzung',
          parameter: 'FILTER_GEBART',
          activeFilters: [
            {name: 'Wohnen', isActive: false},
            {name: 'Gewerbe und Verwaltung', isActive: true},
            {name: 'Andere', isActive: true},
          ],
        },
      ];
      const filterConfigs: FilterConfiguration[] = [
        {
          name: 'Anzeigeoptionen nach Hauptnutzung',
          parameter: 'FILTER_GEBART',
          filterValues: [
            {name: 'Wohnen', isActive: false, values: []},
            {name: 'Gewerbe und Verwaltung', isActive: false, values: []},
            {name: 'Andere', isActive: false, values: []},
          ],
        },
      ];

      const expectedFilterConfigs: FilterConfiguration[] = [
        {
          name: 'Anzeigeoptionen nach Hauptnutzung',
          parameter: 'FILTER_GEBART',
          filterValues: [
            {name: 'Wohnen', isActive: false, values: []},
            {name: 'Gewerbe und Verwaltung', isActive: true, values: []},
            {name: 'Andere', isActive: true, values: []},
          ],
        },
      ];

      const actualFilterConfigs = service.mapFavouriteFilterConfigurationsToFilterConfigurations(
        filterConfigs,
        attributeFilters,
        'Gebäudealter',
      );
      expect(actualFilterConfigs).toEqual(expectedFilterConfigs);
    });
  });

  describe('throwErrorIfFilterConfigurationChanged', () => {
    it('throws a FavouriteIsInvalidError if the parameter in the Favourite does not exist anymore', () => {
      const attributeFilters: FavouriteFilterConfiguration[] = [
        {
          name: 'Anzeigeoptionen nach Hauptnutzung',
          parameter: 'FILTER_GEBART_OLD',
          activeFilters: [
            {name: 'Wohnen', isActive: false},
            {name: 'Gewerbe und Verwaltung', isActive: false},
            {name: 'Andere', isActive: false},
          ],
        },
      ];
      const filterConfigs: FilterConfiguration[] = [
        {
          name: 'Anzeigeoptionen nach Hauptnutzung',
          parameter: 'FILTER_GEBART',
          filterValues: [
            {name: 'Wohnen', isActive: false, values: []},
            {name: 'Gewerbe und Verwaltung', isActive: false, values: []},
            {name: 'Andere', isActive: false, values: []},
          ],
        },
      ];

      const expectedError = new FavouriteIsInvalid(
        `Die Filterkonfiguration mit dem Parameter '${attributeFilters[0].name} (${attributeFilters[0].parameter})' existiert nicht mehr auf der Karte 'Gebäudealter'.`,
      );

      expect(() => service.throwErrorIfFilterConfigurationChanged(attributeFilters, filterConfigs, 'Gebäudealter')).toThrow(expectedError);
    });
    it('throws a FavouriteIsInvalidError if the name of a Filter in the Favourite does not exist anymore', () => {
      const attributeFilters: FavouriteFilterConfiguration[] = [
        {
          name: 'Anzeigeoptionen nach Hauptnutzung',
          parameter: 'FILTER_GEBART',
          activeFilters: [
            {name: 'Wohngebäude', isActive: false},
            {name: 'Gewerbe und Verwaltung', isActive: false},
            {name: 'Andere', isActive: false},
          ],
        },
      ];
      const filterConfigs: FilterConfiguration[] = [
        {
          name: 'Anzeigeoptionen nach Hauptnutzung',
          parameter: 'FILTER_GEBART',
          filterValues: [
            {name: 'Wohnen', isActive: false, values: []},
            {name: 'Gewerbe und Verwaltung', isActive: false, values: []},
            {name: 'Andere', isActive: false, values: []},
          ],
        },
      ];

      const expectedError = new FavouriteIsInvalid(
        `Der Filter mit dem Namen 'Wohngebäude' existiert nicht mehr in der Filterkonfiguration '${attributeFilters[0].name}' der Karte 'Gebäudealter'.`,
      );

      expect(() => service.throwErrorIfFilterConfigurationChanged(attributeFilters, filterConfigs, 'Gebäudealter')).toThrow(expectedError);
    });
    it('throws a FavouriteIsInvalidError if a new filterConfiguration has been added', () => {
      const attributeFilters: FavouriteFilterConfiguration[] = [
        {
          name: 'Anzeigeoptionen nach Hauptnutzung',
          parameter: 'FILTER_GEBART',
          activeFilters: [
            {name: 'Wohnen', isActive: false},
            {name: 'Gewerbe und Verwaltung', isActive: false},
            {name: 'Andere', isActive: false},
          ],
        },
      ];
      const filterConfigs: FilterConfiguration[] = [
        {
          name: 'Anzeigeoptionen nach Hauptnutzung',
          parameter: 'FILTER_GEBART',
          filterValues: [
            {name: 'Wohnen', isActive: false, values: []},
            {name: 'Gewerbe und Verwaltung', isActive: false, values: []},
            {name: 'Andere', isActive: false, values: []},
          ],
        },
        {
          name: 'Anzeigeoptionen nach Hauptnutzung 2',
          parameter: 'FILTER_GEBART_2',
          filterValues: [
            {name: 'Wohnen', isActive: false, values: []},
            {name: 'Gewerbe und Verwaltung', isActive: false, values: []},
            {name: 'Andere', isActive: false, values: []},
          ],
        },
      ];

      const expectedError = new FavouriteIsInvalid(
        `Eine neue Filterkonfiguration mit dem Parameter '${filterConfigs[1].name} (${filterConfigs[1].parameter})' wurde zur Karte 'Gebäudealter' hinzugefügt.`,
      );

      expect(() => service.throwErrorIfFilterConfigurationChanged(attributeFilters, filterConfigs, 'Gebäudealter')).toThrow(expectedError);
    });
    it('throws a FavouriteIsInvalidError if a new filter has been added', () => {
      const attributeFilters: FavouriteFilterConfiguration[] = [
        {
          name: 'Anzeigeoptionen nach Hauptnutzung',
          parameter: 'FILTER_GEBART',
          activeFilters: [
            {name: 'Wohnen', isActive: false},
            {name: 'Gewerbe und Verwaltung', isActive: false},
            {name: 'Andere', isActive: false},
          ],
        },
      ];
      const filterConfigs: FilterConfiguration[] = [
        {
          name: 'Anzeigeoptionen nach Hauptnutzung',
          parameter: 'FILTER_GEBART',
          filterValues: [
            {name: 'Wohnen', isActive: false, values: []},
            {name: 'Gewerbe und Verwaltung', isActive: false, values: []},
            {name: 'Andere', isActive: false, values: []},
            {name: 'Sonstige', isActive: false, values: []},
          ],
        },
      ];

      const expectedError = new FavouriteIsInvalid(
        `Ein neuer Filter mit dem Namen '${filterConfigs[0].filterValues[3].name}' wurde zur Filterkonfiguration '${filterConfigs[0].name}' der Karte 'Gebäudealter' hinzugefügt.`,
      );

      expect(() => service.throwErrorIfFilterConfigurationChanged(attributeFilters, filterConfigs, 'Gebäudealter')).toThrow(expectedError);
    });
  });
  describe('throwErrorIfTimeSliderInvalid', () => {
    it('throws a FavouriteIsInvalidError if the timeSliderConfiguration for a parameter configuration is invalid', () => {
      const timeExtent: TimeExtent = {
        start: TimeExtentUtils.getUTCDate('0999-01-01T00:00:00.000Z'),
        end: TimeExtentUtils.getUTCDate('2020-01-01T00:00:00.000Z'),
      };
      const timeSliderConfiguration: TimeSliderConfiguration = {
        name: 'Aktueller Gebäudebestand nach Baujahr',
        dateFormat: 'YYYY',
        minimumDate: '1000',
        maximumDate: '2020',
        alwaysMaxRange: false,
        sourceType: 'parameter',
        source: {
          endRangeParameter: 'FILTER_BIS',
          startRangeParameter: 'FILTER_VON',
          layerIdentifiers: ['geb-alter_wohnen', 'geb-alter_grau', 'geb-alter_2'],
        },
      };

      const expectedError = new FavouriteIsInvalid(`Die Timeslider-Konfiguration der Karte 'Gebäudealter' ist ungültig.`);

      expect(() => service.throwErrorIfTimeSliderInvalid(timeSliderConfiguration, timeExtent, 'Gebäudealter')).toThrow(expectedError);
    });
    it('throws a FavouriteIsInvalidError if the timeSliderConfiguration for a layer configuration is invalid', () => {
      const timeExtent: TimeExtent = {
        start: TimeExtentUtils.getUTCDate('2016-01-01T00:00:00.000Z'),
        end: TimeExtentUtils.getUTCDate('2020-01-01T00:00:00.000Z'),
      };
      const timeSliderConfiguration: TimeSliderConfiguration = {
        name: 'Jahr',
        dateFormat: 'YYYY',
        minimumDate: '2014',
        maximumDate: '2021',
        alwaysMaxRange: false,
        sourceType: 'layer',
        source: {
          layers: [
            {date: '2014', layerName: 'ortho_2014'},
            {date: '2015', layerName: 'ortho_2015'},
            {date: '2018', layerName: 'ortho_2018'},
            {date: '2020', layerName: 'ortho_2020'},
            {date: '2021', layerName: 'ortho_2021'},
          ],
        },
      };

      const expectedError = new FavouriteIsInvalid(`Die Timeslider-Konfiguration der Karte 'Orthofoto' ist ungültig.`);
      expect(() => service.throwErrorIfTimeSliderInvalid(timeSliderConfiguration, timeExtent, 'Orthofoto')).toThrow(expectedError);
    });
  });
});
