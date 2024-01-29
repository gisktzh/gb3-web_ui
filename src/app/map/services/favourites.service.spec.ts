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
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      service['availableMaps'] = [
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
          keywords: [
            'Amtliche',
            'Vermessung',
            'in',
            'Farbe',
            'pk',
            'Amtlichen Vermessung',
            'AV',
            'Grundbuchvermessung',
            'Fixpunkte',
            'Liegenschaften',
            'Grundstücke',
            'Parzellen',
            'Hoheitsgrenzen',
            'Bodenbedeckung',
            'Einzelobjekte',
            'Gebäudeadressen',
            'Nomenklatur',
            'Postleitzahl',
            'Ortschaften',
            'Rohrleitungen',
            'bvv',
            'imale',
            'Katasterplan',
            'TBAK1',
            'fsla',
            'awagis',
            'lelw',
            'obs',
            'denkk',
            'Eigentum',
            'Eigentümer',
          ],
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
                  isActive: false,
                  values: ['Gebäude Wohnen'],
                  name: 'Wohnen',
                },
                {
                  isActive: false,
                  values: ['Gebäude Landwirtschaft', 'Gebäude Industrie', 'Gebäude Verwaltung'],
                  name: 'Gewerbe und Verwaltung',
                },
                {
                  isActive: false,
                  values: ['Nebengebäude', 'Gebäude Handel', 'Gebäude Gastgewerbe', 'Gebäude Verkehrswesen', 'unbekannt'],
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
        },
      ];

      const actual = service.getActiveMapItemsForFavourite(activeMapItemConfigurations, false);
      const expected: ActiveMapItem[] = [
        ActiveMapItemFactory.createGb2WmsMapItem(
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
          true,
          1,
        ),
        ActiveMapItemFactory.createGb2WmsMapItem(
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
                    isActive: false,
                    values: ['Gebäude Wohnen'],
                    name: 'Wohnen',
                  },
                  {
                    isActive: false,
                    values: ['Gebäude Landwirtschaft', 'Gebäude Industrie', 'Gebäude Verwaltung'],
                    name: 'Gewerbe und Verwaltung',
                  },
                  {
                    isActive: false,
                    values: ['Nebengebäude', 'Gebäude Handel', 'Gebäude Gastgewerbe', 'Gebäude Verkehrswesen', 'unbekannt'],
                    name: 'Andere',
                  },
                ],
              },
            ],
          },
          undefined,
          true,
          0.71,
        ),
        ActiveMapItemFactory.createGb2WmsMapItem(
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
            keywords: [
              'Amtliche',
              'Vermessung',
              'in',
              'Farbe',
              'pk',
              'Amtlichen Vermessung',
              'AV',
              'Grundbuchvermessung',
              'Fixpunkte',
              'Liegenschaften',
              'Grundstücke',
              'Parzellen',
              'Hoheitsgrenzen',
              'Bodenbedeckung',
              'Einzelobjekte',
              'Gebäudeadressen',
              'Nomenklatur',
              'Postleitzahl',
              'Ortschaften',
              'Rohrleitungen',
              'bvv',
              'imale',
              'Katasterplan',
              'TBAK1',
              'fsla',
              'awagis',
              'lelw',
              'obs',
              'denkk',
              'Eigentum',
              'Eigentümer',
            ],
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
                visible: false,
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
                visible: false,
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
        },
      ];

      const expectedError = new FavouriteIsInvalid(`Die Karte 'missing_map_id' existiert nicht (mehr).`);

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
        },
      ];

      const actual = service.getActiveMapItemsForFavourite(activeMapItemConfigurations, true);
      const expected: ActiveMapItem[] = [
        ActiveMapItemFactory.createGb2WmsMapItem(
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
          true,
          1,
        ),
        ActiveMapItemFactory.createGb2WmsMapItem(
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
                    isActive: false,
                    values: ['Gebäude Wohnen'],
                    name: 'Wohnen',
                  },
                  {
                    isActive: false,
                    values: ['Gebäude Landwirtschaft', 'Gebäude Industrie', 'Gebäude Verwaltung'],
                    name: 'Gewerbe und Verwaltung',
                  },
                  {
                    isActive: false,
                    values: ['Nebengebäude', 'Gebäude Handel', 'Gebäude Gastgewerbe', 'Gebäude Verkehrswesen', 'unbekannt'],
                    name: 'Andere',
                  },
                ],
              },
            ],
          },
          undefined,
          true,
          0.71,
        ),
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
        },
      ];

      const expectedError = new FavouriteIsInvalid(`Der Layer 'missing_layer' existiert nicht (mehr).`);

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
        },
      ];

      const actual = service.getActiveMapItemsForFavourite(activeMapItemConfigurations, true);
      const expected: ActiveMapItem[] = [
        ActiveMapItemFactory.createGb2WmsMapItem(
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
          true,
          1,
        ),
        ActiveMapItemFactory.createGb2WmsMapItem(
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
                    isActive: false,
                    values: ['Gebäude Wohnen'],
                    name: 'Wohnen',
                  },
                  {
                    isActive: false,
                    values: ['Gebäude Landwirtschaft', 'Gebäude Industrie', 'Gebäude Verwaltung'],
                    name: 'Gewerbe und Verwaltung',
                  },
                  {
                    isActive: false,
                    values: ['Nebengebäude', 'Gebäude Handel', 'Gebäude Gastgewerbe', 'Gebäude Verkehrswesen', 'unbekannt'],
                    name: 'Andere',
                  },
                ],
              },
            ],
          },
          undefined,
          true,
          0.71,
        ),
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
          'cc1cfab9-dfa8-45c7-b489-4d649161529d': {
            type: 'polygon',
            fillColor: '#ff0000',
            fillOpacity: 0.3,
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
                    [2681749.83649817, 1248953.6175633047],
                    [2681818.0962289297, 1249122.8448124793],
                    [2681690.1092337556, 1249147.0201337899],
                  ],
                ],
              },
              properties: {
                id: 'e3f511b7-ffdc-44bc-af12-8ddf0b5cfd16',
                style: 'cc1cfab9-dfa8-45c7-b489-4d649161529d',
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
                    [2681502.866063096, 1249241.0777341372],
                    [2681499.133586668, 1249255.0075258056],
                    [2681493.9654974192, 1249268.4708585925],
                    [2681487.4184180177, 1249281.3202254067],
                    [2681479.564079635, 1249293.4148458962],
                    [2681470.4885360464, 1249304.6222088682],
                    [2681460.291220806, 1249314.8195241082],
                    [2681449.0838578343, 1249323.8950676972],
                    [2681436.989237345, 1249331.7494060798],
                    [2681424.1398705305, 1249338.2964854813],
                    [2681410.676537744, 1249343.46457473],
                    [2681396.7467460753, 1249347.1970511584],
                    [2681382.5031132377, 1249349.4530209736],
                    [2681368.1016954533, 1249350.2077672982],
                    [2681353.700277669, 1249349.4530209736],
                    [2681339.456644831, 1249347.1970511584],
                    [2681325.526853163, 1249343.46457473],
                    [2681312.063520376, 1249338.2964854813],
                    [2681299.2141535617, 1249331.7494060798],
                    [2681287.119533072, 1249323.8950676972],
                    [2681275.9121701005, 1249314.8195241082],
                    [2681265.71485486, 1249304.6222088682],
                    [2681256.6393112717, 1249293.4148458962],
                    [2681248.784972889, 1249281.3202254067],
                    [2681242.2378934873, 1249268.4708585925],
                    [2681237.0698042386, 1249255.0075258056],
                    [2681233.3373278105, 1249241.0777341372],
                    [2681231.081357995, 1249226.8341012998],
                    [2681230.3266116707, 1249212.4326835154],
                    [2681231.081357995, 1249198.031265731],
                    [2681233.3373278105, 1249183.7876328935],
                    [2681237.0698042386, 1249169.857841225],
                    [2681242.2378934873, 1249156.3945084382],
                    [2681248.784972889, 1249143.545141624],
                    [2681256.6393112717, 1249131.4505211345],
                    [2681265.71485486, 1249120.2431581626],
                    [2681275.9121701005, 1249110.0458429225],
                    [2681287.119533072, 1249100.9702993336],
                    [2681299.2141535617, 1249093.115960951],
                    [2681312.063520376, 1249086.5688815494],
                    [2681325.526853163, 1249081.4007923007],
                    [2681339.456644831, 1249077.6683158723],
                    [2681353.700277669, 1249075.4123460571],
                    [2681368.1016954533, 1249074.6575997325],
                    [2681382.5031132377, 1249075.4123460571],
                    [2681396.7467460753, 1249077.6683158723],
                    [2681410.676537744, 1249081.4007923007],
                    [2681424.1398705305, 1249086.5688815494],
                    [2681436.989237345, 1249093.115960951],
                    [2681449.0838578343, 1249100.9702993336],
                    [2681460.291220806, 1249110.0458429225],
                    [2681470.4885360464, 1249120.2431581626],
                    [2681479.564079635, 1249131.4505211345],
                    [2681487.4184180177, 1249143.545141624],
                    [2681493.9654974192, 1249156.3945084382],
                    [2681499.133586668, 1249169.857841225],
                    [2681502.866063096, 1249183.7876328935],
                    [2681505.1220329115, 1249198.031265731],
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
});
