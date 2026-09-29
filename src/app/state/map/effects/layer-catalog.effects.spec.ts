import {EMPTY, Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {LayerCatalogEffects} from './layer-catalog.effects';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {selectMaps} from '../selectors/maps.selector';
import {selectMapConfigState} from '../reducers/map-config.reducer';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';
import {MapConfigActions} from '../actions/map-config.actions';
import {MapConfigState} from '../states/map-config.state';
import {Map} from '../../../shared/interfaces/topic.interface';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {InitialMapIdsParameterInvalid, InitialMapsCouldNotBeLoaded} from '../../../shared/errors/initial-maps.errors';
import {selectIsAuthenticated} from '../../auth/reducers/auth-status.reducer';
import {catchError} from 'rxjs';

describe('LayerCatalogEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: LayerCatalogEffects;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        LayerCatalogEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    effects = TestBed.inject(LayerCatalogEffects);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('handleInitialMapLoad', () => {
    it('dispatches ActiveMapItemActions.addInitialMapItems with the correct initial Maps', () => {
      const mapConfigStateMock: MapConfigState = {
        initialMaps: ['1'],
      } as MapConfigState;
      const mapMock = [{id: '1'}] as Map[];
      const activeMapItemMock = ActiveMapItemFactory.createGb2WmsMapItem(mapMock[0]);

      store.overrideSelector(selectMaps, mapMock);
      store.overrideSelector(selectMapConfigState, mapConfigStateMock);
      const expectedAction = ActiveMapItemActions.addInitialMapItems({initialMapItems: [activeMapItemMock]});
      actions$ = of(LayerCatalogActions.setLayerCatalog({items: []}));
      effects.handleInitialMapLoad.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });

    it('dispatches LayerCatalogActions.setInitialMapsError if a map is not found', () => {
      const mapConfigStateMock: MapConfigState = {
        initialMaps: ['1'],
      } as MapConfigState;
      const mapMock = [{id: '2'}] as Map[];

      store.overrideSelector(selectMaps, mapMock);
      store.overrideSelector(selectMapConfigState, mapConfigStateMock);
      const expectedError = new InitialMapIdsParameterInvalid(mapConfigStateMock.initialMaps[0]);
      const expectedAction = LayerCatalogActions.setInitialMapsError({error: expectedError});
      actions$ = of(LayerCatalogActions.setLayerCatalog({items: []}));
      effects.handleInitialMapLoad.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });

    it('also reacts on MapConfigActions.setInitialMapConfig', () => {
      const mapConfigStateMock: MapConfigState = {
        initialMaps: ['1'],
      } as MapConfigState;
      const mapMock = [{id: '1'}] as Map[];
      const activeMapItemMock = ActiveMapItemFactory.createGb2WmsMapItem(mapMock[0]);

      store.overrideSelector(selectMaps, mapMock);
      store.overrideSelector(selectMapConfigState, mapConfigStateMock);
      const expectedAction = ActiveMapItemActions.addInitialMapItems({initialMapItems: [activeMapItemMock]});
      actions$ = of(
        MapConfigActions.setInitialMapConfig({x: undefined, y: undefined, scale: undefined, basemapId: '', initialMaps: ['1']}),
      );
      effects.handleInitialMapLoad.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });

    it('filters when availableMaps is empty', async () => {
      vi.useFakeTimers();

      const mapConfigStateMock: MapConfigState = {
        initialMaps: ['1'],
      } as MapConfigState;

      store.overrideSelector(selectMaps, []);
      store.overrideSelector(selectMapConfigState, mapConfigStateMock);
      let actualAction;
      actions$ = of(LayerCatalogActions.setLayerCatalog({items: []}));
      effects.handleInitialMapLoad.subscribe((action) => (actualAction = action));
      await vi.runAllTimersAsync();
      expect(actualAction).toBeUndefined();

      vi.useRealTimers();
    });

    it('filters when initialMaps is empty', async () => {
      vi.useFakeTimers();

      const mapConfigStateMock: MapConfigState = {
        initialMaps: [] as string[],
      } as MapConfigState;
      const mapMock = [{id: '1'}] as Map[];

      store.overrideSelector(selectMaps, mapMock);
      store.overrideSelector(selectMapConfigState, mapConfigStateMock);
      let actualAction;
      actions$ = of(LayerCatalogActions.setLayerCatalog({items: []}));
      effects.handleInitialMapLoad.subscribe((action) => (actualAction = action));
      await vi.runAllTimersAsync();
      expect(actualAction).toBeUndefined();

      vi.useRealTimers();
    });
  });

  describe('setErrorForInvalidInitialMapIds$', () => {
    it('throws an InitialMapsCouldNotBeLoaded error', () => {
      store.overrideSelector(selectIsAuthenticated, true);
      const originalError = new Error('error');
      actions$ = of(LayerCatalogActions.setInitialMapsError({error: originalError}));
      effects.setErrorForInvalidInitialMapIds$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new InitialMapsCouldNotBeLoaded(true, originalError);
            expect(error).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });
});
