import {Component, input, output} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {FeatureInfoResultDisplay} from '../../../shared/interfaces/feature-info.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {OverlayPrintActions} from '../../../state/map/actions/overlay-print-actions';
import {selectIsFeatureInfoOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {selectFeatureInfoPrintState} from '../../../state/map/reducers/overlay-print.reducer';
import {selectQueryMode} from '../../../state/map/reducers/query-mode.reducer';
import {selectFeatureInfoQueryLoadingState} from '../../../state/map/selectors/feature-info-query-loading-state.selector';
import {selectFeatureInfosForDisplay} from '../../../state/map/selectors/feature-info-result-display.selector';
import {MapOverlayComponent} from '../map-overlay/map-overlay.component';
import {QueryResultsComponent} from './query-results/query-results.component';
import {FeatureInfoOverlayComponent} from './feature-info-overlay.component';

@Component({selector: 'query-results', template: ''})
class QueryResultsStubComponent {
  public readonly showInteractiveElements = input(false);
}

@Component({selector: 'map-overlay', template: '<ng-content />'})
class MapOverlayStubComponent {
  public readonly width = input<number>();
  public readonly isPrintButtonEnabled = input(false);
  public readonly printLoadingState = input<LoadingState>();
  public readonly showPrintButton = input(false);
  public readonly isVisible = input(false);
  public readonly overlayTitle = input('');
  public readonly location = input('');
  public readonly printButtonEvent = output<void>();
  public readonly closeEvent = output<void>();
  public readonly resizeEvent = output<number>();
}

describe('FeatureInfoOverlayComponent', () => {
  let fixture: ComponentFixture<FeatureInfoOverlayComponent>;
  let component: FeatureInfoOverlayComponent;
  let store: MockStore;
  let overlay: MapOverlayStubComponent;
  let queryResults: QueryResultsStubComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureInfoOverlayComponent],
      providers: [provideMockStore()],
    })
      .overrideComponent(FeatureInfoOverlayComponent, {
        remove: {imports: [MapOverlayComponent, QueryResultsComponent]},
        add: {imports: [MapOverlayStubComponent, QueryResultsStubComponent]},
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectIsFeatureInfoOverlayVisible, false);
    store.overrideSelector(selectFeatureInfosForDisplay, []);
    store.overrideSelector(selectFeatureInfoQueryLoadingState, undefined);
    store.overrideSelector(selectFeatureInfoPrintState, undefined);
    store.overrideSelector(selectQueryMode, 'feature');
    store.refreshState();

    fixture = TestBed.createComponent(FeatureInfoOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    overlay = fixture.debugElement.query(By.directive(MapOverlayStubComponent)).componentInstance;
    queryResults = fixture.debugElement.query(By.directive(QueryResultsStubComponent)).componentInstance;
  });

  it('reflects visibility, width, and print progress on the overlay boundary', () => {
    store.overrideSelector(selectIsFeatureInfoOverlayVisible, true);
    store.overrideSelector(selectFeatureInfoPrintState, 'loading');
    store.refreshState();
    fixture.componentRef.setInput('width', 480);
    fixture.detectChanges();

    expect(overlay.isVisible()).toBe(true);
    expect(overlay.width()).toBe(480);
    expect(overlay.printLoadingState()).toBe('loading');
    expect(overlay.overlayTitle()).toBe('Info');
    expect(overlay.location()).toBe('right');
  });

  it.each([
    {interactive: true, loadingState: 'loaded' as LoadingState, data: [{} as FeatureInfoResultDisplay], enabled: true},
    {interactive: false, loadingState: 'loaded' as LoadingState, data: [{} as FeatureInfoResultDisplay], enabled: false},
    {interactive: true, loadingState: 'loading' as LoadingState, data: [{} as FeatureInfoResultDisplay], enabled: false},
    {interactive: true, loadingState: 'loaded' as LoadingState, data: [], enabled: false},
  ])('sets print availability to $enabled for the current state', ({interactive, loadingState, data, enabled}) => {
    store.overrideSelector(selectFeatureInfoQueryLoadingState, loadingState);
    store.overrideSelector(selectFeatureInfosForDisplay, data);
    store.refreshState();
    fixture.componentRef.setInput('showInteractiveElements', interactive);
    fixture.detectChanges();

    expect(overlay.showPrintButton()).toBe(interactive);
    expect(overlay.isPrintButtonEnabled()).toBe(enabled);
    expect(queryResults.showInteractiveElements()).toBe(interactive);
  });

  it('turns boundary events into store actions', () => {
    const dispatch = vi.spyOn(store, 'dispatch');

    overlay.closeEvent.emit();
    overlay.printButtonEvent.emit();

    expect(dispatch).toHaveBeenCalledWith(MapUiActions.setFeatureInfoVisibility({isVisible: false}));
    expect(dispatch).toHaveBeenCalledWith(OverlayPrintActions.sendPrintRequest({overlay: 'featureInfo'}));
  });

  it('hides the print button and ignores print events in statistics mode', () => {
    store.overrideSelector(selectQueryMode, 'statistics');
    store.refreshState();
    fixture.detectChanges();
    const dispatch = vi.spyOn(store, 'dispatch');

    expect(overlay.showPrintButton()).toBe(false);

    overlay.printButtonEvent.emit();

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('forwards resize events to its consumer', () => {
    const resize = vi.fn();
    component.resizeEvent.subscribe(resize);

    overlay.resizeEvent.emit(640);

    expect(resize).toHaveBeenCalledWith(640);
  });
});
