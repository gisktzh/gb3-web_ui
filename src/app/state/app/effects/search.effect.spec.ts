import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MAP_SERVICE} from '../../../app.module';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {SearchEffects} from './search.effects';
import {SearchActions} from '../actions/search.actions';
import {GeometrySearchApiResultMatch} from '../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {MapUiActions} from '../../map/actions/map-ui.actions';
import {selectUrlState} from '../reducers/url.reducer';
import {MainPage} from '../../../shared/enums/main-page.enum';

describe('SearchEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: SearchEffects;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SearchEffects, provideMockActions(() => actions$), provideMockStore(), {provide: MAP_SERVICE, useClass: MapServiceStub}],
    });
    effects = TestBed.inject(SearchEffects);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('zoomToAndHighlightSelectedSearchResult$', () => {
    it('calls mapService.zoomToExtent and MapDrawingSerivce.drawSearchResultHighlight', (done: DoneFn) => {
      const mapService = TestBed.inject(MAP_SERVICE);
      const mapServiceSpy = spyOn(mapService, 'zoomToExtent').and.callThrough();
      const mapDrawingService = TestBed.inject(MapDrawingService);
      const mapDrawingServiceSpy = spyOn(mapDrawingService, 'drawSearchResultHighlight').and.callThrough();

      const searchResultsMock: GeometrySearchApiResultMatch = {
        indexType: 'places',
        displayString: 'Some Place',
        score: 1,
        geometry: {type: 'Point', srs: 2056, coordinates: [1, 2]},
      };

      const expectedAction = SearchActions.selectMapSearchResult({
        searchResult: searchResultsMock,
      });
      actions$ = of(expectedAction);
      effects.zoomToAndHighlightSelectedSearchResult$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledTimes(1);
        expect(mapDrawingServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('clearSearchTermAfterFeatureInfoOpened$', () => {
    it('dispatches SearchActions.clearSearchTerm() if FeatureInfo is opened', (done: DoneFn) => {
      actions$ = of(MapUiActions.setFeatureInfoVisibility({isVisible: true}));
      effects.clearSearchTermAfterFeatureInfoOpened$.subscribe((action) => {
        expect(action).toEqual(SearchActions.clearSearchTerm());
        done();
      });
    });

    it('dispatches nothing when FeatureINfo is closed', fakeAsync(async () => {
      let newAction;

      actions$ = of(MapUiActions.setFeatureInfoVisibility({isVisible: false}));
      effects.clearSearchTermAfterFeatureInfoOpened$.subscribe((action) => (newAction = action));
      flush();

      expect(newAction).toBeUndefined();
    }));
  });

  describe('removeHighlightAfterChangingSearchTermOrClearingSearchResult$', () => {
    it('calls mapDrawingService.clearSearchResultHighlight() if on map-page', (done: DoneFn) => {
      store.overrideSelector(selectUrlState, {
        mainPage: MainPage.Maps,
        isHeadlessPage: false,
        isSimplifiedPage: false,
        previousPage: MainPage.Data,
      });

      const mapDrawingService = TestBed.inject(MapDrawingService);
      const mapDrawingServiceSpy = spyOn(mapDrawingService, 'clearSearchResultHighlight').and.callThrough();

      actions$ = of(SearchActions.clearSearchTerm());
      effects.removeHighlightAfterChangingSearchTermOrClearingSearchResult$.subscribe((action) => {
        expect(mapDrawingServiceSpy).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('dispatches nothing when on any other page than map-page', fakeAsync(async () => {
      store.overrideSelector(selectUrlState, {
        mainPage: MainPage.Start,
        isHeadlessPage: false,
        isSimplifiedPage: false,
        previousPage: MainPage.Data,
      });

      let newAction;
      actions$ = of(MapUiActions.setFeatureInfoVisibility({isVisible: false}));
      effects.clearSearchTermAfterFeatureInfoOpened$.subscribe((action) => (newAction = action));
      flush();

      expect(newAction).toBeUndefined();
    }));
  });
});
