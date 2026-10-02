import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MAP_SERVICE} from 'src/app/app.tokens';
import {FeatureInfoResultLayer} from 'src/app/shared/interfaces/feature-info.interface';
import {selectPinnedFeatureId} from 'src/app/state/map/reducers/feature-info.reducer';
import {FeatureInfoContentComponent} from './feature-info-content.component';
import {FeatureInfoActions} from '../../../../state/map/actions/feature-info.actions';

describe('FeatureInfoContentComponent', () => {
  let fixture: ComponentFixture<FeatureInfoContentComponent>;
  const mapService = {zoomToExtent: vi.fn()};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureInfoContentComponent],
      providers: [
        provideMockStore({selectors: [{selector: selectPinnedFeatureId, value: undefined}]}),
        {provide: MAP_SERVICE, useValue: mapService},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureInfoContentComponent);
  });

  it('pins on keyboard activation without losing feature zoom and unpins on repeated activation', () => {
    const geometry = {type: 'Point' as const, srs: 2056 as const, coordinates: [2680000, 1254000]};
    fixture.componentRef.setInput('topicId', 'topic');
    fixture.componentRef.setInput('layer', {
      layer: 'layer',
      title: 'Layer',
      features: [{fid: 1, geometry, fields: [{label: 'Value', type: 'text', value: 'one'}]}],
    } satisfies FeatureInfoResultLayer);
    fixture.detectChanges();
    const store = TestBed.inject(MockStore);
    const dispatch = vi.spyOn(store, 'dispatch');
    const radio: HTMLInputElement = fixture.nativeElement.querySelector('input[type="radio"]');
    radio.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true, cancelable: true}));
    expect(dispatch).toHaveBeenLastCalledWith(FeatureInfoActions.highlightFeature({feature: geometry, pinnedFeatureId: 'topic_layer_1'}));
    expect(mapService.zoomToExtent).toHaveBeenCalledExactlyOnceWith(geometry);
    store.overrideSelector(selectPinnedFeatureId, 'topic_layer_1');
    store.refreshState();
    fixture.detectChanges();
    radio.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true, cancelable: true}));
    expect(dispatch).toHaveBeenLastCalledWith(FeatureInfoActions.clearHighlight());
    store.overrideSelector(selectPinnedFeatureId, undefined);
    store.refreshState();
    expect(fixture.componentInstance.highlightedFeatureId()).toBeUndefined();
    expect(mapService.zoomToExtent).toHaveBeenCalledOnce();
  });

  it('aligns reordered fields and pads missing values while preserving duplicate labels', () => {
    const layer: FeatureInfoResultLayer = {
      layer: 'test-layer',
      title: 'Test layer',
      features: [
        {
          fid: 1,
          geometry: undefined,
          fields: [
            {label: 'A', type: 'text', value: 'A1'},
            {label: 'Duplicate', type: 'text', value: 'D1'},
            {label: 'Duplicate', type: 'text', value: 'D2'},
          ],
        },
        {
          fid: 2,
          geometry: undefined,
          fields: [
            {label: 'Duplicate', type: 'text', value: 'D3'},
            {label: 'A', type: 'text', value: 'A2'},
            {label: 'B', type: 'text', value: 'B2'},
          ],
        },
      ],
    };
    fixture.componentRef.setInput('layer', layer);

    const data = fixture.componentInstance.tableData();

    expect(data.rows.map(({label}) => label)).toEqual(['A', 'Duplicate', 'Duplicate', 'B']);
    expect(data.rows.map(({cells}) => cells.map(({displayValue}) => displayValue))).toEqual([
      ['A1', 'A2'],
      ['D1', 'D3'],
      ['D2', '-'],
      ['-', 'B2'],
    ]);
  });
});
