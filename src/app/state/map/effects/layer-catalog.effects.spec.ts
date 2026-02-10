import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {LayerCatalogEffects} from './layer-catalog.effects';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
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
import {selectItems} from '../reducers/layer-catalog.reducer';
import {TopicsCouldNotBeLoaded} from '../../../shared/errors/map.errors';
import {selectIsAuthenticated} from '../../auth/reducers/auth-status.reducer';
import {catchError} from 'rxjs';

describe('LayerCatalogEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: LayerCatalogEffects;
  let gb3TopicsService: Gb3TopicsService;

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
    gb3TopicsService = TestBed.inject(Gb3TopicsService);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('requestLayerCatalog$', () => {
    it('dispatches LayerCatalogActions.setLayerCatalog when there are already items in the store ', () => {
      const mockItems = [{title: 'Topic', maps: []}];
      store.overrideSelector(selectItems, mockItems);
      const expectedAction = LayerCatalogActions.setLayerCatalog({items: mockItems});
      actions$ = of(LayerCatalogActions.loadLayerCatalog());
      effects.requestLayerCatalog$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });

    it('calls the Topicservice and dispatches LayerCatalogActions.setLayerCatalog with the results if the store has no items yet', () => {
      const mockItems = [
        {title: 'Topic', maps: []},
        {title: 'Topic2', maps: []},
      ];
      store.overrideSelector(selectItems, []);
      const expectedAction = LayerCatalogActions.setLayerCatalog({items: mockItems});
      const spy = spyOn(gb3TopicsService, 'loadTopics').and.returnValue(of({topics: mockItems}));
      actions$ = of(LayerCatalogActions.loadLayerCatalog());
      effects.requestLayerCatalog$.subscribe((action) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(expectedAction);
      });
    });

    it('throws a TopicsCouldNotBeLoaded error if the Topicservice fails', (done: DoneFn) => {
      store.overrideSelector(selectItems, []);
      const originalError = new Error('oh no! butterfingers');
      const expectedError = new TopicsCouldNotBeLoaded();
      const spy = spyOn(gb3TopicsService, 'loadTopics').and.returnValue(throwError(() => originalError));
      actions$ = of(LayerCatalogActions.loadLayerCatalog());
      effects.requestLayerCatalog$.subscribe({
        error: (error: unknown) => {
          expect(spy).toHaveBeenCalledTimes(1);
          expect(error).toEqual(expectedError);
          done();
        },
      });
    });
  });

  describe('handleInitialMapLoad', () => {
    it('dispatches ActiveMapItemActions.addInitialMapItems with the correct inital Maps', (done: DoneFn) => {
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
        done();
      });
    });

    it('dispatches LayerCatalogActions.setInitialMapsError if a map is not found', (done: DoneFn) => {
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
        done();
      });
    });

    it('also reacts on MapConfigActions.setInitialMapConfig', (done: DoneFn) => {
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
        done();
      });
    });

    it('filters when availableMaps is empty', fakeAsync(() => {
      const mapConfigStateMock: MapConfigState = {
        initialMaps: ['1'],
      } as MapConfigState;

      store.overrideSelector(selectMaps, []);
      store.overrideSelector(selectMapConfigState, mapConfigStateMock);
      let actualAction;
      actions$ = of(LayerCatalogActions.setLayerCatalog({items: []}));
      effects.handleInitialMapLoad.subscribe((action) => (actualAction = action));
      flush();
      expect(actualAction).toBeUndefined();
    }));

    it('filters when initialMaps is empty', fakeAsync(() => {
      const mapConfigStateMock: MapConfigState = {
        initialMaps: [] as string[],
      } as MapConfigState;
      const mapMock = [{id: '1'}] as Map[];

      store.overrideSelector(selectMaps, mapMock);
      store.overrideSelector(selectMapConfigState, mapConfigStateMock);
      let actualAction;
      actions$ = of(LayerCatalogActions.setLayerCatalog({items: []}));
      effects.handleInitialMapLoad.subscribe((action) => (actualAction = action));
      flush();
      expect(actualAction).toBeUndefined();
    }));
  });

  describe('setErrorForInvalidInitialMapIds$', () => {
    it('throws an InitialMapsCouldNotBeLoaded error', (done: DoneFn) => {
      store.overrideSelector(selectIsAuthenticated, true);
      const originalError = new Error('error');
      actions$ = of(LayerCatalogActions.setInitialMapsError({error: originalError}));
      effects.setErrorForInvalidInitialMapIds$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new InitialMapsCouldNotBeLoaded(true, originalError);
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });
});
