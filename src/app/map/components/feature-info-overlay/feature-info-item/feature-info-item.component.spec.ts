import {Component, input, inputBinding, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FeatureInfoResultDisplay} from '../../../../shared/interfaces/feature-info.interface';
import {MapOverlayListItemComponent} from '../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {FeatureInfoContentComponent} from '../feature-info-content/feature-info-content.component';
import {FeatureInfoReportDownloadComponent} from '../feature-info-report-download/feature-info-report-download.component';
import {FeatureInfoItemComponent} from './feature-info-item.component';

@Component({
  selector: 'map-overlay-list-item',
  standalone: true,
  template: '<ng-content />',
})
class MockMapOverlayListItemComponent {
  public readonly forceExpanded = input<boolean>();
  public readonly overlayTitle = input<string>();
  public readonly metaDataLink = input<string | undefined>();
  public readonly disabled = input<boolean>();
  public readonly hasBackgroundColor = input<boolean>();
  public readonly showInteractiveElements = input<boolean>();
}

@Component({
  selector: 'feature-info-content',
  standalone: true,
  template: '',
})
class MockFeatureInfoContentComponent {
  public readonly layer = input<unknown>();
  public readonly topicId = input<string>();
}

@Component({
  selector: 'feature-info-report-download',
  standalone: true,
  template: '',
})
class MockFeatureInfoReportDownloadComponent {
  public readonly reportUrl = input<string>();
  public readonly reportDescription = input<string>();
}

describe('FeatureInfoItemComponent', () => {
  let component: FeatureInfoItemComponent;
  let fixture: ComponentFixture<FeatureInfoItemComponent>;
  let compiled: HTMLElement;

  const showInteractiveElements = signal(true);

  const createFeatureInfo = (overrides: Partial<FeatureInfoResultDisplay> = {}): FeatureInfoResultDisplay =>
    ({
      id: 'feature-1',
      title: 'Feature title',
      metaDataLink: 'https://example.com/metadata',
      icon: undefined,
      isSingleLayer: false,
      report: {
        url: undefined,
        description: 'Report description',
      },
      layers: [],
      ...overrides,
    }) as FeatureInfoResultDisplay;

  const createLayer = (overrides = {}) => ({
    title: 'Layer title',
    metaDataLink: 'https://example.com/layer-metadata',
    features: [],
    layer: 'layer-id',
    ...overrides,
  });

  const featureInfo = signal(createFeatureInfo());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureInfoItemComponent],
    })
      .overrideComponent(FeatureInfoItemComponent, {
        remove: {
          imports: [MapOverlayListItemComponent, FeatureInfoContentComponent, FeatureInfoReportDownloadComponent],
        },
        add: {
          imports: [MockMapOverlayListItemComponent, MockFeatureInfoContentComponent, MockFeatureInfoReportDownloadComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(FeatureInfoItemComponent, {
      bindings: [inputBinding('featureInfo', featureInfo), inputBinding('showInteractiveElements', showInteractiveElements)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass title and metadata link to the main overlay', () => {
    const overlay = fixture.debugElement.query((element) => element.componentInstance instanceof MockMapOverlayListItemComponent)
      .componentInstance as MockMapOverlayListItemComponent;

    expect(overlay.forceExpanded()).toBe(true);
    expect(overlay.overlayTitle()).toBe('Feature title');
    expect(overlay.metaDataLink()).toBe('https://example.com/metadata');
  });

  it('should hide metadata link when interactive elements are disabled', () => {
    showInteractiveElements.set(false);
    fixture.detectChanges();

    const overlay = fixture.debugElement.query((element) => element.componentInstance instanceof MockMapOverlayListItemComponent)
      .componentInstance as MockMapOverlayListItemComponent;

    expect(overlay.metaDataLink()).toBeUndefined();
  });

  it('should render report download for a multi-layer result with a report URL', () => {
    featureInfo.set(
      createFeatureInfo({
        report: {
          url: 'https://example.com/report.pdf',
          description: 'Download report',
        },
      }),
    );

    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    const report = fixture.debugElement.query((element) => element.componentInstance instanceof MockFeatureInfoReportDownloadComponent)
      .componentInstance as MockFeatureInfoReportDownloadComponent;

    expect(report.reportUrl()).toBe('https://example.com/report.pdf');
    expect(report.reportDescription()).toBe('Download report');
  });

  it('should not render report download for a multi-layer result without a report URL', () => {
    featureInfo.set(
      createFeatureInfo({
        report: {
          url: null,
          description: null,
        },
      }),
    );

    fixture.detectChanges();

    const report = fixture.debugElement.query((element) => element.componentInstance instanceof MockFeatureInfoReportDownloadComponent);

    expect(report).toBeNull();
  });

  it('should not render report download for a single-layer result', () => {
    featureInfo.set(
      createFeatureInfo({
        isSingleLayer: true,
        report: {
          url: 'https://example.com/report.pdf',
          description: 'Download report',
        },
      }),
    );

    fixture.detectChanges();

    expect(fixture.debugElement.query((element) => element.componentInstance instanceof MockFeatureInfoReportDownloadComponent)).toBeNull();
  });

  it('should render a sublayer overlay for multi-layer results', () => {
    const layer = createLayer({
      features: [{fid: 1}],
    });

    featureInfo.set(
      createFeatureInfo({
        layers: [layer],
      }),
    );

    showInteractiveElements.set(true);

    fixture.detectChanges();

    const overlays = fixture.debugElement.queryAll((element) => element.componentInstance instanceof MockMapOverlayListItemComponent);

    expect(overlays).toHaveLength(2);

    const sublayerOverlay = overlays[1].componentInstance as MockMapOverlayListItemComponent;

    expect(sublayerOverlay.forceExpanded()).toBe(true);
    expect(sublayerOverlay.disabled()).toBe(false);
    expect(sublayerOverlay.overlayTitle()).toBe('Layer title');
    expect(sublayerOverlay.metaDataLink()).toBe('https://example.com/layer-metadata');
    expect(sublayerOverlay.hasBackgroundColor()).toBe(false);
    expect(sublayerOverlay.showInteractiveElements()).toBe(true);
  });

  it('should disable and collapse a sublayer when it has no features', () => {
    const layer = createLayer({
      features: [],
    });

    featureInfo.set(
      createFeatureInfo({
        layers: [layer],
      }),
    );

    fixture.detectChanges();

    const overlays = fixture.debugElement.queryAll((element) => element.componentInstance instanceof MockMapOverlayListItemComponent);

    const sublayerOverlay = overlays[1].componentInstance as MockMapOverlayListItemComponent;

    expect(sublayerOverlay.forceExpanded()).toBe(false);
    expect(sublayerOverlay.disabled()).toBe(true);
  });

  it('should pass interactive elements state to a sublayer overlay', () => {
    showInteractiveElements.set(false);

    const layer = createLayer({
      features: [{fid: 1}],
    });

    featureInfo.set(
      createFeatureInfo({
        layers: [layer],
      }),
    );

    fixture.detectChanges();

    const overlays = fixture.debugElement.queryAll((element) => element.componentInstance instanceof MockMapOverlayListItemComponent);

    const sublayerOverlay = overlays[1].componentInstance as MockMapOverlayListItemComponent;

    expect(sublayerOverlay.showInteractiveElements()).toBe(false);
  });

  it('should render feature info content inside a multi-layer sublayer', () => {
    const layer = createLayer({
      features: [{fid: 1}],
    });

    featureInfo.set(
      createFeatureInfo({
        layers: [layer],
      }),
    );

    fixture.detectChanges();

    const content = fixture.debugElement.query((element) => element.componentInstance instanceof MockFeatureInfoContentComponent)
      .componentInstance as MockFeatureInfoContentComponent;

    expect(content.layer()).toBe(layer);
    expect(content.topicId()).toBe('feature-1');
  });

  it('should render feature info content directly for a single-layer result', () => {
    const layer = createLayer({
      features: [{fid: 1}],
    });

    featureInfo.set(
      createFeatureInfo({
        isSingleLayer: true,
        layers: [layer],
      }),
    );

    fixture.detectChanges();

    const content = fixture.debugElement.query((element) => element.componentInstance instanceof MockFeatureInfoContentComponent)
      .componentInstance as MockFeatureInfoContentComponent;

    expect(content.layer()).toBe(layer);
    expect(content.topicId()).toBe('feature-1');

    expect(fixture.debugElement.queryAll((element) => element.componentInstance instanceof MockMapOverlayListItemComponent).length).toBe(1);
  });

  it('should render the configured icon for a multi-layer result', () => {
    featureInfo.set(
      createFeatureInfo({
        icon: '/test-icon.png',
      }),
    );

    fixture.detectChanges();

    const image = compiled.querySelector('.feature-info-item-icon');

    expect(image).toBeTruthy();
    expect(image?.getAttribute('src')).toBe('/test-icon.png');
    expect(image?.getAttribute('alt')).toBe('Feature title');
  });

  it('should render the layers icon when there is no configured icon', () => {
    featureInfo.set(
      createFeatureInfo({
        icon: undefined,
      }),
    );

    fixture.detectChanges();

    expect(compiled.querySelector('mat-icon.feature-info-item-icon')?.textContent).toContain('layers');
  });

  it('should render the layers icon for a single-layer result even when an icon is configured', () => {
    featureInfo.set(
      createFeatureInfo({
        isSingleLayer: true,
        icon: '/test-icon.png',
      }),
    );

    fixture.detectChanges();

    expect(compiled.querySelector('img.feature-info-item-icon')).toBeNull();
    expect(compiled.querySelector('mat-icon.feature-info-item-icon')?.textContent).toContain('layers');
  });

  it('should render multiple layers', () => {
    const firstLayer = createLayer({title: 'First layer'});
    const secondLayer = createLayer({title: 'Second layer'});

    featureInfo.set(
      createFeatureInfo({
        layers: [firstLayer, secondLayer],
      }),
    );

    fixture.detectChanges();

    const contentComponents = fixture.debugElement.queryAll(
      (element) => element.componentInstance instanceof MockFeatureInfoContentComponent,
    );

    expect(contentComponents).toHaveLength(2);
  });
});
