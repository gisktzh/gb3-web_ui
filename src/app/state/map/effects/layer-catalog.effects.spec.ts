import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {LayerCatalogEffects} from './layer-catalog.effects';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {selectMaps} from '../selectors/maps.selector';
import {selectMapConfigState} from '../reducers/map-config.reducer';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';
import {MapConfigState} from '../states/map-config.state';
import {Map} from '../../../shared/interfaces/topic.interface';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {UrlActions} from '../../app/actions/url.actions';
import {InitialMapsParameterInvalid} from '../../../shared/errors/initial-maps.errors';

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

  describe('handleInitialMapLoad', () => {
    it('dispatches ActiveMapItemActions.addInitialMapItems with the correct inital Maps', () => {
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
    it('dispatches UrlActions.setInitialMapsError if a map is not found', (done: DoneFn) => {
      const mapConfigStateMock: MapConfigState = {
        initialMaps: ['1'],
      } as MapConfigState;
      const mapMock = [] as Map[];

      store.overrideSelector(selectMaps, mapMock);
      store.overrideSelector(selectMapConfigState, mapConfigStateMock);
      const expectedError = new InitialMapsParameterInvalid(mapConfigStateMock.initialMaps[0]);
      const expectedAction = UrlActions.setInitialMapsError({error: expectedError});
      actions$ = of(LayerCatalogActions.setLayerCatalog({items: []}));
      effects.handleInitialMapLoad.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });
});
