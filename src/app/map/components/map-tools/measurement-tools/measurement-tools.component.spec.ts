import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {ToolActions} from '../../../../state/map/actions/tool.actions';
import {MeasurementToolsComponent} from './measurement-tools.component';

describe('MeasurementToolsComponent', () => {
  let fixture: ComponentFixture<MeasurementToolsComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementToolsComponent],
      providers: [provideMockStore(), {provide: MatDialog, useValue: {open: vi.fn()}}],
    })
      .overrideComponent(MeasurementToolsComponent, {set: {template: '', imports: []}})
      .compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(MeasurementToolsComponent);
  });

  it.each([
    ['togglePointMeasurement', 'measure-point'],
    ['toggleLineMeasurement', 'measure-line'],
    ['toggleAreaMeasurement', 'measure-area'],
    ['toggleCircleMeasurement', 'measure-circle'],
    ['toggleElevationProfileMeasurement', 'measure-elevation-profile'],
  ] as const)('%s activates %s', (method, tool) => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance[method]();
    expect(dispatch).toHaveBeenCalledWith(ToolActions.activateTool({tool}));
  });
});
