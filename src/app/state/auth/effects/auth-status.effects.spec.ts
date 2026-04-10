import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {AuthService} from '../../../auth/auth.service';
import {AuthStatusEffects} from './auth-status.effects';
import {SessionStorageService} from '../../../shared/services/session-storage.service';
import {AuthStatusActions} from '../actions/auth-status.actions';
import {selectCurrentInternalShareLinkItem} from '../../map/selectors/current-share-link-item.selector';
import {ShareLinkItem} from '../../../shared/interfaces/share-link.interface';
import {ShareLinkItemTestUtils} from '../../../testing/map-testing/share-link-item-test.utils';
import {selectActiveMapItemConfigurations} from '../../map/selectors/active-map-item-configuration.selector';
import {selectMaps} from '../../map/selectors/maps.selector';
import {selectFavouriteBaseConfig} from '../../map/selectors/favourite-base-config.selector';
import {selectUserDrawingsVectorLayers} from '../../map/selectors/user-drawings-vector-layers.selector';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {LayerCatalogActions} from '../../map/actions/layer-catalog.actions';
import {Gb3ShareLinkService} from '../../../shared/services/apis/gb3/gb3-share-link.service';
import {MapRestoreItem} from '../../../shared/interfaces/map-restore-item.interface';
import {ActiveMapItemActions} from '../../map/actions/active-map-item.actions';
import {createDrawingMapItemMock, createGb2WmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';
import {InternalDrawingLayer, UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {MapConstants} from '../../../shared/constants/map.constants';
import {DrawingActions} from '../../map/actions/drawing.actions';
import {selectItems} from '../../map/selectors/active-map-items.selector';
import {selectDrawings} from '../../map/reducers/drawing.reducer';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {TimeService} from '../../../shared/interfaces/time-service.interface';
import {DRAWING_SYMBOLS_SERVICE, MAP_SERVICE, TIME_SERVICE} from '../../../app.tokens';
import {InternalShareLinkItem} from 'src/app/shared/interfaces/internal-share-link.interface';
import {DrawingSymbolServiceStub} from 'src/app/testing/map-testing/drawing-symbol-service.stub';
import {UuidUtils} from 'src/app/shared/utils/uuid.utils';
import {ToolService} from 'src/app/map/interfaces/tool.service';

const mockUuid = '32b50136-2190-4faa-8fef-b9d07319c749'; // Chosen by fair dice roll.
const mockOAuthService: Partial<AuthService> = {
  login: vi.fn(),
  logout: vi.fn(),
};

describe('AuthStatusEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: AuthStatusEffects;
  let storageService: SessionStorageService;
  let timeService: TimeService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideMockActions(() => actions$),
        provideMockStore(),
        AuthStatusEffects,
        {provide: MAP_SERVICE, useClass: MapServiceStub},
        {provide: DRAWING_SYMBOLS_SERVICE, useClass: DrawingSymbolServiceStub},
        {provide: AuthService, useValue: mockOAuthService},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    timeService = TestBed.inject(TIME_SERVICE);
    storageService = TestBed.inject(SessionStorageService);
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectActiveMapItemConfigurations, []);
    store.overrideSelector(selectMaps, []);
    store.overrideSelector(selectFavouriteBaseConfig, {center: {x: 0, y: 0}, scale: 0, basemap: ''});
    store.overrideSelector(selectUserDrawingsVectorLayers, {
      drawings: [],
      measurements: [],
    });
    effects = TestBed.inject(AuthStatusEffects);

    vi.spyOn(UuidUtils, 'createUuid').mockReturnValue(mockUuid);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('login$', () => {
    it('logins using the AuthService and stores the current map state into a share link item; dispatches no further actions', () => {
      const internalShareLinkItem: InternalShareLinkItem = ShareLinkItemTestUtils.createInternalShareLinkItem(
        timeService.createUTCDateFromString('1000'),
        timeService.createUTCDateFromString('2020'),
      );

      const expectedShareLinkItem = ShareLinkItemTestUtils.createShareLinkItemJsonString(
        timeService.createUTCDateFromString('1000'),
        timeService.createUTCDateFromString('2020'),
        mockUuid,
      );

      store.overrideSelector(selectCurrentInternalShareLinkItem, internalShareLinkItem);

      const storageServiceSpy = vi.spyOn(storageService, 'set');

      const expectedAction = AuthStatusActions.performLogin();
      actions$ = of(expectedAction);
      effects.login$.subscribe(() => {
        expect(mockOAuthService.login).toHaveBeenCalledTimes(1);
        expect(mockOAuthService.login).toHaveBeenCalledWith();
        expect(storageServiceSpy).toHaveBeenCalledTimes(1);

        const passedArgs = vi.mocked(storageServiceSpy).mock.lastCall;

        expect(passedArgs).toBeDefined();
        expect(passedArgs![0]).toBe('shareLinkItem');
        expect(JSON.parse(passedArgs![1])).toEqual(JSON.parse(expectedShareLinkItem));
      });
    });
  });

  describe('logout$', () => {
    it('logouts using the AuthService and stores the current map state into a share link item; dispatches no further actions', () => {
      const internalShareLinkItem: InternalShareLinkItem = ShareLinkItemTestUtils.createInternalShareLinkItem(
        timeService.createUTCDateFromString('1000'),
        timeService.createUTCDateFromString('2020'),
      );

      const expectedShareLinkItem = ShareLinkItemTestUtils.createShareLinkItemJsonString(
        timeService.createUTCDateFromString('1000'),
        timeService.createUTCDateFromString('2020'),
        mockUuid,
      );

      const storageServiceSpy = vi.spyOn(storageService, 'set');
      store.overrideSelector(selectCurrentInternalShareLinkItem, internalShareLinkItem);
      const isForced = true;

      const expectedAction = AuthStatusActions.performLogout({isForced});
      actions$ = of(expectedAction);
      effects.logout$.subscribe(() => {
        expect(mockOAuthService.logout).toHaveBeenCalledTimes(1);
        expect(mockOAuthService.logout).toHaveBeenCalledWith(isForced);
        expect(storageServiceSpy).toHaveBeenCalledTimes(1);

        const passedArgs = vi.mocked(storageServiceSpy).mock.lastCall;

        expect(passedArgs).toBeDefined();
        expect(passedArgs![0]).toBe('shareLinkItem');
        expect(JSON.parse(passedArgs![1])).toEqual(JSON.parse(expectedShareLinkItem));
      });
    });
  });

  describe('restoreApplicationAfterRedirectOrRefresh$', () => {
    it(
      'dispatches AuthStatusActions.completeRestoreApplication after setting the layer catalog' +
        'and loading an existing share link item from the session storage.',
      () => {
        const shareLinkItem: ShareLinkItem = ShareLinkItemTestUtils.createShareLinkItem(
          timeService.createUTCDateFromString('1000'),
          timeService.createUTCDateFromString('2020'),
          mockUuid,
        );
        const shareLinkItemString = JSON.stringify(shareLinkItem);
        const storageServiceGetSpy = vi.spyOn(storageService, 'get').mockReturnValue(shareLinkItemString);
        const storageServiceRemoveSpy = vi.spyOn(storageService, 'remove').mockImplementation(vi.fn());
        const shareLinkService = TestBed.inject(Gb3ShareLinkService);
        const mapRestoreItem: MapRestoreItem = {
          activeMapItems: [],
          x: 13.37,
          y: -9001,
          scale: 0.007,
          drawings: [],
          basemapId: 'to be or not to be',
        };
        const shareLinkServiceSpy = vi.spyOn(shareLinkService, 'createMapRestoreItem').mockReturnValue(Promise.resolve(mapRestoreItem));

        const expectedAction = AuthStatusActions.completeRestoreApplication({mapRestoreItem});

        actions$ = of(LayerCatalogActions.setLayerCatalog({items: []}));
        effects.restoreApplicationAfterRedirectOrRefresh$.subscribe((action) => {
          expect(action).toEqual(expectedAction);
          expect(storageServiceGetSpy).toHaveBeenCalledTimes(1);
          expect(storageServiceGetSpy).toHaveBeenCalledWith('shareLinkItem');
          expect(storageServiceRemoveSpy).toHaveBeenCalledTimes(1);
          expect(storageServiceRemoveSpy).toHaveBeenCalledWith('shareLinkItem');
          expect(shareLinkServiceSpy).toHaveBeenCalledTimes(1);
          expect(shareLinkServiceSpy).toHaveBeenCalledWith(shareLinkItem, true);
        });
      },
    );

    it('dispatches nothing without any share link item from the session storage.', async () => {
      vi.useFakeTimers();
      const storageServiceGetSpy = vi.spyOn(storageService, 'get').mockReturnValue(null);
      const storageServiceRemoveSpy = vi.spyOn(storageService, 'remove');
      const shareLinkService = TestBed.inject(Gb3ShareLinkService);
      const shareLinkServiceSpy = vi.spyOn(shareLinkService, 'createMapRestoreItem');

      let newAction;
      actions$ = of(LayerCatalogActions.setLayerCatalog({items: []}));
      effects.restoreApplicationAfterRedirectOrRefresh$.subscribe((action) => (newAction = action));
      await vi.runAllTimersAsync();

      expect(newAction).toBeUndefined();
      expect(storageServiceGetSpy).toHaveBeenCalledTimes(1);
      expect(storageServiceGetSpy).toHaveBeenCalledWith('shareLinkItem');
      expect(storageServiceRemoveSpy).toHaveBeenCalledTimes(1);
      expect(storageServiceRemoveSpy).toHaveBeenCalledWith('shareLinkItem');
      expect(shareLinkServiceSpy).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('setActiveMapItemsAfterApplicationRestore$', () => {
    it('dispatches ActiveMapItemActions.addInitialMapItems after completing to restore the application.', () => {
      const mapRestoreItem: MapRestoreItem = {
        activeMapItems: [createGb2WmsMapItemMock('one'), createDrawingMapItemMock(UserDrawingLayer.Drawings)],
        x: 13.37,
        y: -9001,
        scale: 0.007,
        drawings: [],
        basemapId: 'to be or not to be',
      };

      const expectedAction = ActiveMapItemActions.addInitialMapItems({initialMapItems: mapRestoreItem.activeMapItems});

      actions$ = of(AuthStatusActions.completeRestoreApplication({mapRestoreItem}));
      effects.setActiveMapItemsAfterApplicationRestore$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('setInitialDrawingsAfterApplicationRestore$', () => {
    it('dispatches ActiveMapItemActions.addInitialMapItems after completing to restore the application.', () => {
      const mapRestoreItem: MapRestoreItem = {
        activeMapItems: [],
        x: 13.37,
        y: -9001,
        scale: 0.007,
        drawings: [
          {
            type: 'Feature',
            source: InternalDrawingLayer.Selection,
            properties: {
              style: {
                fillColor: '#123456',
                fillOpacity: 1,
                strokeWidth: 123456,
                strokeOpacity: 1,
                strokeColor: '#123456',
                type: 'polygon',
              },
              [MapConstants.DRAWING_IDENTIFIER]: 'id',
              [MapConstants.BELONGS_TO_IDENTIFIER]: undefined,
              [MapConstants.TOOL_IDENTIFIER]: 'point',
            },
            geometry: {
              type: 'Polygon',
              srs: 2056,
              coordinates: [
                [
                  [0, 0],
                  [12, 0],
                  [0, 12],
                  [0, 0],
                ],
              ],
            },
            labelText: 'labelText',
          },
        ],
        basemapId: 'to be or not to be',
      };

      const expectedAction = DrawingActions.addDrawings({drawings: mapRestoreItem.drawings});

      actions$ = of(AuthStatusActions.completeRestoreApplication({mapRestoreItem}));
      effects.setInitialDrawingsAfterApplicationRestore$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('addInitialDrawingsToMapAfterApplicationRestore$', () => {
    it('adds the initial drawings using the tool service; dispatches no further actions', () => {
      const mapRestoreItem: MapRestoreItem = {
        activeMapItems: [createGb2WmsMapItemMock('one'), createDrawingMapItemMock(UserDrawingLayer.Drawings)],
        x: 13.37,
        y: -9001,
        scale: 0.007,
        drawings: [
          {
            type: 'Feature',
            source: UserDrawingLayer.Drawings,
            properties: {
              style: {
                fillColor: '#123456',
                fillOpacity: 1,
                strokeWidth: 123456,
                strokeOpacity: 1,
                strokeColor: '#123456',
                type: 'polygon',
              },
              [MapConstants.DRAWING_IDENTIFIER]: 'id',
              [MapConstants.BELONGS_TO_IDENTIFIER]: undefined,
              [MapConstants.TOOL_IDENTIFIER]: 'point',
            },
            geometry: {
              type: 'Polygon',
              srs: 2056,
              coordinates: [
                [
                  [0, 0],
                  [12, 0],
                  [0, 12],
                  [0, 0],
                ],
              ],
            },
            labelText: 'labelText',
          },
        ],
        basemapId: 'to be or not to be',
      };
      store.overrideSelector(selectItems, mapRestoreItem.activeMapItems);
      store.overrideSelector(selectDrawings, mapRestoreItem.drawings);
      const mapService = TestBed.inject(MAP_SERVICE);
      const mapToolServiceMock = vi.fn(
        class implements ToolService {
          public initializeMeasurement = vi.fn();
          public initializeElevationProfileMeasurement = vi.fn();
          public initializeDrawing = vi.fn();
          public initializeDataDownloadSelection = vi.fn();
          public addExistingDrawingsToLayer = vi.fn();
          public updateDrawingStyles = vi.fn();
          public cancelTool = vi.fn();
        },
      );
      const mapToolServiceSpy = new mapToolServiceMock();

      const mapServiceSpy = vi.spyOn(mapService, 'getToolService').mockReturnValue(mapToolServiceSpy);

      const expectedAction = AuthStatusActions.completeRestoreApplication({mapRestoreItem});
      actions$ = of(expectedAction);
      effects.addInitialDrawingsToMapAfterApplicationRestore$.subscribe(([action, _]) => {
        expect(action).toEqual(expectedAction);
        expect(mapServiceSpy).toHaveBeenCalledTimes(1);
        expect(mapServiceSpy).toHaveBeenCalledWith();
        expect(mapToolServiceSpy.addExistingDrawingsToLayer).toHaveBeenCalledTimes(1);
        expect(mapToolServiceSpy.addExistingDrawingsToLayer).toHaveBeenCalledWith(mapRestoreItem.drawings, UserDrawingLayer.Drawings);
      });
    });

    it('adds nothing without any drawings.', () => {
      const mapRestoreItem: MapRestoreItem = {
        activeMapItems: [createGb2WmsMapItemMock('one')],
        x: 13.37,
        y: -9001,
        scale: 0.007,
        drawings: [],
        basemapId: 'to be or not to be',
      };
      store.overrideSelector(selectItems, mapRestoreItem.activeMapItems);
      store.overrideSelector(selectDrawings, mapRestoreItem.drawings);
      const mapService = TestBed.inject(MAP_SERVICE);
      const mapServiceSpy = vi.spyOn(mapService, 'getToolService');

      const expectedAction = AuthStatusActions.completeRestoreApplication({mapRestoreItem});
      actions$ = of(expectedAction);
      effects.addInitialDrawingsToMapAfterApplicationRestore$.subscribe(([action, _]) => {
        expect(action).toEqual(expectedAction);
        expect(mapServiceSpy).not.toHaveBeenCalled();
      });
    });

    it('does not continue until the drawings are loaded.', async () => {
      vi.useFakeTimers();

      const mapRestoreItem: MapRestoreItem = {
        activeMapItems: [createGb2WmsMapItemMock('one'), createDrawingMapItemMock(UserDrawingLayer.Drawings)],
        x: 13.37,
        y: -9001,
        scale: 0.007,
        drawings: [
          {
            type: 'Feature',
            source: UserDrawingLayer.Drawings,
            properties: {
              style: {
                fillColor: '#123456',
                fillOpacity: 1,
                strokeWidth: 123456,
                strokeOpacity: 1,
                strokeColor: '#123456',
                type: 'polygon',
              },
              [MapConstants.DRAWING_IDENTIFIER]: 'id',
              [MapConstants.BELONGS_TO_IDENTIFIER]: undefined,
              [MapConstants.TOOL_IDENTIFIER]: 'point',
            },
            geometry: {
              type: 'Polygon',
              srs: 2056,
              coordinates: [
                [
                  [0, 0],
                  [12, 0],
                  [0, 12],
                  [0, 0],
                ],
              ],
            },
            labelText: 'labelText',
          },
        ],
        basemapId: 'to be or not to be',
      };
      store.overrideSelector(selectItems, mapRestoreItem.activeMapItems);
      store.overrideSelector(selectDrawings, []);
      const mapService = TestBed.inject(MAP_SERVICE);
      const mapServiceSpy = vi.spyOn(mapService, 'getToolService');

      let newAction;
      actions$ = of(AuthStatusActions.completeRestoreApplication({mapRestoreItem}));
      effects.addInitialDrawingsToMapAfterApplicationRestore$.subscribe((action) => (newAction = action));
      await vi.runAllTimersAsync();

      expect(newAction).toBeUndefined();
      expect(mapServiceSpy).not.toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('does not continue until the active map items are loaded.', async () => {
      vi.useFakeTimers();
      const mapRestoreItem: MapRestoreItem = {
        activeMapItems: [createGb2WmsMapItemMock('one'), createDrawingMapItemMock(UserDrawingLayer.Drawings)],
        x: 13.37,
        y: -9001,
        scale: 0.007,
        drawings: [
          {
            type: 'Feature',
            source: UserDrawingLayer.Drawings,
            properties: {
              style: {
                fillColor: '#123456',
                fillOpacity: 1,
                strokeWidth: 123456,
                strokeOpacity: 1,
                strokeColor: '#123456',
                type: 'polygon',
              },
              [MapConstants.DRAWING_IDENTIFIER]: 'id',
              [MapConstants.BELONGS_TO_IDENTIFIER]: undefined,
              [MapConstants.TOOL_IDENTIFIER]: 'point',
            },
            geometry: {
              type: 'Polygon',
              srs: 2056,
              coordinates: [
                [
                  [0, 0],
                  [12, 0],
                  [0, 12],
                  [0, 0],
                ],
              ],
            },
            labelText: 'labelText',
          },
        ],
        basemapId: 'to be or not to be',
      };
      store.overrideSelector(selectItems, []);
      store.overrideSelector(selectDrawings, mapRestoreItem.drawings);
      const mapService = TestBed.inject(MAP_SERVICE);
      const mapServiceSpy = vi.spyOn(mapService, 'getToolService');

      let newAction;
      actions$ = of(AuthStatusActions.completeRestoreApplication({mapRestoreItem}));
      effects.addInitialDrawingsToMapAfterApplicationRestore$.subscribe((action) => (newAction = action));
      await vi.runAllTimersAsync();

      expect(newAction).toBeUndefined();
      expect(mapServiceSpy).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});
