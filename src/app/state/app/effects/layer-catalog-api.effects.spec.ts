import {TestBed} from '@angular/core/testing';
import {Observable, of, throwError} from 'rxjs';
import {Action, provideStore, Store} from '@ngrx/store';
import {provideEffects} from '@ngrx/effects';
import {provideMockActions} from '@ngrx/effects/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {LayerCatalogApiEffects} from './layer-catalog-api.effects';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {TopicsCouldNotBeLoaded} from '../../../shared/errors/map.errors';
import {LayerCatalogActions} from '../../map/actions/layer-catalog.actions';
import {selectItems} from '../../map/reducers/layer-catalog.reducer';
import {reducers, rootEffects} from '../../index';

describe('LayerCatalogApiEffects', () => {
  let actions$: Observable<Action>;
  let effects: LayerCatalogApiEffects;
  let store: MockStore;
  let gb3TopicsService: Gb3TopicsService;
  beforeEach(() => {
    actions$ = new Observable<Action>();
    TestBed.configureTestingModule({
      providers: [LayerCatalogApiEffects, provideMockActions(() => actions$), provideMockStore()],
    });
    effects = TestBed.inject(LayerCatalogApiEffects);
    store = TestBed.inject(MockStore);
    gb3TopicsService = TestBed.inject(Gb3TopicsService);
  });
  afterEach(() => store.resetSelectors());
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
      const spy = vi.spyOn(gb3TopicsService, 'loadTopics').mockReturnValue(of({topics: mockItems}));
      actions$ = of(LayerCatalogActions.loadLayerCatalog());
      effects.requestLayerCatalog$.subscribe((action) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(expectedAction);
      });
    });

    it('throws a TopicsCouldNotBeLoaded error if the Topicservice fails', () => {
      store.overrideSelector(selectItems, []);
      const originalError = new Error('oh no! butterfingers');
      const spy = vi.spyOn(gb3TopicsService, 'loadTopics').mockReturnValue(throwError(() => originalError));
      actions$ = of(LayerCatalogActions.loadLayerCatalog());
      effects.requestLayerCatalog$.subscribe({
        error: (error: unknown) => {
          expect(spy).toHaveBeenCalledTimes(1);
          expect(error).toBeInstanceOf(TopicsCouldNotBeLoaded);
          expect((error as TopicsCouldNotBeLoaded).originalError).toEqual(originalError);
        },
      });
    });
  });
});

describe('Root catalogue registration', () => {
  it('loads catalogue data without registering the map runtime', () => {
    const items = [{title: 'Homepage maps', maps: []}];
    const loadTopics = vi.fn().mockReturnValue(of({topics: items}));
    TestBed.configureTestingModule({
      providers: [
        provideStore(reducers),
        provideEffects(rootEffects.filter((effect) => effect === LayerCatalogApiEffects)),
        {provide: Gb3TopicsService, useValue: {loadTopics}},
      ],
    });
    const store = TestBed.inject(Store);
    store.dispatch(LayerCatalogActions.loadLayerCatalog());
    expect(loadTopics).toHaveBeenCalledOnce();
    expect(store.selectSignal(selectItems)()).toEqual(items);
  });
});
