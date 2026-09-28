import {Component, input} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectBottomSheetContent} from 'src/app/state/map/reducers/map-ui.reducer';
import {BottomSheetOverlayComponent} from './bottom-sheet-overlay.component';
import {BottomSheetItemComponent} from './bottom-sheet-item/bottom-sheet-item.component';
import {BasemapSelectionListComponent} from '../map-controls/basemap-selector/basemap-selection-list/basemap-selection-list.component';
import {LegendComponent} from '../legend-overlay/legend/legend.component';
import {FeatureInfoComponent} from '../feature-info-overlay/feature-info/feature-info.component';
import {MapAttributeFilterComponent} from '../map-attribute-filter/map-attribute-filter.component';
import {ShareLinkMobileComponent} from '../share-link-mobile/share-link-mobile.component';
import {SearchWindowMobileComponent} from '../search-window-mobile/search-window-mobile.component';
import {MapManagementMobileComponent} from '../map-management-mobile/map-management-mobile.component';
import {By} from '@angular/platform-browser';

@Component({
  selector: 'bottom-sheet-item',
  template: '<ng-content />',
})
class MockBottomSheetItemComponent {
  public readonly overlayTitle = input('');
  public readonly bottomSheetHeight = input('small');
  public readonly showHeader = input(true);
  public readonly usePrimaryColor = input(false);
}

@Component({
  selector: 'basemap-selection-list',
  template: '',
})
class MockBasemapSelectionListComponent {}

@Component({
  selector: 'legend',
  template: '',
})
class MockLegendComponent {
  public readonly showInteractiveElements = input(true);
}

@Component({
  selector: 'feature-info',
  template: '',
})
class MockFeatureInfoComponent {}

@Component({
  selector: 'map-attribute-filter',
  template: '',
})
class MockMapAttributeFilterComponent {}

@Component({
  selector: 'share-link-mobile',
  template: '',
})
class MockShareLinkMobileComponent {}

@Component({
  selector: 'search-window-mobile',
  template: '',
})
class MockSearchWindowMobileComponent {
  public readonly focusOnInit = input(false);
}

@Component({
  selector: 'map-management-mobile',
  template: '',
})
class MockMapManagementMobileComponent {}

describe('BottomSheetOverlayComponent', () => {
  let component: BottomSheetOverlayComponent;
  let fixture: ComponentFixture<BottomSheetOverlayComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  const showInteractiveElements = signal(true);

  beforeEach(async () => {
    showInteractiveElements.set(true);

    await TestBed.configureTestingModule({
      imports: [BottomSheetOverlayComponent],
      providers: [provideMockStore()],
    })
      .overrideComponent(BottomSheetOverlayComponent, {
        remove: {
          imports: [
            BottomSheetItemComponent,
            BasemapSelectionListComponent,
            LegendComponent,
            FeatureInfoComponent,
            MapAttributeFilterComponent,
            ShareLinkMobileComponent,
            SearchWindowMobileComponent,
            MapManagementMobileComponent,
          ],
        },
        add: {
          imports: [
            MockBottomSheetItemComponent,
            MockBasemapSelectionListComponent,
            MockLegendComponent,
            MockFeatureInfoComponent,
            MockMapAttributeFilterComponent,
            MockShareLinkMobileComponent,
            MockSearchWindowMobileComponent,
            MockMapManagementMobileComponent,
          ],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectBottomSheetContent, 'none');
    store.refreshState();

    fixture = TestBed.createComponent(BottomSheetOverlayComponent, {
      bindings: [inputBinding('showInteractiveElements', showInteractiveElements)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should always render the map management bottom sheet item', () => {
    store.overrideSelector(selectBottomSheetContent, 'none');
    store.refreshState();
    fixture.detectChanges();

    const mapManagementItem = compiled.querySelector('bottom-sheet-item');

    expect(mapManagementItem).toBeTruthy();
  });

  it('should hide the map management bottom sheet item when the content is not map-management', () => {
    store.overrideSelector(selectBottomSheetContent, 'legend');
    store.refreshState();
    fixture.detectChanges();

    const mapManagementItem = compiled.querySelector('bottom-sheet-item:nth-child(2)');

    expect(mapManagementItem?.classList.contains('bottom-sheet-overlay--hidden')).toBe(true);
  });

  it('should show the map management bottom sheet item when the content is map-management', () => {
    store.overrideSelector(selectBottomSheetContent, 'map-management');
    store.refreshState();
    fixture.detectChanges();

    const mapManagementItem = compiled.querySelector('bottom-sheet-item');

    expect(mapManagementItem?.classList.contains('bottom-sheet-overlay--hidden')).toBe(false);
  });

  it('should configure the map management bottom sheet item correctly', () => {
    store.overrideSelector(selectBottomSheetContent, 'map-management');
    store.refreshState();
    fixture.detectChanges();

    const instance = fixture.debugElement.query(By.directive(MockBottomSheetItemComponent)).componentInstance;

    expect(instance.overlayTitle()).toBe('');
    expect(instance.bottomSheetHeight()).toBe('medium');
    expect(instance.showHeader()).toBe(false);
    expect(instance.usePrimaryColor()).toBe(true);
  });

  it('should render the basemap content', () => {
    store.overrideSelector(selectBottomSheetContent, 'basemap');
    store.refreshState();
    fixture.detectChanges();

    const item = compiled.querySelector('basemap-selection-list');

    expect(item).toBeTruthy();
    expect(compiled.querySelectorAll('bottom-sheet-item')).toHaveLength(2);
  });

  it('should configure the basemap bottom sheet item', () => {
    store.overrideSelector(selectBottomSheetContent, 'basemap');
    store.refreshState();
    fixture.detectChanges();

    const instance = fixture.debugElement.query(By.directive(MockBottomSheetItemComponent)).componentInstance;

    expect(instance.overlayTitle()).toBe('Hintergrund');
    expect(instance.bottomSheetHeight()).toBe('small');
  });

  it('should render the legend content', () => {
    store.overrideSelector(selectBottomSheetContent, 'legend');
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('legend')).toBeTruthy();
    expect(compiled.querySelectorAll('bottom-sheet-item')).toHaveLength(2);
  });

  it('should pass showInteractiveElements to the legend', () => {
    showInteractiveElements.set(false);
    store.overrideSelector(selectBottomSheetContent, 'legend');
    store.refreshState();
    fixture.detectChanges();

    const instance = fixture.debugElement.query(By.directive(MockLegendComponent)).componentInstance;

    expect(instance.showInteractiveElements()).toBe(false);
  });

  it('should configure the legend bottom sheet item', () => {
    store.overrideSelector(selectBottomSheetContent, 'legend');
    store.refreshState();
    fixture.detectChanges();

    const instance = fixture.debugElement.query(By.directive(MockBottomSheetItemComponent)).componentInstance;

    expect(instance.overlayTitle()).toBe('Legende');
    expect(instance.bottomSheetHeight()).toBe('large');
  });

  it('should render the feature info content', () => {
    store.overrideSelector(selectBottomSheetContent, 'feature-info');
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('feature-info')).toBeTruthy();
    expect(compiled.querySelectorAll('bottom-sheet-item')).toHaveLength(2);
  });

  it('should configure the feature info bottom sheet item', () => {
    store.overrideSelector(selectBottomSheetContent, 'feature-info');
    store.refreshState();
    fixture.detectChanges();

    const instance = fixture.debugElement.query(By.directive(MockBottomSheetItemComponent)).componentInstance;

    expect(instance.overlayTitle()).toBe('Info');
    expect(instance.bottomSheetHeight()).toBe('large');
  });

  it('should render the map attribute filter content', () => {
    store.overrideSelector(selectBottomSheetContent, 'map-attributes');
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('map-attribute-filter')).toBeTruthy();
    expect(compiled.querySelectorAll('bottom-sheet-item')).toHaveLength(2);
  });

  it('should configure the map attribute filter bottom sheet item', () => {
    store.overrideSelector(selectBottomSheetContent, 'map-attributes');
    store.refreshState();
    fixture.detectChanges();

    const instance = fixture.debugElement.query(By.directive(MockBottomSheetItemComponent)).componentInstance;

    expect(instance.overlayTitle()).toBe('Attributfilter:');
    expect(instance.bottomSheetHeight()).toBe('medium');
  });

  it('should render the share link content', () => {
    store.overrideSelector(selectBottomSheetContent, 'share-link');
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('share-link-mobile')).toBeTruthy();
    expect(compiled.querySelectorAll('bottom-sheet-item')).toHaveLength(2);
  });

  it('should configure the share link bottom sheet item', () => {
    store.overrideSelector(selectBottomSheetContent, 'share-link');
    store.refreshState();
    fixture.detectChanges();

    const instance = fixture.debugElement.query(By.directive(MockBottomSheetItemComponent)).componentInstance;

    expect(instance.overlayTitle()).toBe('Teilen');
    expect(instance.bottomSheetHeight()).toBe('small');
  });

  it('should render the search content', () => {
    store.overrideSelector(selectBottomSheetContent, 'search');
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('search-window-mobile')).toBeTruthy();
    expect(compiled.querySelectorAll('bottom-sheet-item')).toHaveLength(2);
  });

  it('should pass focusOnInit to the search window', () => {
    store.overrideSelector(selectBottomSheetContent, 'search');
    store.refreshState();
    fixture.detectChanges();

    const instance = fixture.debugElement.query(By.directive(MockSearchWindowMobileComponent)).componentInstance;

    expect(instance.focusOnInit()).toBe(true);
  });

  it('should configure the search bottom sheet item', () => {
    store.overrideSelector(selectBottomSheetContent, 'search');
    store.refreshState();
    fixture.detectChanges();

    const instance = fixture.debugElement.query(By.directive(MockBottomSheetItemComponent)).componentInstance;

    expect(instance.bottomSheetHeight()).toBe('large');
    expect(instance.showHeader()).toBe(false);
  });

  it('should not render any content-specific bottom sheet for an unknown content value', () => {
    store.overrideSelector(selectBottomSheetContent, 'none');
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('basemap-selection-list')).toBeNull();
    expect(compiled.querySelector('legend')).toBeNull();
    expect(compiled.querySelector('feature-info')).toBeNull();
    expect(compiled.querySelector('map-attribute-filter')).toBeNull();
    expect(compiled.querySelector('share-link-mobile')).toBeNull();
    expect(compiled.querySelector('search-window-mobile')).toBeNull();
    expect(compiled.querySelectorAll('bottom-sheet-item')).toHaveLength(1);
  });
});
