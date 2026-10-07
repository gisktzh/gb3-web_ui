import {TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {FeatureInfoContentComponent} from './feature-info-content.component';
import {MAP_SERVICE} from '../../../../app.tokens';
import {MapServiceStub} from '../../../../testing/map-testing/map.service.stub';
import {selectPinnedFeatureId} from '../../../../state/map/reducers/feature-info.reducer';
import {FeatureInfoActions} from '../../../../state/map/actions/feature-info.actions';
import {GeometryWithSrs} from '../../../../shared/interfaces/geojson-types-with-srs.interface';

describe('FeatureInfoContentComponent marking', () => {
  let component: FeatureInfoContentComponent;
  let mapService: MapServiceStub;
  let store: MockStore;
  const geometry: GeometryWithSrs = {type: 'Point', srs: 2056, coordinates: [1, 2]};
  const source = {mapItemId: 'topic_layer', layerName: 'layer'};

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FeatureInfoContentComponent],
      providers: [
        provideMockStore({selectors: [{selector: selectPinnedFeatureId, value: undefined}]}),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
      ],
    });
    const fixture = TestBed.createComponent(FeatureInfoContentComponent);
    fixture.componentRef.setInput('topicId', source.mapItemId);
    fixture.componentRef.setInput('layer', {layer: source.layerName, title: 'Layer', features: [{fid: 1, geometry, fields: []}]});
    fixture.detectChanges();
    component = fixture.componentInstance;
    mapService = TestBed.inject<MapServiceStub>(MAP_SERVICE);
    store = TestBed.inject(MockStore);
  });

  it('marks the exact displayed source and forwards its range to the zoom', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    const zoom = vi.spyOn(mapService, 'zoomToExtent');
    const range = {minScale: 10000, maxScale: 50000};
    const resolve = vi.spyOn(mapService, 'getFeatureInfoScaleRange').mockReturnValue(range);
    component.toggleHighlightForFeature(1, true);
    expect(dispatch).toHaveBeenCalledWith(
      FeatureInfoActions.highlightFeature({feature: geometry, source, pinnedFeatureId: 'topic_layer_layer_1'}),
    );
    expect(resolve).toHaveBeenCalledWith(source);
    expect(zoom).toHaveBeenCalledWith(geometry, undefined, undefined, range);
  });

  it('does not zoom to an unresolved layer', () => {
    vi.spyOn(mapService, 'getFeatureInfoScaleRange').mockReturnValue(undefined);
    const zoom = vi.spyOn(mapService, 'zoomToExtent');
    component.toggleHighlightForFeature(1, true);
    expect(zoom).not.toHaveBeenCalled();
  });

  it('passes source context for hover without zooming or pinning', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    const zoom = vi.spyOn(mapService, 'zoomToExtent');
    component.onFeatureHoverStart(1);
    expect(dispatch).toHaveBeenCalledWith(FeatureInfoActions.highlightFeature({feature: geometry, source, pinnedFeatureId: undefined}));
    expect(zoom).not.toHaveBeenCalled();
  });
});
