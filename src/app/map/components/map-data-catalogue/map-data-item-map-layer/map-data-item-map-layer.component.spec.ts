import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScale} from '../../../../state/map/reducers/map-config.reducer';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {MapDataItemMapLayerComponent} from './map-data-item-map-layer.component';
import {inputBinding, signal} from '@angular/core';
import {Mock} from 'vitest';

describe('MapDataItemMapLayerComponent', () => {
  let component: MapDataItemMapLayerComponent;
  let fixture: ComponentFixture<MapDataItemMapLayerComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let addLayerEventSpy: Mock;

  const layer = signal<MapLayer>({
    id: 1,
    title: 'Layer 1',
    isHidden: false,
    visible: true,
    minScale: 100,
    maxScale: 1000,
    layer: '',
    uuid: null,
    groupTitle: null,
    wmsSort: 0,
    tocSort: 0,
    queryable: false,
  });
  const filterString = signal<string | undefined>(undefined);
  const isMapHovered = signal(false);
  const isLayerHovered = signal(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapDataItemMapLayerComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScale, 0);
    store.refreshState();

    fixture = TestBed.createComponent(MapDataItemMapLayerComponent, {
      bindings: [
        inputBinding('layer', layer),
        inputBinding('filterString', filterString),
        inputBinding('isMapHovered', isMapHovered),
        inputBinding('isLayerHovered', isLayerHovered),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    addLayerEventSpy = vi.spyOn(component.addLayerEvent, 'emit');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render a visible layer', () => {
      expect(compiled.querySelector('.map-data-item-map-layer')).not.toBeNull();

      expect(compiled.querySelector('.map-data-item-map-layer__title')?.textContent).toContain('Layer 1');
    });

    it('should not render a hidden layer', () => {
      layer.set({
        ...layer(),
        isHidden: true,
      });
      fixture.detectChanges();

      expect(compiled.querySelector('.map-data-item-map-layer')).toBeNull();
    });

    it('should render the add button when the map is not hovered', () => {
      layer.set({
        ...layer(),
        isHidden: false,
      });
      isMapHovered.set(false);
      fixture.detectChanges();

      const button = compiled.querySelector('.map-data-item-map-layer__add-button');

      expect(button).not.toBeNull();
      expect(button?.querySelector('mat-icon')?.textContent?.trim()).toBe('add');
    });

    it('should render the visibility checkbox when the map is hovered', () => {
      layer.set({
        ...layer(),
        isHidden: false,
      });
      isMapHovered.set(true);
      fixture.detectChanges();

      expect(compiled.querySelector('.map-data-item-map-layer__visibility-checkbox')).not.toBeNull();

      expect(compiled.querySelector('.map-data-item-map-layer__add-button')).toBeNull();
    });

    it('should pass the layer visibility to the checkbox', () => {
      layer.set({
        ...layer(),
        visible: false,
      });
      isMapHovered.set(true);
      fixture.detectChanges();

      const checkbox = compiled.querySelector('mat-checkbox') as HTMLElement & {checked?: boolean};

      expect(checkbox).not.toBeNull();
      expect(checkbox.checked).toBe(undefined);
    });

    it('should render the layer title with the filter string', () => {
      filterString.set('Layer');
      fixture.detectChanges();

      const title = compiled.querySelector('.map-data-item-map-layer__title');

      expect(title).not.toBeNull();
      expect(title?.innerHTML).toContain('Layer');
    });

    it('should render the connection lines', () => {
      expect(compiled.querySelector('.map-data-item-map-layer__connection-line-top')).not.toBeNull();

      expect(compiled.querySelector('.map-data-item-map-layer__connection-line-bottom')).not.toBeNull();
    });
  });

  describe('visibleAtCurrentScale', () => {
    it('should return true when there is no scale', () => {
      store.overrideSelector(selectScale, 0);
      store.refreshState();
      fixture.detectChanges();

      expect(component.visibleAtCurrentScale()).toBe(true);
    });

    it('should return true when the scale is inside the layer scale range', () => {
      store.overrideSelector(selectScale, 500);
      store.refreshState();
      fixture.detectChanges();

      expect(component.visibleAtCurrentScale()).toBe(true);
    });

    it('should return false when the scale is below the minimum scale', () => {
      store.overrideSelector(selectScale, 100);
      store.refreshState();
      fixture.detectChanges();

      expect(component.visibleAtCurrentScale()).toBe(false);
    });

    it('should return true when the scale equals the maximum scale', () => {
      store.overrideSelector(selectScale, 1000);
      store.refreshState();
      fixture.detectChanges();

      expect(component.visibleAtCurrentScale()).toBe(true);
    });

    it('should return false when the scale is above the maximum scale', () => {
      store.overrideSelector(selectScale, 1001);
      store.refreshState();
      fixture.detectChanges();

      expect(component.visibleAtCurrentScale()).toBe(false);
    });
  });

  describe('inactive title', () => {
    it('should be inactive when the layer is outside the current scale and the map is hovered', () => {
      store.overrideSelector(selectScale, 2000);
      store.refreshState();
      isMapHovered.set(true);
      fixture.detectChanges();

      expect(
        compiled.querySelector('.map-data-item-map-layer__title')?.classList.contains('map-data-item-map-layer__title--inactive'),
      ).toBe(true);
    });

    it('should be inactive when the layer is outside the current scale and the layer is hovered', () => {
      store.overrideSelector(selectScale, 2000);
      store.refreshState();
      isMapHovered.set(false);
      isLayerHovered.set(true);
      fixture.detectChanges();

      expect(
        compiled.querySelector('.map-data-item-map-layer__title')?.classList.contains('map-data-item-map-layer__title--inactive'),
      ).toBe(true);
    });

    it('should be inactive when the layer is initially invisible and the map is hovered', () => {
      layer.set({
        ...layer(),
        visible: false,
      });
      store.overrideSelector(selectScale, 500);
      store.refreshState();
      isMapHovered.set(true);
      isLayerHovered.set(false);
      fixture.detectChanges();

      expect(
        compiled.querySelector('.map-data-item-map-layer__title')?.classList.contains('map-data-item-map-layer__title--inactive'),
      ).toBe(true);
    });

    it('should not be inactive when the layer is visible at the current scale and the map is not hovered', () => {
      layer.set({
        ...layer(),
        visible: true,
      });
      store.overrideSelector(selectScale, 500);
      store.refreshState();
      isMapHovered.set(false);
      isLayerHovered.set(false);
      fixture.detectChanges();

      expect(
        compiled.querySelector('.map-data-item-map-layer__title')?.classList.contains('map-data-item-map-layer__title--inactive'),
      ).toBe(false);
    });

    it('should not be inactive when the layer is visible at the current scale and only the layer is hovered', () => {
      store.overrideSelector(selectScale, 500);
      store.refreshState();
      isMapHovered.set(false);
      isLayerHovered.set(true);
      fixture.detectChanges();

      expect(
        compiled.querySelector('.map-data-item-map-layer__title')?.classList.contains('map-data-item-map-layer__title--inactive'),
      ).toBe(false);
    });
  });

  describe('addItemLayer', () => {
    it('should emit addLayerEvent', () => {
      component.addItemLayer();

      expect(addLayerEventSpy).toHaveBeenCalledOnce();
    });

    it('should emit addLayerEvent when the add button is clicked', () => {
      isMapHovered.set(false);
      fixture.detectChanges();

      const button = compiled.querySelector('.map-data-item-map-layer__add-button') as HTMLButtonElement;

      expect(button).not.toBeNull();

      button.click();

      expect(addLayerEventSpy).toHaveBeenCalledOnce();
    });
  });
});
