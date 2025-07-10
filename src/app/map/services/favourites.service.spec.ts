import {TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {FavouritesService} from './favourites.service';
import {provideHttpClientTesting} from '@angular/common/http/testing';
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
import {DrawingLayerPrefix, UserDrawingLayer} from '../../shared/enums/drawing-layer.enum';
import {SymbolizationToGb3ConverterUtils} from '../../shared/utils/symbolization-to-gb3-converter.utils';
import {Map} from '../../shared/interfaces/topic.interface';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {TimeService} from '../../shared/interfaces/time-service.interface';
import {TimeSliderService} from './time-slider.service';
import {TIME_SERVICE} from '../../app.tokens';

describe('FavouritesService', () => {
  let service: FavouritesService;
  let store: MockStore;
  let gb3FavouritesService: Gb3FavouritesService;
  let timeService: TimeService;
  let timeSliderService: TimeSliderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideMockStore({}), provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    });
    store = TestBed.inject(MockStore);
    timeService = TestBed.inject(TIME_SERVICE);
    timeSliderService = TestBed.inject(TimeSliderService);
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
    let availableMaps: Map[];

    beforeEach(() => {
      availableMaps = [
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
          timeSliderConfiguration: undefined,
          initialTimeSliderExtent: undefined,
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
          timeSliderConfiguration: undefined,
          initialTimeSliderExtent: undefined,
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
          initialTimeSliderExtent: {
            start: timeService.createUTCDateFromString('1000-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2020-01-01T00:00:00.000Z'),
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
          timeSliderConfiguration: undefined,
          initialTimeSliderExtent: undefined,
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
              visible: true,
              isHidden: false,
            },
          ],
        },
      ];
      service['availableMaps'] = availableMaps; // eslint-disable-line @typescript-eslint/dot-notation -- Private property access
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
            start: timeService.createUTCDateFromString('1000-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2020-01-01T00:00:00.000Z'),
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
            start: timeService.createUTCDateFromString('1000-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2020-01-01T00:00:00.000Z'),
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
            start: timeService.createUTCDateFromString('1000-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2020-01-01T00:00:00.000Z'),
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

    it('returns the filterConfigurations with the respective flags from the FavouriteFilterConfiguration', () => {
      const activeMapItemConfigurations: ActiveMapItemConfiguration[] = [
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
                  isActive: true,
                },
                {
                  name: 'Andere',
                  isActive: true,
                },
              ],
            },
          ],
          timeExtent: {
            start: timeService.createUTCDateFromString('1000-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2020-01-01T00:00:00.000Z'),
          },
        },
      ];
      const updatedFilterConfigurations = [
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
              isActive: true,
              values: ['Gebäude Wohnen'],
              name: 'Gewerbe und Verwaltung',
            },
            {
              isActive: true,
              values: ['Gebäude Wohnen'],
              name: 'Andere',
            },
          ],
        },
      ];

      const actual = service.getActiveMapItemsForFavourite(activeMapItemConfigurations, false);
      const expected: ActiveMapItem[] = [
        ActiveMapItemFactory.createGb2WmsMapItem(
          availableMaps[2],
          undefined,
          true,
          0.71,
          activeMapItemConfigurations[0].timeExtent,
          updatedFilterConfigurations,
        ),
      ];

      expect(actual).toEqual(expected);
    });

    it('throws a FavouriteIsInvalidError if the parameter in the Favourite does not exist anymore', () => {
      const activeMapItemConfigurations: ActiveMapItemConfiguration[] = [
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
              parameter: 'FILTER_GEBART_OLD',
              name: 'Anzeigeoptionen nach Hauptnutzung',
              activeFilters: [
                {
                  name: 'Wohnen',
                  isActive: true,
                },
                {
                  name: 'Gewerbe und Verwaltung',
                  isActive: true,
                },
                {
                  name: 'Andere',
                  isActive: true,
                },
              ],
            },
          ],
          timeExtent: {
            start: timeService.createUTCDateFromString('1000-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2020-01-01T00:00:00.000Z'),
          },
        },
      ];

      const expectedError = new FavouriteIsInvalid(
        `Die Filterkonfiguration mit dem Parameter 'Anzeigeoptionen nach Hauptnutzung (FILTER_GEBART_OLD)' existiert nicht mehr auf der Karte 'Gebäudealter'.`,
      );

      expect(() => service.getActiveMapItemsForFavourite(activeMapItemConfigurations, false)).toThrow(expectedError);
    });

    it('throws a FavouriteIsInvalidError if the name of a Filter in the Favourite does not exist anymore', () => {
      const activeMapItemConfigurations: ActiveMapItemConfiguration[] = [
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
                  name: 'Wohngebäude',
                  isActive: true,
                },
                {
                  name: 'Gewerbe und Verwaltung',
                  isActive: true,
                },
                {
                  name: 'Andere',
                  isActive: true,
                },
              ],
            },
          ],
          timeExtent: {
            start: timeService.createUTCDateFromString('1000-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2020-01-01T00:00:00.000Z'),
          },
        },
      ];

      const expectedError = new FavouriteIsInvalid(
        `Der Filter mit dem Namen 'Wohngebäude' existiert nicht mehr in der Filterkonfiguration 'Anzeigeoptionen nach Hauptnutzung' der Karte 'Gebäudealter'.`,
      );

      expect(() => service.getActiveMapItemsForFavourite(activeMapItemConfigurations, false)).toThrow(expectedError);
    });

    it('throws a FavouriteIsInvalidError if a new filterConfiguration has been added', () => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      service['availableMaps'] = [
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
          initialTimeSliderExtent: {
            start: timeService.createUTCDateFromString('1000-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2020-01-01T00:00:00.000Z'),
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
            {
              name: 'Anzeigeoptionen nach Hauptnutzung neu',
              parameter: 'FILTER_GEBART_2',
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
      ];
      const activeMapItemConfigurations: ActiveMapItemConfiguration[] = [
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
                  isActive: true,
                },
                {
                  name: 'Andere',
                  isActive: true,
                },
              ],
            },
          ],
          timeExtent: {
            start: timeService.createUTCDateFromString('1000-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2020-01-01T00:00:00.000Z'),
          },
        },
      ];

      const expectedError = new FavouriteIsInvalid(
        `Eine neue Filterkonfiguration mit dem Parameter 'Anzeigeoptionen nach Hauptnutzung neu (FILTER_GEBART_2)' wurde zur Karte 'Gebäudealter' hinzugefügt.`,
      );

      expect(() => service.getActiveMapItemsForFavourite(activeMapItemConfigurations, false)).toThrow(expectedError);
    });

    it('throws a FavouriteIsInvalidError if a new filter has been added', () => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      service['availableMaps'] = [
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
          initialTimeSliderExtent: {
            start: timeService.createUTCDateFromString('1000-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2020-01-01T00:00:00.000Z'),
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
                {name: 'Sonstige', isActive: false, values: []},
              ],
            },
          ],
        },
      ];
      const activeMapItemConfigurations: ActiveMapItemConfiguration[] = [
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
                  isActive: true,
                },
                {
                  name: 'Andere',
                  isActive: true,
                },
              ],
            },
          ],
          timeExtent: {
            start: timeService.createUTCDateFromString('1000-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2020-01-01T00:00:00.000Z'),
          },
        },
      ];

      const expectedError = new FavouriteIsInvalid(
        `Ein neuer Filter mit dem Namen 'Sonstige' wurde zur Filterkonfiguration 'Anzeigeoptionen nach Hauptnutzung' der Karte 'Gebäudealter' hinzugefügt.`,
      );

      expect(() => service.getActiveMapItemsForFavourite(activeMapItemConfigurations, false)).toThrow(expectedError);
    });

    it('throws a FavouriteIsInvalidError if the timeSliderConfiguration for a parameter configuration is invalid (start < minimumDate)', () => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      service['availableMaps'] = [
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
          initialTimeSliderExtent: {
            start: timeService.createUTCDateFromString('1000-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2020-01-01T00:00:00.000Z'),
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
      ];
      const activeMapItemConfigurations: ActiveMapItemConfiguration[] = [
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
                  isActive: true,
                },
                {
                  name: 'Andere',
                  isActive: true,
                },
              ],
            },
          ],
          timeExtent: {
            start: timeService.createUTCDateFromString('0999-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2020-01-01T00:00:00.000Z'),
          },
        },
      ];

      const expectedError = new FavouriteIsInvalid(`Die Konfiguration für den Zeitschieberegler der Karte 'Gebäudealter' ist ungültig.`);

      expect(() => service.getActiveMapItemsForFavourite(activeMapItemConfigurations, false)).toThrow(expectedError);
    });

    it('throws a FavouriteIsInvalidError if the timeSliderConfiguration for a parameter configuration is invalid (range to small)', () => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      service['availableMaps'] = [
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
            minimalRange: 'P10Y',
            sourceType: 'parameter',
            source: {
              startRangeParameter: 'FILTER_VON',
              endRangeParameter: 'FILTER_BIS',
              layerIdentifiers: ['geb-alter_wohnen', 'geb-alter_grau', 'geb-alter_2'],
            },
          },
          initialTimeSliderExtent: {
            start: timeService.createUTCDateFromString('1000-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2020-01-01T00:00:00.000Z'),
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
      ];
      const activeMapItemConfigurations: ActiveMapItemConfiguration[] = [
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
                  isActive: true,
                },
                {
                  name: 'Andere',
                  isActive: true,
                },
              ],
            },
          ],
          timeExtent: {
            start: timeService.createUTCDateFromString('1450-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('1455-01-01T00:00:00.000Z'),
          },
        },
      ];

      const expectedError = new FavouriteIsInvalid(`Die Konfiguration für den Zeitschieberegler der Karte 'Gebäudealter' ist ungültig.`);

      expect(() => service.getActiveMapItemsForFavourite(activeMapItemConfigurations, false)).toThrow(expectedError);
    });

    it('throws a FavouriteIsInvalidError if the timeSliderConfiguration for a parameter configuration is invalid (start and end date mixed up)', () => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      service['availableMaps'] = [
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
            minimalRange: 'P10Y',
            sourceType: 'parameter',
            source: {
              startRangeParameter: 'FILTER_VON',
              endRangeParameter: 'FILTER_BIS',
              layerIdentifiers: ['geb-alter_wohnen', 'geb-alter_grau', 'geb-alter_2'],
            },
          },
          initialTimeSliderExtent: {
            start: timeService.createUTCDateFromString('2020-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('1000-01-01T00:00:00.000Z'),
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
      ];
      const activeMapItemConfigurations: ActiveMapItemConfiguration[] = [
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
                  isActive: true,
                },
                {
                  name: 'Andere',
                  isActive: true,
                },
              ],
            },
          ],
          timeExtent: {
            start: timeService.createUTCDateFromString('1750-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('1455-01-01T00:00:00.000Z'),
          },
        },
      ];

      const expectedError = new FavouriteIsInvalid(`Die Konfiguration für den Zeitschieberegler der Karte 'Gebäudealter' ist ungültig.`);

      expect(() => service.getActiveMapItemsForFavourite(activeMapItemConfigurations, false)).toThrow(expectedError);
    });

    it('throws a FavouriteIsInvalidError if the timeSliderConfiguration for a parameter configuration is invalid (not max range if Flag is set)', () => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      service['availableMaps'] = [
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
              visible: true,
              isHidden: false,
            },
          ],
          timeSliderConfiguration: {
            name: 'Aktueller Gebäudebestand nach Baujahr',
            alwaysMaxRange: true,
            dateFormat: 'YYYY',
            description: 'Gebäude bis 2020',
            maximumDate: '2020',
            minimumDate: '1000',
            minimalRange: 'P10Y',
            sourceType: 'parameter',
            source: {
              startRangeParameter: 'FILTER_VON',
              endRangeParameter: 'FILTER_BIS',
              layerIdentifiers: ['geb-alter_wohnen', 'geb-alter_grau', 'geb-alter_2'],
            },
          },
          initialTimeSliderExtent: {
            start: timeService.createUTCDateFromString('1000-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2020-01-01T00:00:00.000Z'),
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
      ];
      const activeMapItemConfigurations: ActiveMapItemConfiguration[] = [
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
                  isActive: true,
                },
                {
                  name: 'Andere',
                  isActive: true,
                },
              ],
            },
          ],
          timeExtent: {
            start: timeService.createUTCDateFromString('1250-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2000-01-01T00:00:00.000Z'),
          },
        },
      ];

      const expectedError = new FavouriteIsInvalid(`Die Konfiguration für den Zeitschieberegler der Karte 'Gebäudealter' ist ungültig.`);

      expect(() => service.getActiveMapItemsForFavourite(activeMapItemConfigurations, false)).toThrow(expectedError);
    });

    it('throws a FavouriteIsInvalidError if the timeSliderConfiguration for a layer configuration is invalid', () => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      service['availableMaps'] = [
        {
          id: 'OrthoFCIRZH',
          uuid: '246fe226-ead7-4f91-b735-d294994913e0',
          printTitle: 'Orthofoto ZH FCIR 2014-2021',
          gb2Url: null,
          icon: 'https://maps.zh.ch/images/custom/themekl-orthofcirzh.gif',
          wmsUrl: 'https://maps.zh.ch/wms/OrthoFCIRZH',
          minScale: null,
          organisation: 'ARE Geoinformation',
          notice: null,
          title: 'Orthofoto',
          keywords: ['Orthofoto', 'ZH', 'FCIR', '2014-2021'],
          opacity: 1,
          layers: [
            {
              id: 159839,
              layer: 'kachelung',
              title: 'Kacheleinteilung Frühjahr aktuell (2021/22)',
              queryable: true,
              uuid: null,
              groupTitle: null,
              minScale: 1,
              maxScale: 15000000,
              wmsSort: 9,
              tocSort: 900,
              visible: true,
              isHidden: false,
            },
            {
              id: 159838,
              layer: 'kachelung_2020',
              title: 'Kacheleinteilung Sommer 2020',
              queryable: true,
              uuid: null,
              groupTitle: null,
              minScale: 1,
              maxScale: 15000000,
              wmsSort: 8,
              tocSort: 800,
              visible: false,
              isHidden: false,
            },
            {
              id: 159837,
              layer: 'kachelung_2018',
              title: 'Kacheleinteilung Sommer 2018',
              queryable: true,
              uuid: null,
              groupTitle: null,
              minScale: 1,
              maxScale: 15000000,
              wmsSort: 7,
              tocSort: 700,
              visible: false,
              isHidden: false,
            },
            {
              id: 159836,
              layer: 'kachelung_2015',
              title: 'Kacheleinteilung Frühjahr 2015/16',
              queryable: true,
              uuid: null,
              groupTitle: null,
              minScale: 1,
              maxScale: 15000000,
              wmsSort: 6,
              tocSort: 600,
              visible: false,
              isHidden: false,
            },
            {
              id: 159835,
              layer: 'kachelung_2014',
              title: 'Kacheleinteilung Sommer 2014/15',
              queryable: true,
              uuid: null,
              groupTitle: null,
              minScale: 1,
              maxScale: 15000000,
              wmsSort: 5,
              tocSort: 500,
              visible: false,
              isHidden: false,
            },
            {
              id: 159834,
              layer: 'ortho_w_fcir',
              title: 'Orthofoto ZH Frühjahr FCIR aktuell (2021/22)',
              queryable: false,
              uuid: '1af3c8b1-f78c-405f-93de-61e31a3c1f55',
              groupTitle: null,
              minScale: 1,
              maxScale: 1500000,
              wmsSort: 4,
              tocSort: 400,
              visible: true,
              isHidden: true,
            },
            {
              id: 159833,
              layer: 'ortho_s_fcir_2020',
              title: 'Orthofoto ZH Sommer FCIR 2020',
              queryable: false,
              uuid: 'd8b5e934-d153-4529-ba76-c00841831a66',
              groupTitle: null,
              minScale: 1,
              maxScale: 1500000,
              wmsSort: 3,
              tocSort: 300,
              visible: false,
              isHidden: true,
            },
            {
              id: 159832,
              layer: 'ortho_s_fcir_2018',
              title: 'Orthofoto ZH Sommer FCIR 2018',
              queryable: false,
              uuid: 'e9cc6b39-dd64-4c8e-9137-9e499e625fba',
              groupTitle: null,
              minScale: 1,
              maxScale: 1500000,
              wmsSort: 2,
              tocSort: 200,
              visible: false,
              isHidden: true,
            },
            {
              id: 159831,
              layer: 'ortho_w_fcir_2015',
              title: 'Orthofoto ZH Frühjahr FCIR 2015/16',
              queryable: false,
              uuid: '1e5e48df-e1d5-425c-b24e-f61ddc4443a7',
              groupTitle: null,
              minScale: 1,
              maxScale: 1500000,
              wmsSort: 1,
              tocSort: 100,
              visible: false,
              isHidden: true,
            },
            {
              id: 159830,
              layer: 'ortho_s_fcir_2014',
              title: 'Orthofoto ZH Sommer FCIR 2014/15',
              queryable: false,
              uuid: '7ba7b7fc-1f48-4431-b1c7-de15cc41af29',
              groupTitle: null,
              minScale: 1,
              maxScale: 1500000,
              wmsSort: 0,
              tocSort: 0,
              visible: false,
              isHidden: true,
            },
          ],
          timeSliderConfiguration: {
            name: 'Jahr',
            alwaysMaxRange: false,
            dateFormat: 'YYYY',
            description: 'Gewählte Zeitspanne',
            maximumDate: '2021',
            minimumDate: '2014',
            range: 'P1Y',
            sourceType: 'layer',
            source: {
              layers: [
                {
                  layerName: 'ortho_s_fcir_2014',
                  date: '2014',
                },
                {
                  layerName: 'ortho_w_fcir_2015',
                  date: '2015',
                },
                {
                  layerName: 'ortho_s_fcir_2018',
                  date: '2018',
                },
                {
                  layerName: 'ortho_s_fcir_2020',
                  date: '2020',
                },
                {
                  layerName: 'ortho_w_fcir',
                  date: '2021',
                },
              ],
            },
          },
          initialTimeSliderExtent: {
            start: timeService.createUTCDateFromString('2016-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2017-01-01T00:00:00.000Z'),
          },
          filterConfigurations: undefined,
        },
      ];
      const activeMapItemConfigurations: ActiveMapItemConfiguration[] = [
        {
          id: 'OrthoFCIRZH',
          mapId: 'OrthoFCIRZH',
          layers: [
            {
              id: 159839,
              layer: 'kachelung',
              visible: true,
            },
            {
              id: 159838,
              layer: 'kachelung_2020',
              visible: false,
            },
            {
              id: 159837,
              layer: 'kachelung_2018',
              visible: false,
            },
            {
              id: 159836,
              layer: 'kachelung_2015',
              visible: false,
            },
            {
              id: 159835,
              layer: 'kachelung_2014',
              visible: false,
            },
            {
              id: 159834,
              layer: 'ortho_w_fcir',
              visible: true,
            },
            {
              id: 159833,
              layer: 'ortho_s_fcir_2020',
              visible: false,
            },
            {
              id: 159832,
              layer: 'ortho_s_fcir_2018',
              visible: false,
            },
            {
              id: 159831,
              layer: 'ortho_w_fcir_2015',
              visible: false,
            },
            {
              id: 159830,
              layer: 'ortho_s_fcir_2014',
              visible: false,
            },
          ],
          opacity: 1,
          visible: true,
          isSingleLayer: false,
          attributeFilters: undefined,
          timeExtent: {
            start: timeService.createUTCDateFromString('2016-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2017-01-01T00:00:00.000Z'),
          },
        },
      ];

      const expectedError = new FavouriteIsInvalid(`Die Konfiguration für den Zeitschieberegler der Karte 'Orthofoto' ist ungültig.`);

      expect(() => service.getActiveMapItemsForFavourite(activeMapItemConfigurations, false)).toThrow(expectedError);
    });

    it('returns the initalTimsliderExtent if the timeExtent is invalid but ignoreErrors is set to true', () => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      service['availableMaps'] = [
        {
          id: 'OrthoFCIRZH',
          uuid: '246fe226-ead7-4f91-b735-d294994913e0',
          printTitle: 'Orthofoto ZH FCIR 2014-2021',
          gb2Url: null,
          icon: 'https://maps.zh.ch/images/custom/themekl-orthofcirzh.gif',
          wmsUrl: 'https://maps.zh.ch/wms/OrthoFCIRZH',
          minScale: null,
          organisation: 'ARE Geoinformation',
          notice: null,
          title: 'Orthofoto',
          keywords: ['Orthofoto', 'ZH', 'FCIR', '2014-2021'],
          opacity: 1,
          layers: [
            {
              id: 159839,
              layer: 'kachelung',
              title: 'Kacheleinteilung Frühjahr aktuell (2021/22)',
              queryable: true,
              uuid: null,
              groupTitle: null,
              minScale: 1,
              maxScale: 15000000,
              wmsSort: 9,
              tocSort: 900,
              visible: true,
              isHidden: false,
            },
            {
              id: 159838,
              layer: 'kachelung_2020',
              title: 'Kacheleinteilung Sommer 2020',
              queryable: true,
              uuid: null,
              groupTitle: null,
              minScale: 1,
              maxScale: 15000000,
              wmsSort: 8,
              tocSort: 800,
              visible: false,
              isHidden: false,
            },
            {
              id: 159837,
              layer: 'kachelung_2018',
              title: 'Kacheleinteilung Sommer 2018',
              queryable: true,
              uuid: null,
              groupTitle: null,
              minScale: 1,
              maxScale: 15000000,
              wmsSort: 7,
              tocSort: 700,
              visible: false,
              isHidden: false,
            },
            {
              id: 159836,
              layer: 'kachelung_2015',
              title: 'Kacheleinteilung Frühjahr 2015/16',
              queryable: true,
              uuid: null,
              groupTitle: null,
              minScale: 1,
              maxScale: 15000000,
              wmsSort: 6,
              tocSort: 600,
              visible: false,
              isHidden: false,
            },
            {
              id: 159835,
              layer: 'kachelung_2014',
              title: 'Kacheleinteilung Sommer 2014/15',
              queryable: true,
              uuid: null,
              groupTitle: null,
              minScale: 1,
              maxScale: 15000000,
              wmsSort: 5,
              tocSort: 500,
              visible: false,
              isHidden: false,
            },
            {
              id: 159834,
              layer: 'ortho_w_fcir',
              title: 'Orthofoto ZH Frühjahr FCIR aktuell (2021/22)',
              queryable: false,
              uuid: '1af3c8b1-f78c-405f-93de-61e31a3c1f55',
              groupTitle: null,
              minScale: 1,
              maxScale: 1500000,
              wmsSort: 4,
              tocSort: 400,
              visible: true,
              isHidden: true,
            },
            {
              id: 159833,
              layer: 'ortho_s_fcir_2020',
              title: 'Orthofoto ZH Sommer FCIR 2020',
              queryable: false,
              uuid: 'd8b5e934-d153-4529-ba76-c00841831a66',
              groupTitle: null,
              minScale: 1,
              maxScale: 1500000,
              wmsSort: 3,
              tocSort: 300,
              visible: false,
              isHidden: true,
            },
            {
              id: 159832,
              layer: 'ortho_s_fcir_2018',
              title: 'Orthofoto ZH Sommer FCIR 2018',
              queryable: false,
              uuid: 'e9cc6b39-dd64-4c8e-9137-9e499e625fba',
              groupTitle: null,
              minScale: 1,
              maxScale: 1500000,
              wmsSort: 2,
              tocSort: 200,
              visible: false,
              isHidden: true,
            },
            {
              id: 159831,
              layer: 'ortho_w_fcir_2015',
              title: 'Orthofoto ZH Frühjahr FCIR 2015/16',
              queryable: false,
              uuid: '1e5e48df-e1d5-425c-b24e-f61ddc4443a7',
              groupTitle: null,
              minScale: 1,
              maxScale: 1500000,
              wmsSort: 1,
              tocSort: 100,
              visible: false,
              isHidden: true,
            },
            {
              id: 159830,
              layer: 'ortho_s_fcir_2014',
              title: 'Orthofoto ZH Sommer FCIR 2014/15',
              queryable: false,
              uuid: '7ba7b7fc-1f48-4431-b1c7-de15cc41af29',
              groupTitle: null,
              minScale: 1,
              maxScale: 1500000,
              wmsSort: 0,
              tocSort: 0,
              visible: false,
              isHidden: true,
            },
          ],
          timeSliderConfiguration: {
            name: 'Jahr',
            alwaysMaxRange: false,
            dateFormat: 'YYYY',
            description: 'Gewählte Zeitspanne',
            maximumDate: '2021',
            minimumDate: '2014',
            range: 'P1Y',
            sourceType: 'layer',
            source: {
              layers: [
                {
                  layerName: 'ortho_s_fcir_2014',
                  date: '2014',
                },
                {
                  layerName: 'ortho_w_fcir_2015',
                  date: '2015',
                },
                {
                  layerName: 'ortho_s_fcir_2018',
                  date: '2018',
                },
                {
                  layerName: 'ortho_s_fcir_2020',
                  date: '2020',
                },
                {
                  layerName: 'ortho_w_fcir',
                  date: '2021',
                },
              ],
            },
          },
          initialTimeSliderExtent: {
            start: timeService.createUTCDateFromString('2014-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2021-01-01T00:00:00.000Z'),
          },
          filterConfigurations: undefined,
        },
      ];
      const activeMapItemConfigurations: ActiveMapItemConfiguration[] = [
        {
          id: 'OrthoFCIRZH',
          mapId: 'OrthoFCIRZH',
          layers: [
            {
              id: 159839,
              layer: 'kachelung',
              visible: true,
            },
            {
              id: 159838,
              layer: 'kachelung_2020',
              visible: false,
            },
            {
              id: 159837,
              layer: 'kachelung_2018',
              visible: false,
            },
            {
              id: 159836,
              layer: 'kachelung_2015',
              visible: false,
            },
            {
              id: 159835,
              layer: 'kachelung_2014',
              visible: false,
            },
            {
              id: 159834,
              layer: 'ortho_w_fcir',
              visible: true,
            },
            {
              id: 159833,
              layer: 'ortho_s_fcir_2020',
              visible: false,
            },
            {
              id: 159832,
              layer: 'ortho_s_fcir_2018',
              visible: false,
            },
            {
              id: 159831,
              layer: 'ortho_w_fcir_2015',
              visible: false,
            },
            {
              id: 159830,
              layer: 'ortho_s_fcir_2014',
              visible: false,
            },
          ],
          opacity: 1,
          visible: true,
          isSingleLayer: false,
          attributeFilters: undefined,
          timeExtent: {
            start: timeService.createUTCDateFromString('2016-01-01T00:00:00.000Z'),
            end: timeService.createUTCDateFromString('2017-01-01T00:00:00.000Z'),
          },
        },
      ];

      const result = service.getActiveMapItemsForFavourite(activeMapItemConfigurations, true);
      // eslint-disable-next-line @typescript-eslint/dot-notation
      const initialTimeExtent = timeSliderService.createInitialTimeSliderExtent(service['availableMaps'][0].timeSliderConfiguration!);
      const activeMapItems: ActiveMapItem[] = [
        ActiveMapItemFactory.createGb2WmsMapItem(
          // eslint-disable-next-line @typescript-eslint/dot-notation
          service['availableMaps'][0],
          undefined,
          true,
          1,
          initialTimeExtent,
          // eslint-disable-next-line @typescript-eslint/dot-notation
          service['availableMaps'][0].filterConfigurations,
        ),
      ];

      expect(result).toEqual(activeMapItems);
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
                tool: 'point',
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
                tool: 'point',
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
                tool: 'point',
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
                tool: 'point',
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
                tool: 'point',
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
                tool: 'point',
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
          ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Measurements, DrawingLayerPrefix.Drawing, true, 1),
          ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Drawings, DrawingLayerPrefix.Drawing, true, 1),
        ],
      };

      expect(actual).toEqual(expected);
      expect(converterSpy).toHaveBeenCalledTimes(2);
    });
  });
});
