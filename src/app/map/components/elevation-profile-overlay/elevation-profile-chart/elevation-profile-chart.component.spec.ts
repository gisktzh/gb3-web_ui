import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {ElevationPlotConfigService} from './services/elevation-plot-config.service';
import {ElevationProfileChartComponent} from './elevation-profile-chart.component';
import {
  ElevationProfileData,
  ElevationProfileDataPoint,
  ElevationProfileDataPointXAxis,
  ElevationProfileDataPointYAxis,
} from '../../../../shared/interfaces/elevation-profile.interface';
import {ElevationProfileChartJsDataConfiguration} from './types/chartjs.type';
import {ElevationProfileChartJsOptions} from './interfaces/chartjs.interface';
import {ElevationProfileActions} from '../../../../state/map/actions/elevation-profile.actions';
import {Chart, ChartConfiguration, ChartDataset, ChartTypeRegistry, Point} from 'chart.js';

describe('ElevationProfileChartComponent', () => {
  let component: ElevationProfileChartComponent;
  let fixture: ComponentFixture<ElevationProfileChartComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const chartMock = vi.fn(
    class {
      public readonly data = {};
    },
  );

  const chartOptions = {
    scales: {
      x: {
        max: 0,
      },
    },
  } as ElevationProfileChartJsOptions;

  const createElevationProfileDatasetImpl = (dataPoints: ElevationProfileDataPoint[], label: string) => ({
    parsing: {
      xAxisKey: 'distance' as keyof ElevationProfileDataPointXAxis,
      yAxisKey: 'altitude' as keyof ElevationProfileDataPointYAxis,
    },
    label,
    data: dataPoints.map((dataPoint) => ({
      x: dataPoint.distance,
      y: dataPoint.altitude,
      location: dataPoint.location,
      elevation: 12,
      distance: 12,
      altitude: 12,
    })),
  });

  const elevationPlotConfigServiceMock: Partial<ElevationPlotConfigService> = {
    getElevationPlotChartOptions: vi.fn(() => chartOptions),
    createElevationProfileDataset: vi.fn(createElevationProfileDatasetImpl),
  };

  const dataPoint = {
    distance: 100,
    altitude: 500,
    location: {
      type: 'Point',
      coordinates: [8.5, 47.3],
      srs: 2056,
    },
  } as ElevationProfileDataPoint;

  const secondDataPoint = {
    distance: 200,
    altitude: 550,
    location: {
      type: 'Point',
      coordinates: [8.6, 47.4],
      srs: 2056,
    },
  } as ElevationProfileDataPoint;

  const createElevationProfileData = (dataPoints: ElevationProfileDataPoint[], linearDistance = 200): ElevationProfileData =>
    ({
      dataPoints,
      statistics: {
        linearDistance,
      },
    }) as ElevationProfileData;

  const elevationProfileData = signal<ElevationProfileData>(createElevationProfileData([dataPoint, secondDataPoint]));

  const dataPoint1: ChartDataset<keyof ChartTypeRegistry, (number | [number, number] | Point | null)[]> = {
    type: 'line',
    data: [100, 200],
  };

  const chartConfig: ChartConfiguration = {
    type: 'line' as keyof ChartTypeRegistry,
    data: {
      datasets: [dataPoint1],
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    chartOptions.scales.x.max = 0;

    await TestBed.configureTestingModule({
      imports: [ElevationProfileChartComponent],
      providers: [
        {
          provide: ElevationPlotConfigService,
          useValue: elevationPlotConfigServiceMock,
        },
        provideMockStore(),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(ElevationProfileChartComponent, {
      bindings: [inputBinding('elevationProfileData', elevationProfileData)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the chart canvas', () => {
    expect(compiled.querySelector('canvas')).not.toBeNull();
  });

  it('should not create a dataset when there are no data points', () => {
    elevationProfileData.set(createElevationProfileData([]));
    elevationPlotConfigServiceMock.createElevationProfileDataset = vi.fn(createElevationProfileDatasetImpl);

    fixture = TestBed.createComponent(ElevationProfileChartComponent, {
      bindings: [inputBinding('elevationProfileData', elevationProfileData)],
    });
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    expect(elevationPlotConfigServiceMock.createElevationProfileDataset).not.toHaveBeenCalled();
    expect(component.lineChartData().datasets).toHaveLength(0);
  });

  it('should create an elevation dataset for multiple data points', () => {
    elevationProfileData.set(createElevationProfileData([dataPoint, secondDataPoint]));
    fixture = TestBed.createComponent(ElevationProfileChartComponent, {
      bindings: [inputBinding('elevationProfileData', elevationProfileData)],
    });
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    expect(elevationPlotConfigServiceMock.createElevationProfileDataset).toHaveBeenCalledWith([dataPoint, secondDataPoint], 'MüM');
    expect(component.lineChartData().datasets).toHaveLength(1);
  });

  it('should update the chart maximum distance from the profile statistics', () => {
    elevationProfileData.set(createElevationProfileData([dataPoint, secondDataPoint]));
    fixture = TestBed.createComponent(ElevationProfileChartComponent, {
      bindings: [inputBinding('elevationProfileData', elevationProfileData)],
    });
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    expect(component.lineChartOptions().scales.x.max).toBe(200);
  });

  it('should pass the configured chart options to the chart', () => {
    expect(component.lineChartOptions()).toBe(chartOptions);

    const canvas = compiled.querySelector('canvas');

    expect(canvas).not.toBeNull();
  });

  it('should dispatch a request to remove the elevation profile hover location when the chart is left', () => {
    compiled.querySelector('.elevation-profile-chart')?.dispatchEvent(new MouseEvent('mouseleave'));

    expect(storeDispatchSpy).toHaveBeenCalledWith(ElevationProfileActions.removeElevationProfileHoverLocation());
  });

  it('should dispatch the hovered location when hovering a chart element', () => {
    elevationProfileData.set(createElevationProfileData([dataPoint, secondDataPoint]));
    fixture = TestBed.createComponent(ElevationProfileChartComponent, {
      bindings: [inputBinding('elevationProfileData', elevationProfileData)],
    });
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    const onHover = component.lineChartOptions().onHover;

    expect(onHover).toBeDefined();

    onHover?.(
      {} as Parameters<NonNullable<ElevationProfileChartJsOptions['onHover']>>[0],
      [{datasetIndex: 0, index: 1}] as Parameters<NonNullable<ElevationProfileChartJsOptions['onHover']>>[1],
      new chartMock() as Chart,
    );

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      ElevationProfileActions.drawElevationProfileHoverLocation({
        location: secondDataPoint.location,
      }),
    );
  });

  it('should not dispatch a hover location when there are no hovered chart elements', () => {
    const onHover = component.lineChartOptions().onHover;

    expect(onHover).toBeDefined();

    onHover?.(
      {} as Parameters<NonNullable<ElevationProfileChartJsOptions['onHover']>>[0],
      [],
      new Chart(compiled.querySelector('canvas')!, chartConfig),
    );

    expect(storeDispatchSpy).not.toHaveBeenCalled();
  });

  it('should use the first hovered chart element when multiple elements are hovered', () => {
    elevationProfileData.set(createElevationProfileData([dataPoint, secondDataPoint]));
    fixture = TestBed.createComponent(ElevationProfileChartComponent, {
      bindings: [inputBinding('elevationProfileData', elevationProfileData)],
    });
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    const onHover = component.lineChartOptions().onHover;

    expect(onHover).toBeDefined();

    onHover?.(
      {} as Parameters<NonNullable<ElevationProfileChartJsOptions['onHover']>>[0],
      [
        {datasetIndex: 0, index: 0},
        {datasetIndex: 0, index: 1},
      ] as Parameters<NonNullable<ElevationProfileChartJsOptions['onHover']>>[1],
      new Chart(compiled.querySelector('canvas')!, chartConfig),
    );

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      ElevationProfileActions.drawElevationProfileHoverLocation({
        location: dataPoint.location,
      }),
    );
  });

  it('should use the dataset index when drawing the hovered location', () => {
    const secondDatasetPoint = {
      distance: 300,
      elevation: 600,
      location: {
        x: 8.7,
        y: 47.5,
      },
    } as unknown as ElevationProfileDataPoint;

    component.lineChartData().datasets.push({
      label: 'Second dataset',
      data: [
        {
          x: secondDatasetPoint.distance,
          y: secondDatasetPoint.altitude,
          location: secondDatasetPoint.location,
        },
      ],
    } as unknown as ElevationProfileChartJsDataConfiguration['datasets'][number]);

    const onHover = component.lineChartOptions().onHover;

    expect(onHover).toBeDefined();

    onHover?.(
      {} as Parameters<NonNullable<ElevationProfileChartJsOptions['onHover']>>[0],
      [{datasetIndex: 0, index: 0}] as Parameters<NonNullable<ElevationProfileChartJsOptions['onHover']>>[1],
      new Chart(compiled.querySelector('canvas')!, chartConfig),
    );

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      ElevationProfileActions.drawElevationProfileHoverLocation({
        location: {
          type: 'Point',
          coordinates: [8.5, 47.3],
          srs: 2056,
        },
      }),
    );
  });
});
