import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MapService} from '../../interfaces/map.service';
import {FeatureHighlightingService} from '../../services/feature-highlighting.service';
import {MAP_SERVICE} from '../../../app.tokens';
import {MapContainerComponent} from './map-container.component';
import {provideMockStore} from '@ngrx/store/testing';
import {EsriStylesLoaderService} from '../../services/esri-services/esri-styles-loader.service';

describe('MapContainerComponent', () => {
  let component: MapContainerComponent;
  let fixture: ComponentFixture<MapContainerComponent>;
  let compiled: HTMLElement;

  const mapServiceMock: Partial<MapService> = {
    assignMapElement: vi.fn(),
    deInit: vi.fn(),
    setViewPadding: vi.fn(),
  };

  const featureHighlightingServiceMock: Partial<FeatureHighlightingService> = {
    init: vi.fn(),
  };

  const esriStylesLoaderServiceMock: Partial<EsriStylesLoaderService> = {
    ensureLoaded: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [MapContainerComponent],
      providers: [
        {provide: MAP_SERVICE, useValue: mapServiceMock},
        {
          provide: FeatureHighlightingService,
          useValue: featureHighlightingServiceMock,
        },
        {provide: EsriStylesLoaderService, useValue: esriStylesLoaderServiceMock},
        provideMockStore(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MapContainerComponent);
    fixture.detectChanges();

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the map container', () => {
    const mapElement = compiled.querySelector('.map-container');

    expect(mapElement).toBeTruthy();
  });

  it('loads the ArcGIS styles when the map container is created', () => {
    expect(esriStylesLoaderServiceMock.ensureLoaded).toHaveBeenCalledOnce();
  });

  it('should assign the rendered map element to the map service after view initialization', () => {
    const mapElement = compiled.querySelector('.map-container');

    expect(mapServiceMock.assignMapElement).toHaveBeenCalledOnce();
    expect(mapServiceMock.assignMapElement).toHaveBeenCalledWith(mapElement);
  });

  it('should deinitialize the map service when destroyed', () => {
    fixture.destroy();

    expect(mapServiceMock.deInit).toHaveBeenCalledOnce();
  });
});
