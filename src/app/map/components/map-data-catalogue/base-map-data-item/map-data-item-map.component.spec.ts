import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectMapConfigState} from '../../../../state/map/reducers/map-config.reducer';
import {MapDataItemMapComponent} from './map-data-item-map.component';

describe('MapDataItemMapComponent', () => {
  let component: MapDataItemMapComponent;
  let fixture: ComponentFixture<MapDataItemMapComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  const layers = signal<Parameters<MapDataItemMapComponent['addItemLayer']> extends [infer T] ? T[] : never[]>([]);
  const imageUrl = signal<string | undefined>(undefined);
  const gb2Url = signal<string | null>(null);

  beforeEach(async () => {
    layers.set([]);
    imageUrl.set(undefined);
    gb2Url.set(null);

    await TestBed.configureTestingModule({
      imports: [MapDataItemMapComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectMapConfigState, {
      isMapServiceInitialized: false,
      center: {x: 0, y: 0},
      scale: 0,
      rotation: 0,
      srsId: 2056,
      ready: false,
      scaleSettings: {
        minScale: 0,
        maxScale: 0,
        calculatedMinScale: 0,
        calculatedMaxScale: 0,
      },
      isMaxZoomedIn: false,
      isMaxZoomedOut: false,
      activeBasemapId: '',
      initialMaps: [],
      predefinedInitialExtent: false,
      initialMapPadding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      initialMapPaddingMobile: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      initialBoundingBox: {
        min: {x: -100, y: -100},
        max: {x: 100, y: 100},
      },
      referenceDistanceInMeters: undefined,
    });
    store.refreshState();

    fixture = TestBed.createComponent(MapDataItemMapComponent, {
      bindings: [
        inputBinding('title', signal('Test map')),
        inputBinding('filterString', signal<string | undefined>(undefined)),
        inputBinding('layers', layers),
        inputBinding('imageUrl', imageUrl),
        inputBinding('gb2Url', gb2Url),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('showExpandButton', () => {
    it('should be true when no gb2 URL is provided', () => {
      gb2Url.set(null);
      fixture.detectChanges();

      expect(component.showExpandButton()).toBe(true);

      const expandButton = compiled.querySelector('[data-test-id="show-layers-of-the-map"]');

      expect(expandButton).not.toBeNull();
      expect(expandButton?.classList.contains('base-map-data-item__header__expand-button--hidden')).toBe(false);
    });

    it('should be false when a gb2 URL is provided', () => {
      gb2Url.set('https://example.com/map');
      fixture.detectChanges();

      expect(component.showExpandButton()).toBe(false);

      const expandButton = compiled.querySelector('[data-test-id="show-layers-of-the-map"]');

      expect(expandButton).not.toBeNull();
      expect(expandButton?.classList.contains('base-map-data-item__header__expand-button--hidden')).toBe(true);
    });
  });

  describe('mapConfigState', () => {
    it('should be undefined when no gb2 URL is provided', () => {
      gb2Url.set(null);
      fixture.detectChanges();

      expect(component.mapConfigState()).toBeUndefined();
    });

    it('should use the store map configuration when a gb2 URL is provided', () => {
      const mapConfigState = component.internalMapConfigState();

      gb2Url.set('https://example.com/map');
      fixture.detectChanges();

      expect(component.mapConfigState()).toBe(mapConfigState);
    });
  });

  describe('inputs', () => {
    it('should render the supplied image URL', () => {
      imageUrl.set('https://example.com/map.png');
      fixture.detectChanges();

      const image = compiled.querySelector('.base-map-data-item__header__image-container__image') as HTMLImageElement | null;

      expect(image).not.toBeNull();
      expect(image?.src).toBe('https://example.com/map.png');
      expect(image?.alt).toBe('Test map');
    });

    it('should render the image placeholder when imageUrl is undefined', () => {
      imageUrl.set(undefined);
      fixture.detectChanges();

      expect(compiled.querySelector('.base-map-data-item__header__image-container__image-placeholder')).not.toBeNull();

      expect(compiled.querySelector('.base-map-data-item__header__image-container__image')).toBeNull();
    });

    it('should render the gb2 exit button when a gb2 URL is provided', () => {
      gb2Url.set('https://example.com/map');
      fixture.detectChanges();

      expect(compiled.querySelector('gb2-exit-button')).not.toBeNull();
    });

    it('should not render the gb2 exit button when no gb2 URL is provided', () => {
      gb2Url.set(null);
      fixture.detectChanges();

      expect(compiled.querySelector('gb2-exit-button')).toBeNull();
    });

    it('should hide the add button when a gb2 URL is provided', () => {
      gb2Url.set('https://example.com/map');
      fixture.detectChanges();

      expect(compiled.querySelector('[data-test-id="add-active-map"]')).toBeNull();
    });

    it('should render no map layers when the layers input is empty', () => {
      layers.set([]);
      fixture.detectChanges();

      expect(compiled.querySelectorAll('map-data-item-map-layer')).toHaveLength(0);
    });
  });

  describe('inherited hover behavior', () => {
    it('should set the map hover state when the header is hovered', () => {
      const header = compiled.querySelector('.base-map-data-item__header') as HTMLElement;

      header.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();

      expect(component.isMapHovered()).toBe(true);
    });

    it('should clear the map hover state when the header is left', () => {
      const header = compiled.querySelector('.base-map-data-item__header') as HTMLElement;

      header.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();

      header.dispatchEvent(new MouseEvent('mouseleave'));
      fixture.detectChanges();

      expect(component.isMapHovered()).toBe(false);
    });

    it('should not activate the hover state when a gb2 URL is provided', () => {
      gb2Url.set('https://example.com/map');
      fixture.detectChanges();

      const header = compiled.querySelector('.base-map-data-item__header') as HTMLElement;

      header.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();

      expect(component.isMapHovered()).toBe(false);
    });
  });
});
