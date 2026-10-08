import {TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {FeatureHighlightingService} from './feature-highlighting.service';
import {MapDrawingService} from './map-drawing.service';
import {selectHighlightedFeature} from '../../state/map/reducers/feature-info.reducer';
import {selectQueryMode} from '../../state/map/reducers/query-mode.reducer';
import {selectIsMapServiceInitialized, selectReady} from '../../state/map/reducers/map-config.reducer';
import {PointWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';

describe('FeatureHighlightingService', () => {
  let service: FeatureHighlightingService;
  let store: MockStore;
  const geometry: PointWithSrs = {type: 'Point', srs: 2056, coordinates: [2680000, 1254000]};
  const drawing = {drawFeatureInfoHighlight: vi.fn(), clearFeatureInfoHighlight: vi.fn()};

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FeatureHighlightingService, provideMockStore(), {provide: MapDrawingService, useValue: drawing}],
    });
    service = TestBed.inject(FeatureHighlightingService);
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectHighlightedFeature, geometry);
    store.overrideSelector(selectQueryMode, 'feature');
    store.overrideSelector(selectReady, true);
    store.overrideSelector(selectIsMapServiceInitialized, true);
  });

  it('hides retained markings outside features and restores them on return', () => {
    service.init();
    expect(drawing.drawFeatureInfoHighlight).toHaveBeenLastCalledWith(geometry);
    drawing.drawFeatureInfoHighlight.mockClear();
    store.overrideSelector(selectQueryMode, 'statistics');
    store.refreshState();
    expect(drawing.clearFeatureInfoHighlight).toHaveBeenCalledTimes(2);
    expect(drawing.drawFeatureInfoHighlight).not.toHaveBeenCalled();
    store.overrideSelector(selectQueryMode, 'feature');
    store.refreshState();
    expect(drawing.drawFeatureInfoHighlight).toHaveBeenLastCalledWith(geometry);
  });

  it('avoids uninitialized maps and restores cached geometry after recreation', () => {
    store.overrideSelector(selectIsMapServiceInitialized, false);
    service.init();
    expect(drawing.drawFeatureInfoHighlight).not.toHaveBeenCalled();
    expect(drawing.clearFeatureInfoHighlight).not.toHaveBeenCalled();
    store.overrideSelector(selectIsMapServiceInitialized, true);
    store.refreshState();
    expect(drawing.drawFeatureInfoHighlight).toHaveBeenCalledOnce();
    store.overrideSelector(selectIsMapServiceInitialized, false);
    store.refreshState();
    store.overrideSelector(selectIsMapServiceInitialized, true);
    store.refreshState();
    expect(drawing.drawFeatureInfoHighlight).toHaveBeenCalledTimes(2);
  });

  it('waits for readiness as well as initialization', () => {
    store.overrideSelector(selectReady, false);
    service.init();
    expect(drawing.clearFeatureInfoHighlight).not.toHaveBeenCalled();
    store.overrideSelector(selectReady, true);
    store.refreshState();
    expect(drawing.drawFeatureInfoHighlight).toHaveBeenCalledOnce();
  });

  it('keeps one subscription across repeated initialization and tears it down', () => {
    service.init();
    service.init();
    drawing.clearFeatureInfoHighlight.mockClear();
    store.overrideSelector(selectHighlightedFeature, undefined);
    store.refreshState();
    expect(drawing.clearFeatureInfoHighlight).toHaveBeenCalledOnce();
    service.ngOnDestroy();
    drawing.clearFeatureInfoHighlight.mockClear();
    store.overrideSelector(selectHighlightedFeature, geometry);
    store.refreshState();
    expect(drawing.clearFeatureInfoHighlight).not.toHaveBeenCalled();
  });
});
