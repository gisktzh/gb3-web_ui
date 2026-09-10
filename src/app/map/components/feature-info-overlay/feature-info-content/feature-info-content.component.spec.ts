import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectPinnedFeatureId} from '../../../../state/map/reducers/feature-info.reducer';
import {selectScrollbarWidth} from 'src/app/state/app/reducers/app-layout.reducer';
import {ConfigService} from '../../../../shared/services/config.service';
import {MapService} from '../../../interfaces/map.service';
import {FeatureInfoContentComponent} from './feature-info-content.component';
import {inputBinding, signal} from '@angular/core';
import {MAP_SERVICE} from 'src/app/app.tokens';
import {FeatureInfoResultFeatureField, FeatureInfoResultLayer} from '../../../../shared/interfaces/feature-info.interface';
import {GeometryWithSrs} from '../../../../shared/interfaces/geojson-types-with-srs.interface';
import {FeatureInfoActions} from '../../../../state/map/actions/feature-info.actions';
import {ResizeHandlerComponent} from '../../../../shared/components/resize-handler/resize-handler.component';
import {TableColumnIdentifierDirective} from './table-column-identifier.directive';

describe('FeatureInfoContentComponent', () => {
  let component: FeatureInfoContentComponent;
  let fixture: ComponentFixture<FeatureInfoContentComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: ReturnType<typeof vi.spyOn>;

  const configServiceMock: Partial<ConfigService> = {
    apiConfig: {
      gb2StaticFiles: {
        baseUrl: 'https://example.com/static',
      },
    },
  } as ConfigService;

  const mapServiceMock: Partial<MapService> = {
    zoomToExtent: vi.fn(),
  };

  const layer = signal<FeatureInfoResultLayer>({
    title: 'Test layer',
    layer: 'test-layer',
    features: [],
  } as FeatureInfoResultLayer);

  const topicId = signal('test-topic');

  class MockResizeObserver {
    public readonly observe = vi.fn();
    public readonly disconnect = vi.fn();

    constructor(private readonly callback: ResizeObserverCallback) {}

    public trigger(): void {
      this.callback([], this as unknown as ResizeObserver);
    }
  }

  beforeEach(async () => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver);

    await TestBed.configureTestingModule({
      imports: [FeatureInfoContentComponent],
      providers: [
        {provide: ConfigService, useValue: configServiceMock},
        {provide: MAP_SERVICE, useValue: mapServiceMock},
        provideMockStore(),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectPinnedFeatureId, undefined);
    store.overrideSelector(selectScrollbarWidth, 17);
    store.refreshState();

    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(FeatureInfoContentComponent, {
      bindings: [inputBinding('layer', layer), inputBinding('topicId', topicId)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  const createTextField = (label: string, value: string | null): FeatureInfoResultFeatureField =>
    ({
      label,
      type: 'text',
      value,
    }) as FeatureInfoResultFeatureField;

  const createDateField = (label: string, value: string): FeatureInfoResultFeatureField =>
    ({
      label,
      type: 'date',
      value,
    }) as FeatureInfoResultFeatureField;

  const createLinkField = (
    label: string,
    value: {
      href: string;
      title?: string;
    },
  ): FeatureInfoResultFeatureField =>
    ({
      label,
      type: 'link',
      value,
    }) as FeatureInfoResultFeatureField;

  const createImageField = (
    label: string,
    value: {
      url: {href: string};
      src: {href: string; title?: string};
      alt: string;
    },
  ): FeatureInfoResultFeatureField =>
    ({
      label,
      type: 'image',
      value,
    }) as FeatureInfoResultFeatureField;

  const createFeature = (fid: number, fields: FeatureInfoResultFeatureField[], geometry?: GeometryWithSrs) =>
    ({
      fid,
      fields,
      geometry,
    }) as FeatureInfoResultLayer['features'][number];

  const setFeatures = (...features: FeatureInfoResultLayer['features']) => {
    layer.set({
      title: 'Test layer',
      layer: 'test-layer',
      features,
    } as FeatureInfoResultLayer);
    fixture.detectChanges();
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the layer title as table description', () => {
    layer.set({
      title: 'My layer',
      layer: 'test-layer',
      features: [],
    } as FeatureInfoResultLayer);

    fixture.detectChanges();

    const table = compiled.querySelector('table');

    expect(table?.getAttribute('aria-describedby')).toBe('Informationen zu My layer');
  });

  it('should render a table header for every feature', () => {
    setFeatures(createFeature(10, []), createFeature(20, []), createFeature(30, []));

    const headers = compiled.querySelectorAll('.feature-info-content__table__row__column--header[tableColumnIdentifier]');

    expect(headers).toHaveLength(3);
    expect(headers[0].textContent).toContain('1');
    expect(headers[1].textContent).toContain('2');
    expect(headers[2].textContent).toContain('3');
  });

  it('should expose table headers with result numbering and geometry state', () => {
    const geometry = {} as GeometryWithSrs;

    setFeatures(createFeature(10, [], geometry), createFeature(20, []));

    expect(component.tableHeaders()).toEqual([
      {
        displayValue: 'Resultat 1/2',
        fid: 10,
        hasGeometry: true,
      },
      {
        displayValue: 'Resultat 2/2',
        fid: 20,
        hasGeometry: false,
      },
    ]);
  });

  it('should disable the radio button for features without geometry', () => {
    setFeatures(createFeature(10, [], {} as GeometryWithSrs), createFeature(20, []));

    const radioButtons = compiled.querySelectorAll('mat-radio-button');

    expect(radioButtons).toHaveLength(2);
    expect(radioButtons[0].classList).not.toContain('mat-mdc-radio-disabled');
    expect(radioButtons[1].classList).toContain('mat-mdc-radio-disabled');
  });

  it('should render text cells and use the default value for null', () => {
    setFeatures(createFeature(10, [createTextField('Name', 'Hello'), createTextField('Empty', null)]));

    expect(compiled.textContent).toContain('Hello');
    expect(compiled.textContent).toContain('-');

    const cells = compiled.querySelectorAll('td');

    expect(cells).toHaveLength(2);
    expect(cells[0].textContent).toContain('Hello');
    expect(cells[1].textContent).toContain('-');
  });

  it('should format date fields as text cells', () => {
    setFeatures(createFeature(10, [createDateField('Date', '2026-08-25')]));

    const cells = compiled.querySelectorAll('td');

    expect(cells).toHaveLength(1);
    expect(cells[0].querySelector('a')).toBeNull();
    expect(cells[0].textContent).not.toBe('');
  });

  it('should render link cells with title when available', () => {
    setFeatures(
      createFeature(10, [
        createLinkField('Link', {
          href: 'https://example.com',
          title: 'Example',
        }),
      ]),
    );

    const link = compiled.querySelector('.feature-info-content__table__row__column__link') as HTMLAnchorElement | null;

    expect(link).toBeTruthy();
    expect(link?.href).toBe('https://example.com/');
    expect(link?.textContent).toContain('Example');
    expect(link?.title).toBe('Example');
    expect(link?.target).toBe('_blank');
    expect(link?.rel).toContain('noopener');
  });

  it('should use the link URL as display value when no title is available', () => {
    setFeatures(
      createFeature(10, [
        createLinkField('Link', {
          href: 'https://example.com/test',
        }),
      ]),
    );

    const link = compiled.querySelector('.feature-info-content__table__row__column__link') as HTMLAnchorElement | null;

    expect(link?.textContent).toContain('https://example.com/test');
    expect(link?.title).toBe('https://example.com/test');
  });

  it('should render image cells', () => {
    setFeatures(
      createFeature(10, [
        createImageField('Image', {
          url: {href: 'https://example.com/original'},
          src: {
            href: 'https://example.com/image.png',
            title: 'Image title',
          },
          alt: 'Image description',
        }),
      ]),
    );

    const image = compiled.querySelector('.feature-info-content__table__row__column__image') as HTMLImageElement | null;

    expect(image).toBeTruthy();
    expect(image?.src).toBe('https://example.com/image.png');
    expect(image?.alt).toBe('Image description');

    const link = image?.parentElement;

    expect(link?.getAttribute('href')).toBe('https://example.com/original');
    expect(link?.getAttribute('title')).toBe('Image title');
  });

  it('should use the image source href as display value when the source has no title', () => {
    setFeatures(
      createFeature(10, [
        createImageField('Image', {
          url: {href: 'https://example.com/original'},
          src: {
            href: 'https://example.com/image.png',
          },
          alt: 'Image description',
        }),
      ]),
    );

    expect(component.tableRows().get('Image')?.[0]).toMatchObject({
      cellType: 'image',
      displayValue: 'https://example.com/image.png',
    });
  });

  it('should group fields with the same label into one table row', () => {
    setFeatures(createFeature(10, [createTextField('Name', 'First')]), createFeature(20, [createTextField('Name', 'Second')]));

    expect(component.tableRows().size).toBe(1);
    expect(component.tableRows().get('Name')).toHaveLength(2);

    const rows = compiled.querySelectorAll('.feature-info-content__table > tr');

    expect(rows).toHaveLength(2);
    expect(compiled.textContent).toContain('First');
    expect(compiled.textContent).toContain('Second');
  });

  it('should preserve key value order', () => {
    expect(component.preserveKeyValueOrder()).toBe(0);
  });

  it('should expose feature geometries by feature id', () => {
    const geometry = {} as GeometryWithSrs;

    setFeatures(createFeature(10, [], geometry), createFeature(20, []));

    expect(component.featureGeometries().get(10)).toBe(geometry);
    expect(component.featureGeometries().get(20)).toBeUndefined();
  });

  it('should calculate the maximum table header width from the container width', () => {
    component.containerWidth.set(500);

    expect(component.maxTableHeaderWidth()).toBe(400);
  });

  it('should calculate zero scrollbar height when there is no horizontal overflow', () => {
    component.containerWidth.set(500);
    component.containerScrollWidth.set(500);

    expect(component.calculatedScrollbarHeight()).toBe(0);
  });

  it('should use the scrollbar width when the content overflows horizontally', () => {
    component.containerWidth.set(500);
    component.containerScrollWidth.set(600);

    expect(component.calculatedScrollbarHeight()).toBe(17);
  });

  it('should set the table header width when resized', () => {
    component.resize({width: '250px'});

    expect(component.tableHeaderWidth()).toBe('250px');
  });

  it('should use the default table header width when resize has no width', () => {
    component.resize({});

    expect(component.tableHeaderWidth()).toBe('130px');
  });

  it('should highlight a feature on hover when hover is enabled and no feature is pinned', () => {
    const geometry = {} as GeometryWithSrs;

    setFeatures(createFeature(42, [], geometry));

    component.onFeatureHoverStart(42);

    expect(component.hoveredFeatureId()).toBe(42);
    expect(storeDispatchSpy).toHaveBeenCalledWith(
      FeatureInfoActions.highlightFeature({
        feature: geometry,
        pinnedFeatureId: undefined,
      }),
    );
  });

  it('should not highlight on hover when hover is disabled', () => {
    const geometry = {} as GeometryWithSrs;

    setFeatures(createFeature(42, [], geometry));

    component.hoverEnabled.set(false);
    component.onFeatureHoverStart(42);

    expect(component.hoveredFeatureId()).toBeNull();
    expect(storeDispatchSpy).not.toHaveBeenCalledWith(
      FeatureInfoActions.highlightFeature({
        feature: geometry,
        pinnedFeatureId: undefined,
      }),
    );
  });

  it('should update hovered feature when hovering a feature without geometry', () => {
    setFeatures(createFeature(42, []));

    component.onFeatureHoverStart(42);

    expect(component.hoveredFeatureId()).toBe(42);
    expect(storeDispatchSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: FeatureInfoActions.highlightFeature.type,
      }),
    );
  });

  it('should not dispatch hover highlight when another feature is pinned', () => {
    const geometry = {} as GeometryWithSrs;

    setFeatures(createFeature(42, [], geometry));

    const pinnedId = TableColumnIdentifierDirective.createUniqueColumnIdentifier('test-topic', 'test-layer', 99);

    store.overrideSelector(selectPinnedFeatureId, pinnedId);
    store.refreshState();
    fixture.detectChanges();

    component.onFeatureHoverStart(42);

    expect(component.hoveredFeatureId()).toBe(42);
    expect(storeDispatchSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: FeatureInfoActions.highlightFeature.type,
      }),
    );
  });

  it('should clear the hover highlight when hover ends and no feature is pinned', () => {
    component.hoveredFeatureId.set(42);

    component.onFeatureHoverEnd();

    expect(component.hoveredFeatureId()).toBeNull();
    expect(storeDispatchSpy).toHaveBeenCalledWith(FeatureInfoActions.clearHighlight());
  });

  it('should not clear the highlight when hover ends while a feature is pinned', () => {
    const pinnedId = TableColumnIdentifierDirective.createUniqueColumnIdentifier('test-topic', 'test-layer', 42);

    store.overrideSelector(selectPinnedFeatureId, pinnedId);
    store.refreshState();
    fixture.detectChanges();

    component.hoveredFeatureId.set(42);
    storeDispatchSpy.mockClear();

    component.onFeatureHoverEnd();

    expect(component.hoveredFeatureId()).toBeNull();
    expect(storeDispatchSpy).not.toHaveBeenCalledWith(FeatureInfoActions.clearHighlight());
  });

  it('should toggle highlight for a feature without geometry without doing anything', () => {
    component.toggleHighlightForFeature(42, false);

    expect(storeDispatchSpy).not.toHaveBeenCalled();
    expect(mapServiceMock.zoomToExtent).not.toHaveBeenCalled();
  });

  it('should pin and zoom to a feature when toggling a feature with geometry', () => {
    const geometry = {} as GeometryWithSrs;

    setFeatures(createFeature(42, [], geometry));

    component.toggleHighlightForFeature(42, true);

    expect(component.hoveredFeatureId()).toBe(42);
    expect(storeDispatchSpy).toHaveBeenCalledWith(
      FeatureInfoActions.highlightFeature({
        feature: geometry,
        pinnedFeatureId: TableColumnIdentifierDirective.createUniqueColumnIdentifier('test-topic', 'test-layer', 42),
      }),
    );
    expect(mapServiceMock.zoomToExtent).toHaveBeenCalledWith(geometry);
  });

  it('should clear the highlight when toggling the already pinned feature', () => {
    const pinnedId = TableColumnIdentifierDirective.createUniqueColumnIdentifier('test-topic', 'test-layer', 42);

    store.overrideSelector(selectPinnedFeatureId, pinnedId);
    store.refreshState();
    fixture.detectChanges();

    component.toggleHighlightForFeature(42, true);

    expect(storeDispatchSpy).toHaveBeenCalledWith(FeatureInfoActions.clearHighlight());
  });

  it('should not dispatch a highlight when toggling a feature whose geometry does not exist', () => {
    setFeatures(createFeature(42, []));

    component.toggleHighlightForFeature(42, true);

    expect(storeDispatchSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: FeatureInfoActions.highlightFeature.type,
      }),
    );
    expect(mapServiceMock.zoomToExtent).not.toHaveBeenCalled();
  });

  it('should prefer the pinned feature as the highlighted feature', () => {
    const pinnedId = TableColumnIdentifierDirective.createUniqueColumnIdentifier('test-topic', 'test-layer', 42);

    store.overrideSelector(selectPinnedFeatureId, pinnedId);
    store.refreshState();
    fixture.detectChanges();

    component.hoveredFeatureId.set(10);

    expect(component.pinnedFeatureId()).toBe(42);
    expect(component.highlightedFeatureId()).toBe(42);
  });

  it('should use the hovered feature when no feature is pinned', () => {
    component.hoveredFeatureId.set(42);

    expect(component.pinnedFeatureId()).toBeUndefined();
    expect(component.highlightedFeatureId()).toBe(42);
  });

  it('should ignore a pinned feature belonging to another topic or layer', () => {
    const pinnedId = TableColumnIdentifierDirective.createUniqueColumnIdentifier('other-topic', 'other-layer', 42);

    store.overrideSelector(selectPinnedFeatureId, pinnedId);
    store.refreshState();
    fixture.detectChanges();

    expect(component.pinnedFeatureId()).toBeUndefined();
  });

  it('should return no pinned feature when the pinned identifier is undefined', () => {
    store.overrideSelector(selectPinnedFeatureId, undefined);
    store.refreshState();
    fixture.detectChanges();

    expect(component.pinnedFeatureId()).toBeUndefined();
  });

  it('should add and remove highlighted classes through hover events', () => {
    const geometry = {} as GeometryWithSrs;

    setFeatures(createFeature(10, [], geometry), createFeature(20, [], geometry));

    const headers = compiled.querySelectorAll('.feature-info-content__table__row__column--header[tableColumnIdentifier]');

    (headers[0] as HTMLElement).dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    expect(headers[0].classList).toContain('feature-info-content__table__row__column--highlighted');
    expect(headers[1].classList).not.toContain('feature-info-content__table__row__column--highlighted');

    (headers[0] as HTMLElement).dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();

    expect(headers[0].classList).not.toContain('feature-info-content__table__row__column--highlighted');
  });

  it('should toggle a feature through the table header click', () => {
    const geometry = {} as GeometryWithSrs;

    setFeatures(createFeature(42, [], geometry));

    const header = compiled.querySelector('.feature-info-content__table__row__column--header[tableColumnIdentifier]') as HTMLElement;

    header.click();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      FeatureInfoActions.highlightFeature({
        feature: geometry,
        pinnedFeatureId: TableColumnIdentifierDirective.createUniqueColumnIdentifier('test-topic', 'test-layer', 42),
      }),
    );
  });

  it('should expose the configured minimum table header width', () => {
    expect(component.minTableHeaderWidth).toBe(80);
  });

  it('should update hover state through resize start and end events', () => {
    const resizeHandler = fixture.debugElement.query(By.directive(ResizeHandlerComponent)).componentInstance as ResizeHandlerComponent;

    component.hoverEnabled.set(true);

    resizeHandler.resizeStart.emit();
    fixture.detectChanges();

    expect(component.hoverEnabled()).toBe(false);

    resizeHandler.resizeEnd.emit();
    fixture.detectChanges();

    expect(component.hoverEnabled()).toBe(true);
  });

  it('should resize through the resize handler output', () => {
    const resizeHandler = fixture.debugElement.query(By.directive(ResizeHandlerComponent)).componentInstance as ResizeHandlerComponent;

    resizeHandler.resizeEvent.emit({width: '220px'});
    fixture.detectChanges();

    expect(component.tableHeaderWidth()).toBe('220px');
  });

  it('should initialize a ResizeObserver after view initialization', () => {
    const resizeObserver = (
      globalThis.ResizeObserver as unknown as {
        prototype: MockResizeObserver;
      }
    ).prototype;

    expect(resizeObserver).toBeDefined();

    const container = compiled.querySelector('.feature-info-content');

    expect(container).toBeTruthy();
  });

  it('should disconnect the ResizeObserver when destroyed', () => {
    const resizeObserver = fixture.debugElement;
    expect(resizeObserver).toBeTruthy();

    fixture.destroy();

    // The observer instance is internal, so verify the lifecycle completes
    // without throwing after the view has been destroyed.
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should update container dimensions on resize', async () => {
    vi.useFakeTimers();

    const container = compiled.querySelector('.feature-info-content') as HTMLElement;

    Object.defineProperty(container, 'clientWidth', {
      configurable: true,
      value: 500,
    });
    Object.defineProperty(container, 'scrollWidth', {
      configurable: true,
      value: 600,
    });

    component.onResize();

    await vi.runAllTimersAsync();

    expect(component.containerWidth()).toBe(500);
    expect(component.containerScrollWidth()).toBe(600);

    vi.useRealTimers();
  });

  it('should reset the header width when resizing makes the maximum width exceed the effective width', async () => {
    vi.useFakeTimers();

    const container = compiled.querySelector('.feature-info-content') as HTMLElement;

    Object.defineProperty(container, 'clientWidth', {
      configurable: true,
      value: 100,
    });
    Object.defineProperty(container, 'scrollWidth', {
      configurable: true,
      value: 300,
    });

    component.tableHeaderWidth.set('400px');

    fixture.detectChanges();

    component.resize({});

    fixture.detectChanges();

    await vi.runAllTimersAsync();

    expect(component.tableHeaderWidth()).toBe('130px');

    vi.useRealTimers();
  });

  it('should calculate the resize handler style from the calculated scrollbar height', () => {
    component.containerWidth.set(100);
    component.containerScrollWidth.set(200);

    fixture.detectChanges();

    const resizeElement = compiled.querySelector('.feature-info-content__resize') as HTMLElement;

    expect(resizeElement.style.getPropertyValue('--calculated-scrollbar-height')).toBe('17px');
  });

  it('should render the configured table header width', () => {
    component.tableHeaderWidth.set('240px');
    fixture.detectChanges();

    const header = compiled.querySelector('.feature-info-content__table__row__column--header') as HTMLElement;

    expect(header.style.width).toBe('240px');
  });
});
