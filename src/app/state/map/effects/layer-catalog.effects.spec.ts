import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {LayerCatalogEffects} from './layer-catalog.effects';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {selectMaps} from '../selectors/maps.selector';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';
import {Map} from '../../../shared/interfaces/topic.interface';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {SomeTopicsCouldNotBeLoaded} from '../../../shared/errors/initial-maps.errors';
import {selectPendingInitialTopicIds} from '../reducers/layer-catalog.reducer';
import {ErrorHandler} from '@angular/core';

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

  describe('handleInitialTopicLoad$', () => {
    it('loads valid topics in URL order and reports unknown topic ids', () => {
      const pendingTopicIds = ['1', 'unknown', '2'];
      const mapMock = [{id: '1'}, {id: '2'}] as Map[];

      store.overrideSelector(selectMaps, mapMock);
      store.overrideSelector(selectPendingInitialTopicIds, pendingTopicIds);
      const errorHandlerSpy = vi.spyOn(TestBed.inject(ErrorHandler), 'handleError');
      actions$ = of(LayerCatalogActions.setLayerCatalog({items: []}));

      effects.handleInitialTopicLoad$.subscribe((action) => {
        expect(action).toEqual(
          ActiveMapItemActions.addInitialMapItems({
            initialMapItems: mapMock.map((mapItem) => ActiveMapItemFactory.createGb2WmsMapItem(mapItem)),
          }),
        );
        expect(errorHandlerSpy).toHaveBeenCalledWith(new SomeTopicsCouldNotBeLoaded(['unknown']));
      });
    });

    it('completes initialization and reports a warning if all topic ids are unknown', () => {
      store.overrideSelector(selectMaps, [{id: '1'}] as Map[]);
      store.overrideSelector(selectPendingInitialTopicIds, ['unknown']);
      const errorHandlerSpy = vi.spyOn(TestBed.inject(ErrorHandler), 'handleError');
      actions$ = of(LayerCatalogActions.setInitialTopics({topicIds: ['unknown']}));

      effects.handleInitialTopicLoad$.subscribe((action) => {
        expect(action).toEqual(ActiveMapItemActions.addInitialMapItems({initialMapItems: []}));
        expect(errorHandlerSpy).toHaveBeenCalledWith(new SomeTopicsCouldNotBeLoaded(['unknown']));
      });
    });

    it('waits until the layer catalogue is available', async () => {
      vi.useFakeTimers();
      store.overrideSelector(selectMaps, []);
      store.overrideSelector(selectPendingInitialTopicIds, ['requested']);
      actions$ = of(LayerCatalogActions.setInitialTopics({topicIds: ['requested']}));
      let actualAction;

      effects.handleInitialTopicLoad$.subscribe((action) => (actualAction = action));
      await vi.runAllTimersAsync();

      expect(actualAction).toBeUndefined();
      vi.useRealTimers();
    });
  });

  describe('clearInitialTopicsAfterLoad$', () => {
    it('clears pending topics after initial map items were added', () => {
      store.overrideSelector(selectPendingInitialTopicIds, ['requested']);
      actions$ = of(ActiveMapItemActions.addInitialMapItems({initialMapItems: []}));

      effects.clearInitialTopicsAfterLoad$.subscribe((action) => {
        expect(action).toEqual(LayerCatalogActions.clearInitialTopics());
      });
    });
  });
});
