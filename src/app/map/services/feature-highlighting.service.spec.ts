import {TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {BehaviorSubject, finalize} from 'rxjs';
import {FeatureHighlightingService} from './feature-highlighting.service';
import {MapDrawingService} from './map-drawing.service';
import {MAP_SERVICE} from '../../app.tokens';
import {MapServiceStub} from '../../testing/map-testing/map.service.stub';
import {selectFeatureHighlightToDraw} from 'src/app/state/map/selectors/query-graphics.selector';
import {PointWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';

describe('FeatureHighlightingService', () => {
  let service: FeatureHighlightingService;
  let store: MockStore;
  let visibility: BehaviorSubject<boolean>;
  let mapService: MapServiceStub;

  const geometry: PointWithSrs = {
    type: 'Point',
    srs: 2056,
    coordinates: [2680000, 1254000],
  };

  const drawing = {
    drawFeatureInfoHighlight: vi.fn(),
    clearFeatureInfoHighlight: vi.fn(),
  };

  const source = {
    mapItemId: 'map_layer',
    layerName: 'layer',
  };

  const initialState = {
    geometry: undefined,
    source: undefined,
    ready: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    visibility = new BehaviorSubject(true);

    TestBed.configureTestingModule({
      providers: [
        FeatureHighlightingService,
        provideMockStore({
          selectors: [{selector: selectFeatureHighlightToDraw, value: initialState}],
        }),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
        {provide: MapDrawingService, useValue: drawing},
      ],
    });

    store = TestBed.inject(MockStore);
    mapService = TestBed.inject<MapServiceStub>(MAP_SERVICE);
    vi.spyOn(mapService, 'observeFeatureInfoLayerVisibility').mockReturnValue(visibility);

    service = TestBed.inject(FeatureHighlightingService);
  });

  function selectCandidate(
    candidate: typeof initialState | {geometry: PointWithSrs | undefined; source: typeof source | undefined; ready: boolean},
  ) {
    store.overrideSelector(selectFeatureHighlightToDraw, candidate);
    store.refreshState();
  }

  function selectFeature() {
    selectCandidate({geometry, source, ready: true});
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

  it('does not draw while the source is invisible', () => {
    visibility.next(false);

    service.init();
    selectFeature();

    expect(drawing.drawFeatureInfoHighlight).not.toHaveBeenCalled();

    visibility.next(true);

    expect(drawing.drawFeatureInfoHighlight).toHaveBeenCalledWith(geometry);
  });

  it('does not observe visibility when the candidate is not ready', () => {
    service.init();
    selectCandidate({geometry, source, ready: false});

    expect(mapService.observeFeatureInfoLayerVisibility).not.toHaveBeenCalled();
    expect(drawing.drawFeatureInfoHighlight).not.toHaveBeenCalled();
  });

  it('removes the old visibility subscription when the candidate is cleared', () => {
    const unsubscribe = vi.fn();

    vi.spyOn(mapService, 'observeFeatureInfoLayerVisibility').mockReturnValue(visibility.pipe(finalize(unsubscribe)));

    service.init();
    selectFeature();

    selectCandidate(initialState);

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

  it('clears the highlight when geometry becomes unavailable and restores it when geometry returns', () => {
    service.init();
    selectFeature();

    expect(drawing.drawFeatureInfoHighlight).toHaveBeenLastCalledWith(geometry);

    drawing.drawFeatureInfoHighlight.mockClear();
    drawing.clearFeatureInfoHighlight.mockClear();

    selectCandidate({geometry: undefined, source, ready: true});

    expect(drawing.clearFeatureInfoHighlight).toHaveBeenCalledOnce();
    expect(drawing.drawFeatureInfoHighlight).not.toHaveBeenCalled();

    selectFeature();

    expect(drawing.drawFeatureInfoHighlight).toHaveBeenCalledWith(geometry);
  });

  it('keeps one subscription across repeated initialization and tears it down', () => {
    service.init();
    service.init();

    selectFeature();

    expect(mapService.observeFeatureInfoLayerVisibility).toHaveBeenCalledOnce();

    service.ngOnDestroy();

    drawing.clearFeatureInfoHighlight.mockClear();
    drawing.drawFeatureInfoHighlight.mockClear();

    selectFeature();

    expect(drawing.clearFeatureInfoHighlight).not.toHaveBeenCalled();
    expect(drawing.drawFeatureInfoHighlight).not.toHaveBeenCalled();
  });
});
