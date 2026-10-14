import {TestBed} from '@angular/core/testing';
import {FeatureHighlightingService} from './feature-highlighting.service';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MapServiceStub} from '../../testing/map-testing/map.service.stub';
import {MAP_SERVICE} from '../../app.tokens';
import {BehaviorSubject, finalize, of} from 'rxjs';
import {MapDrawingService} from './map-drawing.service';
import {selectHighlightedFeature, selectHighlightedFeatureSource} from '../../state/map/reducers/feature-info.reducer';
import {selectQueryMode} from '../../state/map/reducers/query-mode.reducer';
import {selectIsMapServiceInitialized, selectReady} from '../../state/map/reducers/map-config.reducer';
import {PointWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';
import {selectFeatureHighlightToDraw} from 'src/app/state/map/selectors/query-graphics.selector';

describe('FeatureHighlightingService', () => {
  let service: FeatureHighlightingService;
  let store: MockStore;
  let visibility: BehaviorSubject<boolean>;
  let mapService: MapServiceStub;
  const geometry: PointWithSrs = {type: 'Point', srs: 2056, coordinates: [2680000, 1254000]};
  const drawing = {drawFeatureInfoHighlight: vi.fn(), clearFeatureInfoHighlight: vi.fn()};
  const source = {mapItemId: 'map_layer', layerName: 'layer'};

  const initialFeatureHighlightToDrawState = {
    geometry: undefined,
    source: undefined,
    ready: false,
  };

  beforeEach(() => {
    visibility = new BehaviorSubject(true);
    TestBed.configureTestingModule({
      providers: [
        FeatureHighlightingService,
        provideMockStore({
          selectors: [{selector: selectReady, value: true}],
        }),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
        {provide: MapDrawingService, useValue: drawing},
      ],
    });
    store = TestBed.inject(MockStore);
    mapService = TestBed.inject<MapServiceStub>(MAP_SERVICE);
    vi.spyOn(mapService, 'observeFeatureInfoLayerVisibility').mockReturnValue(visibility);
    service = TestBed.inject(FeatureHighlightingService);
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectHighlightedFeature, geometry);
    store.overrideSelector(selectQueryMode, 'feature');
    store.overrideSelector(selectReady, true);
    store.overrideSelector(selectIsMapServiceInitialized, true);
  });

  function selectFeature() {
    store.overrideSelector(selectFeatureHighlightToDraw, {
      geometry,
      source,
      ready: true,
    });
    store.refreshState();
  }

  it('hides and restores the graphic without clearing the selection', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    service.init();
    selectFeature();
    expect(mapService.observeFeatureInfoLayerVisibility).toHaveBeenCalledWith(source);
    expect(drawing.drawFeatureInfoHighlight).toHaveBeenCalledWith(geometry);
    drawing.clearFeatureInfoHighlight.mockClear();
    visibility.next(false);
    expect(drawing.clearFeatureInfoHighlight).toHaveBeenCalledOnce();
    visibility.next(true);
    expect(drawing.drawFeatureInfoHighlight).toHaveBeenCalledTimes(2);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does not draw hover highlights while the source is invisible', () => {
    visibility.next(false);
    service.init();
    selectFeature();
    expect(drawing.drawFeatureInfoHighlight).not.toHaveBeenCalled();
    visibility.next(true);
    expect(drawing.drawFeatureInfoHighlight).toHaveBeenCalledWith(geometry);
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
    store.overrideSelector(selectFeatureHighlightToDraw, initialFeatureHighlightToDrawState);
    store.refreshState();
    expect(unsubscribe).toHaveBeenCalledOnce();
    drawing.drawFeatureInfoHighlight.mockClear();
    visibility.next(true);
    expect(drawing.drawFeatureInfoHighlight).not.toHaveBeenCalled();
  });

  it('unsubscribes and removes the graphic on destruction', () => {
    const unsubscribe = vi.fn();
    vi.spyOn(mapService, 'observeFeatureInfoLayerVisibility').mockReturnValue(visibility.pipe(finalize(unsubscribe)));
    service.init();
    selectFeature();
    service.ngOnDestroy();
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(drawing.clearFeatureInfoHighlight).toHaveBeenCalled();
  });

  it('hides retained markings outside features and restores them on return', () => {
    store.overrideSelector(selectReady, true);
    store.overrideSelector(selectFeatureHighlightToDraw, {geometry, source, ready: true});
    store.refreshState();
    service.init();
    expect(drawing.drawFeatureInfoHighlight).toHaveBeenLastCalledWith(geometry);
    drawing.drawFeatureInfoHighlight.mockClear();
    store.overrideSelector(selectFeatureHighlightToDraw, {geometry: undefined, source, ready: true});
    store.refreshState();
    expect(drawing.clearFeatureInfoHighlight).toHaveBeenCalledTimes(2);
    expect(drawing.drawFeatureInfoHighlight).not.toHaveBeenCalled();
    store.overrideSelector(selectFeatureHighlightToDraw, {geometry, source, ready: true});
    store.refreshState();
    expect(drawing.drawFeatureInfoHighlight).toHaveBeenLastCalledWith(geometry);
  });

  it('avoids uninitialized maps and restores cached geometry after recreation', () => {
    drawing.drawFeatureInfoHighlight.mockClear();
    store.overrideSelector(selectReady, false);
    store.overrideSelector(selectFeatureHighlightToDraw, {geometry, source, ready: true});
    store.refreshState();
    service.init();
    expect(drawing.drawFeatureInfoHighlight).not.toHaveBeenCalled();
    expect(drawing.clearFeatureInfoHighlight).toHaveBeenCalled();
    store.overrideSelector(selectReady, true);
    store.refreshState();
    expect(drawing.drawFeatureInfoHighlight).toHaveBeenCalledOnce();
    drawing.drawFeatureInfoHighlight.mockClear();
    store.overrideSelector(selectReady, false);
    store.refreshState();
    store.overrideSelector(selectReady, true);
    store.refreshState();
    expect(drawing.drawFeatureInfoHighlight).toHaveBeenCalledOnce();
  });

  it('waits for readiness as well as initialization', () => {
    drawing.drawFeatureInfoHighlight.mockClear();
    store.overrideSelector(selectReady, false);
    store.overrideSelector(selectFeatureHighlightToDraw, {geometry, source, ready: true});
    store.refreshState();
    service.init();
    expect(drawing.drawFeatureInfoHighlight).not.toHaveBeenCalled();
    store.overrideSelector(selectReady, true);
    store.refreshState();
    expect(drawing.drawFeatureInfoHighlight).toHaveBeenCalledOnce();
  });

  it('keeps one subscription across repeated initialization and tears it down', () => {
    store.overrideSelector(selectReady, false);
    store.refreshState();
    drawing.clearFeatureInfoHighlight.mockClear();
    service.init();
    service.init();
    store.overrideSelector(selectFeatureHighlightToDraw, {geometry: undefined, source: undefined, ready: false});
    store.refreshState();
    expect(drawing.clearFeatureInfoHighlight).toHaveBeenCalledOnce();
    service.ngOnDestroy();
    drawing.clearFeatureInfoHighlight.mockClear();
    store.overrideSelector(selectFeatureHighlightToDraw, {geometry, source, ready: true});
    store.refreshState();
    expect(drawing.clearFeatureInfoHighlight).not.toHaveBeenCalled();
  });
});
