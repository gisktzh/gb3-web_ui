import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectIsLegendOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {selectLoadingState} from '../../../state/map/reducers/legend.reducer';
import {selectLegendPrintState} from '../../../state/map/reducers/overlay-print.reducer';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {selectLegendItemsForDisplay} from '../../../state/map/selectors/legend-result-display.selector';
import {LegendOverlayComponent} from './legend-overlay.component';
import {Component, input, inputBinding, output, signal} from '@angular/core';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {OverlayPrintActions} from 'src/app/state/map/actions/overlay-print-actions';
import {LegendComponent} from './legend/legend.component';
import {MapOverlayComponent} from '../map-overlay/map-overlay.component';
import {LoadingState} from 'src/app/shared/types/loading-state.type';
import {ResizeHandlerLocation} from 'src/app/shared/types/resize-handler-location.type';

describe('LegendOverlayComponent', () => {
  let component: LegendOverlayComponent;
  let fixture: ComponentFixture<LegendOverlayComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  const showInteractiveElements = signal(true);

  @Component({
    selector: 'legend',
    template: '<div id="legend">legend</div>',
  })
  class MockLegendComponent {
    public readonly showInteractiveElements = input(true);
  }

  @Component({
    selector: 'map-overlay',
    template: '<div id="map-overlay"><ng-content /></div>',
  })
  class MockMapOverlayComponent {
    public readonly showPrintButton = input(true);
    public readonly isPrintButtonEnabled = input(false);
    public readonly printLoadingState = input<LoadingState>();
    public readonly isVisible = input(false);
    public readonly overlayTitle = input('');
    public readonly location = input<ResizeHandlerLocation>('left');
    public readonly closeEvent = output();
    public readonly printButtonEvent = output();
  }

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LegendOverlayComponent],
      providers: [provideMockStore()],
    })
      .overrideComponent(LegendOverlayComponent, {
        remove: {
          imports: [LegendComponent, MapOverlayComponent],
        },
        add: {
          imports: [MockLegendComponent, MockMapOverlayComponent],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectIsLegendOverlayVisible, false);
    store.overrideSelector(selectLoadingState, undefined);
    store.overrideSelector(selectLegendPrintState, undefined);
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectLegendItemsForDisplay, []);
    store.refreshState();

    fixture = TestBed.createComponent(LegendOverlayComponent, {
      bindings: [inputBinding('showInteractiveElements', showInteractiveElements)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('map overlay', () => {
    it('should render the map overlay', () => {
      expect(compiled.querySelector('#map-overlay')).not.toBeNull();
    });

    it('should render the legend', () => {
      expect(compiled.querySelector('#legend')).not.toBeNull();
    });

    it('should reflect the overlay visibility', () => {
      expect(component.isVisible()).toBe(false);

      store.overrideSelector(selectIsLegendOverlayVisible, true);
      store.refreshState();
      fixture.detectChanges();

      expect(component.isVisible()).toBe(true);
    });

    it('should reflect the print loading state', () => {
      store.overrideSelector(selectLegendPrintState, 'loading');
      store.refreshState();
      fixture.detectChanges();

      expect(component.printLoadingState()).toBe('loading');
    });
  });

  describe('showInteractiveElements', () => {
    it('should show interactive elements by default', () => {
      expect(showInteractiveElements()).toBe(true);
      expect(component.showInteractiveElements()).toBe(true);
    });

    it('should update the rendered legend when interactive elements are disabled', () => {
      showInteractiveElements.set(false);
      fixture.detectChanges();

      expect(component.showInteractiveElements()).toBe(false);
    });

    it('should update the rendered legend when interactive elements are enabled again', () => {
      showInteractiveElements.set(false);
      fixture.detectChanges();

      showInteractiveElements.set(true);
      fixture.detectChanges();

      expect(component.showInteractiveElements()).toBe(true);
    });
  });

  describe('close', () => {
    it('should dispatch the action to hide the legend overlay', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');

      component.close();

      expect(dispatchSpy).toHaveBeenCalledWith(
        MapUiActions.setLegendOverlayVisibility({
          isVisible: false,
        }),
      );
    });

    it('should close when the map overlay emits closeEvent', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');

      const mapOverlay = compiled.querySelector('#map-overlay');

      expect(mapOverlay).not.toBeNull();

      mapOverlay?.dispatchEvent(
        new CustomEvent('closeEvent', {
          bubbles: true,
        }),
      );

      expect(dispatchSpy).toHaveBeenCalledWith(
        MapUiActions.setLegendOverlayVisibility({
          isVisible: false,
        }),
      );
    });
  });

  describe('print', () => {
    it('should dispatch the legend print request', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');

      component.print();

      expect(dispatchSpy).toHaveBeenCalledWith(
        OverlayPrintActions.sendPrintRequest({
          overlay: 'legend',
        }),
      );
    });

    it('should print when the map overlay emits printButtonEvent', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');

      const mapOverlay = compiled.querySelector('#map-overlay');

      expect(mapOverlay).not.toBeNull();

      mapOverlay?.dispatchEvent(
        new CustomEvent('printButtonEvent', {
          bubbles: true,
        }),
      );

      expect(dispatchSpy).toHaveBeenCalledWith(
        OverlayPrintActions.sendPrintRequest({
          overlay: 'legend',
        }),
      );
    });
  });

  describe('selector state', () => {
    it('should expose the legend loading state from the store', () => {
      store.overrideSelector(selectLoadingState, 'loading');
      store.refreshState();
      fixture.detectChanges();

      expect(component.loadingState()).toBe('loading');
    });

    it('should expose the legend loaded state from the store', () => {
      store.overrideSelector(selectLoadingState, 'loaded');
      store.refreshState();
      fixture.detectChanges();

      expect(component.loadingState()).toBe('loaded');
    });

    it('should expose the displayed legend items from the store', () => {
      const items = component.legendItems();

      expect(items).toEqual([]);
    });
  });

  describe('print button state', () => {
    it('should not enable printing while the legend is loading', () => {
      store.overrideSelector(selectLoadingState, 'loading');
      store.overrideSelector(selectLegendItemsForDisplay, []);
      store.refreshState();
      fixture.detectChanges();

      expect(component.loadingState()).toBe('loading');
      expect(component.legendItems()).toHaveLength(0);
    });

    it('should not enable printing when there are no legend items', () => {
      store.overrideSelector(selectLoadingState, 'loaded');
      store.overrideSelector(selectLegendItemsForDisplay, []);
      store.refreshState();
      fixture.detectChanges();

      expect(component.loadingState()).toBe('loaded');
      expect(component.legendItems()).toHaveLength(0);
    });

    it('should not enable printing when interactive elements are disabled', () => {
      showInteractiveElements.set(false);
      store.overrideSelector(selectLoadingState, 'loaded');
      store.overrideSelector(selectLegendItemsForDisplay, []);
      store.refreshState();
      fixture.detectChanges();

      expect(component.showInteractiveElements()).toBe(false);
      expect(component.loadingState()).toBe('loaded');
      expect(component.legendItems()).toHaveLength(0);
    });
  });
});
