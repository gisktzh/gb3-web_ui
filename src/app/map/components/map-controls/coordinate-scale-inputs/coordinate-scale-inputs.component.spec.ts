import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectCenterReadable, selectRoundedScale} from 'src/app/state/map/selectors/map-config.selector';
import {selectRotation} from '../../../../state/map/reducers/map-config.reducer';
import {MapConfigActions} from '../../../../state/map/actions/map-config.actions';
import {CoordinateParserService} from '../../../services/coordinate-parser.service';
import {ConfigService} from '../../../../shared/services/config.service';
import {MapRotationButtonComponent} from '../map-rotation-button/map-rotation-button.component';
import {CoordinateScaleInputsComponent} from './coordinate-scale-inputs.component';
import {PointWithSrs} from 'src/app/shared/interfaces/geojson-types-with-srs.interface';
import {DrawingLayerPrefix} from 'src/app/shared/enums/drawing-layer.enum';
import {provideUiTour} from 'ngx-ui-tour-md-menu';

describe('CoordinateScaleInputsComponent', () => {
  let component: CoordinateScaleInputsComponent;
  let fixture: ComponentFixture<CoordinateScaleInputsComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const coordinateParserServiceMock: Partial<CoordinateParserService> = {
    parse: vi.fn(),
  };

  const configServiceMock: Partial<ConfigService> = {
    mapConfig: {
      mapScaleConfig: {
        minScale: 1,
        maxScale: 1000000,
      },
      internalLayerPrefix: DrawingLayerPrefix.Drawing,
      userDrawingLayerPrefix: DrawingLayerPrefix.Drawing,
      locateMeZoom: 0,
      defaultMapConfig: {
        isMapServiceInitialized: false,
        center: {
          x: 0,
          y: 0,
        },
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
          min: {
            x: 0,
            y: 0,
          },
          max: {
            x: 0,
            y: 0,
          },
        },
        referenceDistanceInMeters: undefined,
      },
      editableLayerIds: [],
    },
  };

  beforeEach(async () => {
    vi.mocked(coordinateParserServiceMock.parse!).mockReset();

    await TestBed.configureTestingModule({
      imports: [CoordinateScaleInputsComponent],
      providers: [
        {provide: CoordinateParserService, useValue: coordinateParserServiceMock},
        {provide: ConfigService, useValue: configServiceMock},
        provideUiTour(),
        provideMockStore(),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectRoundedScale, 10000);
    store.overrideSelector(selectCenterReadable, '2600000, 1200000');
    store.overrideSelector(selectRotation, 0);
    store.refreshState();

    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(CoordinateScaleInputsComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the scale input with the current scale', () => {
    const input = compiled.querySelector('[aria-label="Massstab anpassen"]') as HTMLInputElement;

    expect(input.value).toBe('10000');
  });

  it('should render the coordinate input with the current map center', () => {
    const input = compiled.querySelector('[aria-label="Koordinaten eingeben"]') as HTMLInputElement;

    expect(input.value).toBe('2600000, 1200000');
  });

  it('should render the scale prefix', () => {
    const prefix = compiled.querySelector('.data-input__prefix');

    expect(prefix?.textContent).toBe('1:');
  });

  it('should pass the current rotation to the map rotation button', () => {
    const rotationButton = fixture.debugElement.query(By.directive(MapRotationButtonComponent))
      .componentInstance as MapRotationButtonComponent;

    expect(rotationButton.rotation()).toBe(0);
  });

  it('should update the scale input when the scale selector changes', () => {
    store.overrideSelector(selectRoundedScale, 5000);
    store.refreshState();
    fixture.detectChanges();

    const input = compiled.querySelector('[aria-label="Massstab anpassen"]') as HTMLInputElement;

    expect(input.value).toBe('5000');
  });

  it('should update the coordinate input when the map center selector changes', () => {
    store.overrideSelector(selectCenterReadable, '2700000, 1250000');
    store.refreshState();
    fixture.detectChanges();

    const input = compiled.querySelector('[aria-label="Koordinaten eingeben"]') as HTMLInputElement;

    expect(input.value).toBe('2700000, 1250000');
  });

  it('should update the rotation button when the rotation selector changes', () => {
    store.overrideSelector(selectRotation, 45);
    store.refreshState();
    fixture.detectChanges();

    const rotationButton = fixture.debugElement.query(By.directive(MapRotationButtonComponent))
      .componentInstance as MapRotationButtonComponent;

    expect(rotationButton.rotation()).toBe(45);
  });

  it('should dispatch the new scale when a valid different scale is entered', () => {
    const input = compiled.querySelector('[aria-label="Massstab anpassen"]') as HTMLInputElement;

    input.value = "20'000";
    input.dispatchEvent(new Event('input'));

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapConfigActions.setScale({scale: 20000}));
  });

  it('should not dispatch when the entered scale is equal to the current scale', () => {
    const input = compiled.querySelector('[aria-label="Massstab anpassen"]') as HTMLInputElement;

    input.value = '10000';
    input.dispatchEvent(new Event('input'));

    expect(storeDispatchSpy).not.toHaveBeenCalled();
  });

  it('should not dispatch when the entered scale is zero', () => {
    const input = compiled.querySelector('[aria-label="Massstab anpassen"]') as HTMLInputElement;

    input.value = '0';
    input.dispatchEvent(new Event('input'));

    expect(storeDispatchSpy).not.toHaveBeenCalled();
  });

  it('should dispatch the parsed map center when a valid coordinate is entered', () => {
    const center: PointWithSrs = {
      type: 'Point',
      coordinates: [47, 8],
      srs: 4326,
    };

    vi.mocked(coordinateParserServiceMock.parse!).mockReturnValue(center);

    const input = compiled.querySelector('[aria-label="Koordinaten eingeben"]') as HTMLInputElement;

    input.value = '2600000, 1200000';
    input.dispatchEvent(new Event('input'));

    expect(coordinateParserServiceMock.parse).toHaveBeenCalledWith('2600000, 1200000');
    expect(storeDispatchSpy).toHaveBeenCalledWith(MapConfigActions.setMapCenterAndDrawHighlight({center}));
  });

  it('should not dispatch when the coordinate parser returns no center', () => {
    vi.mocked(coordinateParserServiceMock.parse!).mockReturnValue(undefined);

    const input = compiled.querySelector('[aria-label="Koordinaten eingeben"]') as HTMLInputElement;

    input.value = 'invalid';
    input.dispatchEvent(new Event('input'));

    expect(coordinateParserServiceMock.parse).toHaveBeenCalledWith('invalid');
    expect(storeDispatchSpy).not.toHaveBeenCalled();
  });

  it('should parse and dispatch the map center when Enter is pressed', () => {
    const center: PointWithSrs = {
      type: 'Point',
      coordinates: [47, 8],
      srs: 4326,
    };

    vi.mocked(coordinateParserServiceMock.parse!).mockReturnValue(center);

    const input = compiled.querySelector('[aria-label="Koordinaten eingeben"]') as HTMLInputElement;

    input.value = '2600000, 1200000';
    input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));

    expect(coordinateParserServiceMock.parse).toHaveBeenCalledWith('2600000, 1200000');
    expect(storeDispatchSpy).toHaveBeenCalledWith(MapConfigActions.setMapCenterAndDrawHighlight({center}));
  });

  it('should set the scale through the public method', () => {
    const event = {
      target: {
        value: "25'000",
      },
    } as unknown as Event;

    component.setScale(event);

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapConfigActions.setScale({scale: 25000}));
  });

  it('should set the map center through the public method', () => {
    const center: PointWithSrs = {
      type: 'Point',
      coordinates: [47, 8],
      srs: 4326,
    };

    vi.mocked(coordinateParserServiceMock.parse!).mockReturnValue(center);

    const event = {
      target: {
        value: '2600000, 1200000',
      },
    } as unknown as Event;

    component.setMapCenterAndDrawHighlight(event);

    expect(coordinateParserServiceMock.parse).toHaveBeenCalledWith('2600000, 1200000');
    expect(storeDispatchSpy).toHaveBeenCalledWith(MapConfigActions.setMapCenterAndDrawHighlight({center}));
  });
});
