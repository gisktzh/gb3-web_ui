import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {AuthService} from '../../../auth/auth.service';
import {AuthStatusEffects} from './auth-status.effects';
import {SessionStorageService} from '../../../shared/services/session-storage.service';
import {AuthStatusActions} from '../actions/auth-status.actions';
import {selectCurrentShareLinkItem} from '../../map/selectors/current-share-link-item.selector';
import {ShareLinkItem} from '../../../shared/interfaces/share-link.interface';
import {ShareLinkItemTestUtils} from '../../../testing/map-testing/share-link-item-test.utils';
import {selectActiveMapItemConfigurations} from '../../map/selectors/active-map-item-configuration.selector';
import {selectMaps} from '../../map/selectors/maps.selector';
import {selectFavouriteBaseConfig} from '../../map/selectors/favourite-base-config.selector';
import {selectUserDrawingsVectorLayers} from '../../map/selectors/user-drawings-vector-layers.selector';
import {MAP_SERVICE} from '../../../app.module';
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
import {ToolService} from '../../../map/interfaces/tool.service';

const mockOAuthService = jasmine.createSpyObj<AuthService>({
  logout: void 0,
  login: void 0,
});

describe('AuthStatusEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: AuthStatusEffects;
  let storageService: SessionStorageService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: AuthService, useValue: mockOAuthService},
        AuthStatusEffects,
        {provide: MAP_SERVICE, useClass: MapServiceStub},
      ],
    });
    storageService = TestBed.inject(SessionStorageService);
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectActiveMapItemConfigurations, []);
    store.overrideSelector(selectMaps, []);
    store.overrideSelector(selectFavouriteBaseConfig, {center: {x: 0, y: 0}, scale: 0, basemap: ''});
    store.overrideSelector(selectUserDrawingsVectorLayers, {
      drawings: {type: 'Vector', geojson: {type: 'FeatureCollection', features: []}, styles: {}},
      measurements: {type: 'Vector', geojson: {type: 'FeatureCollection', features: []}, styles: {}},
    });
    effects = TestBed.inject(AuthStatusEffects);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('login$', () => {
    it('logins using the AuthService and stores the current map state into a share link item; dispatches no further actions', (done: DoneFn) => {
      const shareLinkItem: ShareLinkItem = ShareLinkItemTestUtils.createShareLinkItem();
      const storageServiceSpy = spyOn(storageService, 'set');
      store.overrideSelector(selectCurrentShareLinkItem, shareLinkItem);

      const expectedShareLinkItem = JSON.stringify(shareLinkItem);

      const expectedAction = AuthStatusActions.performLogin();
      actions$ = of(expectedAction);
      effects.login$.subscribe(([action, _]) => {
        expect(action).toEqual(expectedAction);
        expect(mockOAuthService.login).toHaveBeenCalledOnceWith();
        expect(storageServiceSpy).toHaveBeenCalledOnceWith('shareLinkItem', expectedShareLinkItem);
        done();
      });
    });
  });

  describe('logout$', () => {
    it('logouts using the AuthService and stores the current map state into a share link item; dispatches no further actions', (done: DoneFn) => {
      const shareLinkItem: ShareLinkItem = ShareLinkItemTestUtils.createShareLinkItem();
      const storageServiceSpy = spyOn(storageService, 'set');
      store.overrideSelector(selectCurrentShareLinkItem, shareLinkItem);
      const isForced = true;

      const expectedShareLinkItem = JSON.stringify(shareLinkItem);

      const expectedAction = AuthStatusActions.performLogout({isForced});
      actions$ = of(expectedAction);
      effects.logout$.subscribe(([action, _]) => {
        expect(action).toEqual(expectedAction);
        expect(mockOAuthService.logout).toHaveBeenCalledOnceWith(isForced);
        expect(storageServiceSpy).toHaveBeenCalledOnceWith('shareLinkItem', expectedShareLinkItem);
        done();
      });
    });
  });

  describe('restoreApplicationAfterRedirectOrRefresh$', () => {
    it(
      'dispatches AuthStatusActions.completeRestoreApplication after setting the layer catalog' +
        'and loading an existing share link item from the session storage.',
      (done: DoneFn) => {
        const shareLinkItem: ShareLinkItem = ShareLinkItemTestUtils.createShareLinkItem();
        const shareLinkItemString = JSON.stringify(shareLinkItem);
        const storageServiceGetSpy = spyOn(storageService, 'get').and.returnValue(shareLinkItemString);
        const storageServiceRemoveSpy = spyOn(storageService, 'remove').and.stub();
        const shareLinkService = TestBed.inject(Gb3ShareLinkService);
        const mapRestoreItem: MapRestoreItem = {
          activeMapItems: [],
          x: 13.37,
          y: -9001,
          scale: 0.007,
          drawings: [],
          basemapId: 'to be or not to be',
        };
        const shareLinkServiceSpy = spyOn(shareLinkService, 'createMapRestoreItem').and.returnValue(mapRestoreItem);

        const expectedAction = AuthStatusActions.completeRestoreApplication({mapRestoreItem});

        actions$ = of(LayerCatalogActions.setLayerCatalog({items: []}));
        effects.restoreApplicationAfterRedirectOrRefresh$.subscribe((action) => {
          expect(action).toEqual(expectedAction);
          expect(storageServiceGetSpy).toHaveBeenCalledOnceWith('shareLinkItem');
          expect(storageServiceRemoveSpy).toHaveBeenCalledOnceWith('shareLinkItem');
          expect(shareLinkServiceSpy).toHaveBeenCalledOnceWith(shareLinkItem, true);
          done();
        });
      },
    );

    it('dispatches nothing without any share link item from the session storage.', fakeAsync(() => {
      const storageServiceGetSpy = spyOn(storageService, 'get').and.returnValue(null);
      const storageServiceRemoveSpy = spyOn(storageService, 'remove');
      const shareLinkService = TestBed.inject(Gb3ShareLinkService);
      const shareLinkServiceSpy = spyOn(shareLinkService, 'createMapRestoreItem');

      let newAction;
      actions$ = of(LayerCatalogActions.setLayerCatalog({items: []}));
      effects.restoreApplicationAfterRedirectOrRefresh$.subscribe((action) => (newAction = action));
      flush();

      expect(newAction).toBeUndefined();
      expect(storageServiceGetSpy).toHaveBeenCalledOnceWith('shareLinkItem');
      expect(storageServiceRemoveSpy).toHaveBeenCalledOnceWith('shareLinkItem');
      expect(shareLinkServiceSpy).not.toHaveBeenCalled();
    }));
  });

  describe('setActiveMapItemsAfterApplicationRestore$', () => {
    it('dispatches ActiveMapItemActions.addInitialMapItems after completing to restore the application.', (done: DoneFn) => {
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
        done();
      });
    });
  });

  describe('setInitialDrawingsAfterApplicationRestore$', () => {
    it('dispatches ActiveMapItemActions.addInitialMapItems after completing to restore the application.', (done: DoneFn) => {
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
        done();
      });
    });
  });

  describe('addInitialDrawingsToMapAfterApplicationRestore$', () => {
    it('adds the initial drawings using the tool service; dispatches no further actions', (done: DoneFn) => {
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
      const mapToolServiceSpy = jasmine.createSpyObj<ToolService>({
        addExistingDrawingsToLayer: void 0,
      });
      const mapServiceSpy = spyOn(mapService, 'getToolService').and.returnValue(mapToolServiceSpy);

      const expectedAction = AuthStatusActions.completeRestoreApplication({mapRestoreItem});
      actions$ = of(expectedAction);
      effects.addInitialDrawingsToMapAfterApplicationRestore$.subscribe(([action, _]) => {
        expect(action).toEqual(expectedAction);
        expect(mapServiceSpy).toHaveBeenCalledOnceWith();
        expect(mapToolServiceSpy.addExistingDrawingsToLayer).toHaveBeenCalledOnceWith(mapRestoreItem.drawings, UserDrawingLayer.Drawings);
        done();
      });
    });

    it('adds nothing without any drawings.', (done: DoneFn) => {
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
      const mapServiceSpy = spyOn(mapService, 'getToolService');

      const expectedAction = AuthStatusActions.completeRestoreApplication({mapRestoreItem});
      actions$ = of(expectedAction);
      effects.addInitialDrawingsToMapAfterApplicationRestore$.subscribe(([action, _]) => {
        expect(action).toEqual(expectedAction);
        expect(mapServiceSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('does not continue until the drawings are loaded.', fakeAsync(() => {
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
      const mapServiceSpy = spyOn(mapService, 'getToolService');

      let newAction;
      actions$ = of(AuthStatusActions.completeRestoreApplication({mapRestoreItem}));
      effects.addInitialDrawingsToMapAfterApplicationRestore$.subscribe((action) => (newAction = action));
      flush();

      expect(newAction).toBeUndefined();
      expect(mapServiceSpy).not.toHaveBeenCalled();
    }));

    it('does not continue until the active map items are loaded.', fakeAsync(() => {
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
      const mapServiceSpy = spyOn(mapService, 'getToolService');

      let newAction;
      actions$ = of(AuthStatusActions.completeRestoreApplication({mapRestoreItem}));
      effects.addInitialDrawingsToMapAfterApplicationRestore$.subscribe((action) => (newAction = action));
      flush();

      expect(newAction).toBeUndefined();
      expect(mapServiceSpy).not.toHaveBeenCalled();
    }));
  });
});
