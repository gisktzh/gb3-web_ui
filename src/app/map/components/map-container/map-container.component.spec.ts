import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MapService} from '../../interfaces/map.service';
import {FeatureHighlightingService} from '../../services/feature-highlighting.service';
import {MAP_SERVICE} from '../../../app.tokens';
import {MapContainerComponent} from './map-container.component';
import {provideMockStore} from '@ngrx/store/testing';

describe('MapContainerComponent', () => {
  let component: MapContainerComponent;
  let fixture: ComponentFixture<MapContainerComponent>;
  let compiled: HTMLElement;

  const mapServiceMock: Partial<MapService> = {
    assignMapElement: vi.fn(),
    deInit: vi.fn(),
  };

  const featureHighlightingServiceMock: Partial<FeatureHighlightingService> = {
    init: vi.fn(),
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
