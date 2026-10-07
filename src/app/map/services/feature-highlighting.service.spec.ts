import {TestBed} from '@angular/core/testing';
import {FeatureHighlightingService} from './feature-highlighting.service';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MapServiceStub} from '../../testing/map-testing/map.service.stub';
import {MAP_SERVICE} from '../../app.tokens';
import {initialState, selectFeatureInfoState} from '../../state/map/reducers/feature-info.reducer';
import {selectReady} from '../../state/map/reducers/map-config.reducer';
import {BehaviorSubject, finalize} from 'rxjs';
import {MapDrawingService} from './map-drawing.service';
import {GeometryWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';

describe('FeatureHighlightingService', () => {
  let service: FeatureHighlightingService;
  let store: MockStore;
  let visibility: BehaviorSubject<boolean>;
  let mapService: MapServiceStub;
  const geometry: GeometryWithSrs = {type: 'Point', srs: 2056, coordinates: [1, 2]};
  const source = {mapItemId: 'map_layer', layerName: 'layer'};
  const draw = vi.fn();
  const clear = vi.fn();

  beforeEach(() => {
    visibility = new BehaviorSubject(true);
    TestBed.configureTestingModule({
      providers: [
        FeatureHighlightingService,
        provideMockStore({
          selectors: [
            {selector: selectReady, value: true},
            {selector: selectFeatureInfoState, value: initialState},
          ],
        }),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
        {provide: MapDrawingService, useValue: {drawFeatureInfoHighlight: draw, clearFeatureInfoHighlight: clear}},
      ],
    });
    store = TestBed.inject(MockStore);
    mapService = TestBed.inject<MapServiceStub>(MAP_SERVICE);
    vi.spyOn(mapService, 'observeFeatureInfoLayerVisibility').mockReturnValue(visibility);
    service = TestBed.inject(FeatureHighlightingService);
  });

  function selectFeature(pinnedFeatureId?: string) {
    store.overrideSelector(selectFeatureInfoState, {
      ...initialState,
      highlightedFeature: geometry,
      highlightedFeatureSource: source,
      pinnedFeatureId,
    });
    store.refreshState();
  }

  it('hides and restores the graphic without clearing the selection', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    service.init();
    selectFeature('map_layer_1');
    expect(mapService.observeFeatureInfoLayerVisibility).toHaveBeenCalledWith(source);
    expect(draw).toHaveBeenCalledWith(geometry);
    clear.mockClear();
    visibility.next(false);
    expect(clear).toHaveBeenCalledOnce();
    visibility.next(true);
    expect(draw).toHaveBeenCalledTimes(2);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does not draw hover highlights while the source is invisible', () => {
    visibility.next(false);
    service.init();
    selectFeature(undefined);
    expect(draw).not.toHaveBeenCalled();
    visibility.next(true);
    expect(draw).toHaveBeenCalledWith(geometry);
  });

  it('waits for map readiness and subscribes only once on repeated init', () => {
    store.overrideSelector(selectReady, false);
    service.init();
    service.init();
    selectFeature();
    expect(mapService.observeFeatureInfoLayerVisibility).not.toHaveBeenCalled();
    store.overrideSelector(selectReady, true);
    store.refreshState();
    expect(mapService.observeFeatureInfoLayerVisibility).toHaveBeenCalledOnce();
  });

  it('removes the old visibility subscription when the selection is cleared', () => {
    const unsubscribe = vi.fn();
    vi.spyOn(mapService, 'observeFeatureInfoLayerVisibility').mockReturnValue(visibility.pipe(finalize(unsubscribe)));
    service.init();
    selectFeature();
    store.overrideSelector(selectFeatureInfoState, initialState);
    store.refreshState();
    expect(unsubscribe).toHaveBeenCalledOnce();
    draw.mockClear();
    visibility.next(true);
    expect(draw).not.toHaveBeenCalled();
  });

  it('unsubscribes and removes the graphic on destruction', () => {
    const unsubscribe = vi.fn();
    vi.spyOn(mapService, 'observeFeatureInfoLayerVisibility').mockReturnValue(visibility.pipe(finalize(unsubscribe)));
    service.init();
    selectFeature();
    service.ngOnDestroy();
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(clear).toHaveBeenCalled();
  });
});
