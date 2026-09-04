import {Component, input, inputBinding, output, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectIsFeatureInfoOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {selectFeatureInfosForDisplay} from '../../../state/map/selectors/feature-info-result-display.selector';
import {selectFeatureInfoQueryLoadingState} from '../../../state/map/selectors/feature-info-query-loading-state.selector';
import {selectFeatureInfoPrintState} from '../../../state/map/reducers/overlay-print.reducer';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {OverlayPrintActions} from '../../../state/map/actions/overlay-print-actions';
import {MapOverlayComponent} from '../map-overlay/map-overlay.component';
import {FeatureInfoComponent} from './feature-info/feature-info.component';
import {FeatureInfoOverlayComponent} from './feature-info-overlay.component';
import {FeatureInfoResultDisplay} from 'src/app/shared/interfaces/feature-info.interface';
import {LoadingState} from 'src/app/shared/types/loading-state.type';

describe('FeatureInfoOverlayComponent', () => {
  let component: FeatureInfoOverlayComponent;
  let fixture: ComponentFixture<FeatureInfoOverlayComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const showInteractiveElements = signal(true);

  @Component({
    selector: 'feature-info',
    standalone: true,
    template: '',
  })
  class MockFeatureInfoComponent {
    public readonly showInteractiveElements = input(false);
  }

  @Component({
    selector: 'map-overlay',
    standalone: true,
    template: '<div><ng-content /></div>',
  })
  class MockMapOverlayComponent {
    public readonly isPrintButtonEnabled = input.required<boolean>();
    public readonly printLoadingState = input.required<LoadingState>();
    public readonly showPrintButton = input.required<boolean>();
    public readonly isVisible = input.required<boolean>();
    public readonly overlayTitle = input('');
    public readonly location = input('');
    public readonly printButtonEvent = output();
    public readonly closeEvent = output();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureInfoOverlayComponent],
      providers: [provideMockStore()],
    })
      .overrideComponent(FeatureInfoOverlayComponent, {
        remove: {
          imports: [FeatureInfoComponent, MapOverlayComponent],
        },
        add: {
          imports: [MockFeatureInfoComponent, MockMapOverlayComponent],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectIsFeatureInfoOverlayVisible, false);
    store.overrideSelector(selectFeatureInfosForDisplay, []);
    store.overrideSelector(selectFeatureInfoQueryLoadingState, undefined);
    store.overrideSelector(selectFeatureInfoPrintState, undefined);
    store.refreshState();

    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(FeatureInfoOverlayComponent, {
      bindings: [inputBinding('showInteractiveElements', showInteractiveElements)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the map overlay', () => {
    expect(compiled.querySelector('map-overlay')).toBeTruthy();
  });

  it('should render the feature info component', () => {
    expect(compiled.querySelector('feature-info')).toBeTruthy();
  });

  it('should pass showInteractiveElements to the feature info component', () => {
    const featureInfo = fixture.debugElement.query(By.directive(MockFeatureInfoComponent));

    expect(featureInfo.componentInstance.showInteractiveElements()).toBe(true);

    showInteractiveElements.set(false);
    fixture.detectChanges();

    expect(featureInfo.componentInstance.showInteractiveElements()).toBe(false);
  });

  it('should pass visibility state to the map overlay', () => {
    store.overrideSelector(selectIsFeatureInfoOverlayVisible, true);
    store.refreshState();
    fixture.detectChanges();

    const mapOverlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));

    expect(mapOverlay.componentInstance.isVisible()).toBe(true);

    store.overrideSelector(selectIsFeatureInfoOverlayVisible, false);
    store.refreshState();
    fixture.detectChanges();

    expect(mapOverlay.componentInstance.isVisible()).toBe(false);
  });

  it('should pass print loading state to the map overlay', () => {
    const printLoadingState = 'loading';

    store.overrideSelector(selectFeatureInfoPrintState, printLoadingState);
    store.refreshState();
    fixture.detectChanges();

    const mapOverlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));

    expect(mapOverlay.componentInstance.printLoadingState()).toBe(printLoadingState);
  });

  it('should pass the configured overlay title and location', () => {
    const mapOverlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));

    expect(mapOverlay.componentInstance.overlayTitle()).toBe('Info');
    expect(mapOverlay.componentInstance.location()).toBe('right');
  });

  it('should show the print button when interactive elements are enabled', () => {
    showInteractiveElements.set(true);
    fixture.detectChanges();

    const mapOverlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));

    expect(mapOverlay.componentInstance.showPrintButton()).toBe(true);
  });

  it('should hide the print button when interactive elements are disabled', () => {
    showInteractiveElements.set(false);
    fixture.detectChanges();

    const mapOverlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));

    expect(mapOverlay.componentInstance.showPrintButton()).toBe(false);
  });

  it('should enable the print button when interactive elements are enabled, loading is complete and feature info exists', async () => {
    vi.useFakeTimers();
    const featureInfo: FeatureInfoResultDisplay[] = [
      {
        id: 'feature-1',
        title: '',
        layers: [],
        mapId: '',
        isSingleLayer: false,
        report: {
          url: null,
          description: null,
        },
      },
    ];

    store.overrideSelector(selectFeatureInfosForDisplay, featureInfo);
    store.overrideSelector(selectFeatureInfoQueryLoadingState, 'loaded');
    store.refreshState();
    showInteractiveElements.set(true);
    fixture.detectChanges();

    await vi.runAllTimersAsync();

    const mapOverlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));

    expect(mapOverlay.componentInstance.isPrintButtonEnabled()).toBe(true);
  });

  it('should disable the print button when there is no feature info', async () => {
    vi.useFakeTimers();
    store.overrideSelector(selectFeatureInfosForDisplay, []);
    store.overrideSelector(selectFeatureInfoQueryLoadingState, 'loaded');
    store.refreshState();
    fixture.detectChanges();

    await vi.runAllTimersAsync();

    const mapOverlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));

    expect(mapOverlay.componentInstance.isPrintButtonEnabled()).toBe(false);
  });

  it('should disable the print button when feature info is still loading', () => {
    const featureInfo: FeatureInfoResultDisplay[] = [
      {
        id: 'feature-1',
        title: '',
        layers: [],
        mapId: '',
        isSingleLayer: false,
        report: {
          url: null,
          description: null,
        },
      },
    ];

    store.overrideSelector(selectFeatureInfosForDisplay, featureInfo);
    store.overrideSelector(selectFeatureInfoQueryLoadingState, 'loading');
    store.refreshState();
    fixture.detectChanges();

    const mapOverlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));

    expect(mapOverlay.componentInstance.isPrintButtonEnabled()).toBe(false);
  });

  it('should disable the print button when interactive elements are disabled', () => {
    const featureInfo: FeatureInfoResultDisplay[] = [
      {
        id: 'feature-1',
        title: '',
        layers: [],
        mapId: '',
        isSingleLayer: false,
        report: {
          url: null,
          description: null,
        },
      },
    ];

    store.overrideSelector(selectFeatureInfosForDisplay, featureInfo);
    store.overrideSelector(selectFeatureInfoQueryLoadingState, 'loaded');
    store.refreshState();

    showInteractiveElements.set(false);
    fixture.detectChanges();

    const mapOverlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));

    expect(mapOverlay.componentInstance.isPrintButtonEnabled()).toBe(false);
  });

  it('should dispatch the feature info visibility action when the overlay emits close', () => {
    const mapOverlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));

    mapOverlay.componentInstance.closeEvent.emit();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      MapUiActions.setFeatureInfoVisibility({
        isVisible: false,
      }),
    );
  });

  it('should dispatch the feature info print action when the overlay emits print', () => {
    const mapOverlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));

    mapOverlay.componentInstance.printButtonEvent.emit();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      OverlayPrintActions.sendPrintRequest({
        overlay: 'featureInfo',
      }),
    );
  });

  it('should call close through the component method', () => {
    component.close();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      MapUiActions.setFeatureInfoVisibility({
        isVisible: false,
      }),
    );
  });

  it('should call print through the component method', () => {
    component.print();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      OverlayPrintActions.sendPrintRequest({
        overlay: 'featureInfo',
      }),
    );
  });
});
