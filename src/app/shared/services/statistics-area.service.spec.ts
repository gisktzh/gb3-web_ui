import {TestBed} from '@angular/core/testing';
import * as geodeticAreaOperator from '@arcgis/core/geometry/operators/geodeticAreaOperator.js';
import {firstValueFrom} from 'rxjs';
import {PolygonWithSrs} from '../interfaces/geojson-types-with-srs.interface';
import {StatisticsAreaService} from './statistics-area.service';

vi.mock('@arcgis/core/geometry/operators/geodeticAreaOperator.js', () => ({
  load: vi.fn(() => Promise.resolve()),
  execute: vi.fn(),
}));

describe('StatisticsAreaService', () => {
  let service: StatisticsAreaService;
  const polygon: PolygonWithSrs = {
    type: 'Polygon',
    srs: 2056,
    coordinates: [
      [
        [2680000, 1254000],
        [2687000, 1254000],
        [2687000, 1260000],
        [2680000, 1260000],
        [2680000, 1254000],
      ],
    ],
  };

  beforeEach(() => {
    service = TestBed.inject(StatisticsAreaService);
    vi.mocked(geodeticAreaOperator.load).mockResolvedValue(undefined);
  });

  it('calculates 42 km2 in LV95 without loading a geodetic operator', async () => {
    expect(await firstValueFrom(service.calculateArea(polygon))).toBe(42_000_000);
    expect(geodeticAreaOperator.load).not.toHaveBeenCalled();
  });

  it('subtracts polygon holes regardless of winding order', async () => {
    const geometry: PolygonWithSrs = {
      ...polygon,
      coordinates: [
        ...polygon.coordinates,
        [
          [2680000, 1254000],
          [2681000, 1254000],
          [2681000, 1255000],
          [2680000, 1255000],
          [2680000, 1254000],
        ],
      ],
    };
    expect(await firstValueFrom(service.calculateArea(geometry))).toBe(41_000_000);
  });

  it('loads the geodetic operator for WGS84 and requests square metres, subtracting holes', async () => {
    vi.mocked(geodeticAreaOperator.execute).mockReturnValueOnce(-40_000_000).mockReturnValueOnce(1_000_000);
    const ring = [
      [8, 47],
      [8.01, 47],
      [8.01, 47.01],
      [8, 47.01],
      [8, 47],
    ];
    const geometry: PolygonWithSrs = {type: 'Polygon', srs: 4326, coordinates: [ring, ring]};
    expect(await firstValueFrom(service.calculateArea(geometry))).toBe(39_000_000);
    expect(geodeticAreaOperator.load).toHaveBeenCalledOnce();
    expect(geodeticAreaOperator.execute).toHaveBeenCalledTimes(2);
    const [esriPolygon, options] = vi.mocked(geodeticAreaOperator.execute).mock.calls[0];
    expect(esriPolygon.spatialReference.wkid).toBe(4326);
    expect(options).toEqual({unit: 'square-meters'});
  });

  it('propagates geodetic loading failures', async () => {
    vi.mocked(geodeticAreaOperator.load).mockRejectedValue(new Error('Projection unavailable'));
    await expect(firstValueFrom(service.calculateArea({...polygon, srs: 4326}))).rejects.toThrow('Projection unavailable');
  });

  it.each([
    {coordinates: []},
    {
      coordinates: [
        [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
        ],
      ],
    },
    {
      coordinates: [
        [
          [NaN, 0],
          [1, 0],
          [1, 1],
          [NaN, 0],
        ],
      ],
    },
  ])('rejects invalid or empty areas instead of treating them as valid selections ($coordinates)', async ({coordinates}) => {
    await expect(firstValueFrom(service.calculateArea({...polygon, coordinates}))).rejects.toThrow('finite, positive area');
  });
});
