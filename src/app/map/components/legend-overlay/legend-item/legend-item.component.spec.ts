import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, input, inputBinding, signal} from '@angular/core';
import {LegendDisplay, LegendLayer} from '../../../../shared/interfaces/legend.interface';
import {ConfigService} from '../../../../shared/services/config.service';
import {LegendItemComponent} from './legend-item.component';
import {provideRouter} from '@angular/router';
import {LegendContentComponent} from '../legend-content/legend-content.component';
import {ToggleButtonPosition} from 'src/app/map/types/toggle-button-position.type';
import {MapOverlayListItemComponent} from '../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {By} from '@angular/platform-browser';

describe('LegendItemComponent', () => {
  let component: LegendItemComponent;
  let fixture: ComponentFixture<LegendItemComponent>;
  let compiled: HTMLElement;

  @Component({
    selector: 'legend-content',
    template: '<div><a [attr.href]="layer().metaDataLink">{{ layer().title }}</a></div>',
  })
  class MockLegendContentComponent {
    public readonly layer = input.required<LegendLayer>();
  }

  @Component({
    selector: 'map-overlay-list-item',
    template: `
      <div>
        <ng-content select="[header-icon]" />
        <p>
          {{ overlayTitle() }}
        </p>
        <div><ng-content /></div>
      </div>
    `,
  })
  class MockMapOverlayListItemComponent {
    public readonly overlayTitle = input('');
    public readonly metaDataLink = input<string>();
    public readonly forceExpanded = input(false);
    public readonly disabled = input(false);
    public readonly toggleButtonPosition = input<ToggleButtonPosition>('start');
    public readonly removeContentIndent = input(false);
    public readonly hasBackgroundColor = input(true);
    public readonly showInteractiveElements = input(true);
  }

  const configServiceMock: Partial<ConfigService> = {
    apiConfig: {
      gb2StaticFiles: {
        baseUrl: 'https://example.test/static',
      },
      gb2Api: {
        version: '',
        baseUrl: '',
      },
      gb2WmsCapabilities: {
        baseUrl: '',
      },
      gb2Wms: {
        baseUrl: '',
      },
      geoLion: {
        baseUrl: '',
      },
      ktzhWebsite: {
        useMockData: false,
        baseUrl: '',
      },
      gravCms: {
        useMockData: false,
        baseUrl: '',
      },
      geoshopApi: {
        baseUrl: '',
      },
      ownershipInformationApi: {
        baseUrl: '',
      },
      swisstopoRestApi: {
        baseUrl: '',
      },
    },
  };

  const layer: LegendLayer = {
    title: 'Layer 1',
    metaDataLink: 'https://example.test/layer-1',
    layer: '',
  };

  const secondLayer: LegendLayer = {
    title: 'Layer 2',
    metaDataLink: 'https://example.test/layer-2',
    layer: '',
  };

  const createLegendItem = (overrides: Partial<LegendDisplay> = {}): LegendDisplay => ({
    id: 'yes',
    mapId: 'yes',
    title: 'Test legend',
    metaDataLink: 'https://example.test/legend',
    icon: 'https://example.test/icon.png',
    isSingleLayer: false,
    layers: [layer, secondLayer],
    ...overrides,
  });

  const legendItem = signal<LegendDisplay>(createLegendItem());
  const showInteractiveElements = signal(true);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegendItemComponent],
      providers: [{provide: ConfigService, useValue: configServiceMock}, provideRouter([])],
    })
      .overrideComponent(LegendItemComponent, {
        remove: {
          imports: [LegendContentComponent, MapOverlayListItemComponent],
        },
        add: {
          imports: [MockLegendContentComponent, MockMapOverlayListItemComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LegendItemComponent, {
      bindings: [inputBinding('legendItem', legendItem), inputBinding('showInteractiveElements', showInteractiveElements)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('layers', () => {
    it('should render every layer', () => {
      const layerItems = compiled.querySelectorAll('.legend-item');

      expect(layerItems).toHaveLength(2);
      expect(compiled.textContent).toContain('Layer 1');
      expect(compiled.textContent).toContain('Layer 2');
    });

    it('should render no layer items when the legend has no layers', () => {
      legendItem.set(createLegendItem({layers: []}));
      fixture.detectChanges();

      expect(compiled.querySelectorAll('.legend-item')).toHaveLength(0);
    });

    it('should render a nested overlay list item for a multi-layer legend', () => {
      legendItem.set(
        createLegendItem({
          isSingleLayer: false,
          layers: [layer],
        }),
      );
      fixture.detectChanges();

      const nestedItems = compiled.querySelectorAll('.legend-item map-overlay-list-item');

      expect(nestedItems).toHaveLength(1);
      expect(nestedItems[0].textContent).toContain('Layer 1');
    });

    it('should render legend content directly for a single-layer legend', () => {
      legendItem.set(
        createLegendItem({
          isSingleLayer: true,
          layers: [layer],
        }),
      );
      fixture.detectChanges();

      const layerItems = compiled.querySelectorAll('.legend-item');
      expect(layerItems).toHaveLength(1);

      expect(layerItems[0].querySelector('map-overlay-list-item')).toBeNull();
      expect(layerItems[0].querySelector('legend-content')).not.toBeNull();
    });
  });

  describe('header icon', () => {
    it('should render the configured icon for a multi-layer legend when an icon is provided', () => {
      legendItem.set(
        createLegendItem({
          isSingleLayer: false,
          icon: 'https://example.test/custom-icon.png',
        }),
      );
      fixture.detectChanges();

      const image = compiled.querySelector('img.legend-item-icon') as HTMLImageElement | null;

      expect(image).not.toBeNull();
      expect(image?.src).toBe('https://example.test/custom-icon.png');
      expect(image?.alt).toBe('Test legend');
      expect(image?.width).toBe(24);
      expect(image?.height).toBe(24);
    });

    it('should render the layers icon when a multi-layer legend has no icon', () => {
      legendItem.set(
        createLegendItem({
          isSingleLayer: false,
          icon: undefined,
        }),
      );
      fixture.detectChanges();

      expect(compiled.querySelector('img.legend-item-icon')).toBeNull();

      const icons = compiled.querySelectorAll('mat-icon.legend-item-icon');

      expect(icons).toHaveLength(3);
      expect(icons[0].textContent?.trim()).toBe('layers');
    });

    it('should render the layers icon for a single-layer legend even when an icon is provided', () => {
      legendItem.set(
        createLegendItem({
          isSingleLayer: true,
          icon: 'https://example.test/custom-icon.png',
        }),
      );
      fixture.detectChanges();

      expect(compiled.querySelector('img.legend-item-icon')).toBeNull();

      const icons = compiled.querySelectorAll('mat-icon.legend-item-icon');

      expect(icons).toHaveLength(1);
      expect(icons[0].textContent?.trim()).toBe('layers');
    });
  });

  describe('interactive elements', () => {
    it('should use the legend metadata link when interactive elements are enabled', () => {
      legendItem.set(
        createLegendItem({
          isSingleLayer: false,
          icon: 'https://example.test/custom-icon.png',
        }),
      );
      showInteractiveElements.set(true);
      fixture.detectChanges();

      const overlayItems = compiled.querySelectorAll('map-overlay-list-item');

      expect(overlayItems).toHaveLength(3);

      const outerMapOverlayListItem = fixture.debugElement.query(By.directive(MockMapOverlayListItemComponent))
        .componentInstance as MockMapOverlayListItemComponent;
      expect(outerMapOverlayListItem.metaDataLink()).toBe('https://example.test/legend');
    });

    it('should remove the legend metadata link when interactive elements are disabled', () => {
      showInteractiveElements.set(false);
      fixture.detectChanges();

      expect(component.showInteractiveElements()).toBe(false);

      const outerOverlayItem = compiled.querySelector('map-overlay-list-item');

      expect(outerOverlayItem).not.toBeNull();
      expect(outerOverlayItem?.getAttribute('metadatalink')).toBeNull();
    });

    it('should pass the interactive-elements state to nested layer items', () => {
      showInteractiveElements.set(false);
      fixture.detectChanges();

      const items = fixture.debugElement
        .queryAll(By.directive(MockMapOverlayListItemComponent))
        .map((i) => i.componentInstance as MockMapOverlayListItemComponent);

      expect(items[1].showInteractiveElements()).toBe(false);
      expect(items[2].showInteractiveElements()).toBe(false);
    });

    it('should render the nested layer metadata links regardless of the interactive-elements state', () => {
      showInteractiveElements.set(false);
      fixture.detectChanges();

      const items = fixture.debugElement
        .queryAll(By.directive(MockMapOverlayListItemComponent))
        .map((i) => i.componentInstance as MockMapOverlayListItemComponent);

      expect(items[1].metaDataLink()).toBe('https://example.test/layer-1');
      expect(items[2].metaDataLink()).toBe('https://example.test/layer-2');
    });
  });

  describe('static files configuration', () => {
    it('should expose the configured static files base URL', () => {
      expect(component.staticFilesBaseUrl).toBe('https://example.test/static');
    });
  });
});
