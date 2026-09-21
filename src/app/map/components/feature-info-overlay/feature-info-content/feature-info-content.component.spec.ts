import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {MAP_SERVICE} from 'src/app/app.tokens';
import {FeatureInfoResultLayer} from 'src/app/shared/interfaces/feature-info.interface';
import {selectPinnedFeatureId} from 'src/app/state/map/reducers/feature-info.reducer';
import {FeatureInfoContentComponent} from './feature-info-content.component';

describe('FeatureInfoContentComponent', () => {
  let fixture: ComponentFixture<FeatureInfoContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureInfoContentComponent],
      providers: [
        provideMockStore({selectors: [{selector: selectPinnedFeatureId, value: undefined}]}),
        {provide: MAP_SERVICE, useValue: {zoomToExtent: vi.fn()}},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureInfoContentComponent);
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
