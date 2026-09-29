import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {ConfigService} from '../../../../shared/services/config.service';
import {Layer} from '../../../../shared/interfaces/legend.interface';
import {LegendContentComponent} from './legend-content.component';

describe('LegendContentComponent', () => {
  let component: LegendContentComponent;
  let fixture: ComponentFixture<LegendContentComponent>;
  let compiled: HTMLElement;

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

  const layer = signal<Layer>({
    layerClasses: undefined,
    layer: '',
    title: '',
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegendContentComponent],
      providers: [{provide: ConfigService, useValue: configServiceMock}],
    }).compileComponents();

    fixture = TestBed.createComponent(LegendContentComponent, {
      bindings: [inputBinding('layer', layer)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the configured static files base URL', () => {
    expect(component.staticFilesBaseUrl).toBe('https://example.test/static');
  });

  it('should show the empty state when the layer has no classes', () => {
    layer.set({
      layerClasses: undefined,
      layer: 'yes',
      title: 'Stuff',
    });
    fixture.detectChanges();

    const content = compiled.querySelector('.legend-content');

    expect(content).not.toBeNull();
    expect(content?.textContent?.trim()).toBe('Keine Klassen.');
    expect(compiled.querySelectorAll('.legend-item__class-list-entry')).toHaveLength(0);
  });

  it('should show the empty state when the layer has an empty class list', () => {
    layer.set({
      layerClasses: [],
      layer: 'yes',
      title: 'Stuff',
    });
    fixture.detectChanges();

    expect(compiled.querySelector('.legend-content')?.textContent?.trim()).toBe('Keine Klassen.');
    expect(compiled.querySelectorAll('.legend-item__class-list-entry')).toHaveLength(0);
  });

  it('should render all layer classes', () => {
    layer.set({
      layerClasses: [
        {
          label: 'Buildings',
          image: 'buildings.png',
        },
        {
          label: 'Roads',
          image: 'roads.png',
        },
      ],
      layer: 'yes',
      title: 'Stuff',
    });
    fixture.detectChanges();

    const entries = compiled.querySelectorAll('.legend-item__class-list-entry');

    expect(entries).toHaveLength(2);
    expect(compiled.textContent).toContain('Buildings');
    expect(compiled.textContent).toContain('Roads');
    expect(compiled.querySelector('.legend-content')?.textContent).not.toContain('Keine Klassen.');
  });

  it('should render each class label as the image alt text and title', () => {
    layer.set({
      layerClasses: [
        {
          label: 'Buildings',
          image: 'buildings.png',
        },
        {
          label: 'Roads',
          image: 'roads.png',
        },
      ],
      layer: 'yes',
      title: 'Stuff',
    });
    fixture.detectChanges();

    const images = compiled.querySelectorAll<HTMLImageElement>('.legend-item__class-list-entry__icon img');
    const labels = compiled.querySelectorAll<HTMLElement>('.legend-item__class-list-entry__text');

    expect(images).toHaveLength(2);
    expect(images[0].alt).toBe('Buildings');
    expect(images[1].alt).toBe('Roads');

    expect(labels).toHaveLength(2);
    expect(labels[0].textContent?.trim()).toBe('Buildings');
    expect(labels[0].title).toBe('Buildings');
    expect(labels[1].textContent?.trim()).toBe('Roads');
    expect(labels[1].title).toBe('Roads');
  });

  it('should construct the image URLs from the configured static files base URL', () => {
    layer.set({
      layerClasses: [
        {
          label: 'Buildings',
          image: 'symbols/buildings.png',
        },
        {
          label: 'Roads',
          image: 'symbols/roads.png',
        },
      ],
      layer: 'yes',
      title: 'Stuff',
    });
    fixture.detectChanges();

    const images = compiled.querySelectorAll<HTMLImageElement>('.legend-item__class-list-entry__icon img');

    expect(images[0].src).toBe('https://example.test/static/symbols/buildings.png');
    expect(images[1].src).toBe('https://example.test/static/symbols/roads.png');
  });

  it('should update the rendered classes when the layer input changes', () => {
    layer.set({
      layerClasses: [
        {
          label: 'Buildings',
          image: 'buildings.png',
        },
      ],
      layer: 'yes',
      title: 'Stuff',
    });
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.legend-item__class-list-entry')).toHaveLength(1);
    expect(compiled.textContent).toContain('Buildings');

    layer.set({
      layerClasses: [
        {
          label: 'Water',
          image: 'water.png',
        },
        {
          label: 'Forest',
          image: 'forest.png',
        },
      ],
      layer: 'yes',
      title: 'Stuff',
    });
    fixture.detectChanges();

    const entries = compiled.querySelectorAll('.legend-item__class-list-entry');

    expect(entries).toHaveLength(2);
    expect(compiled.textContent).not.toContain('Buildings');
    expect(compiled.textContent).toContain('Water');
    expect(compiled.textContent).toContain('Forest');
  });
});
