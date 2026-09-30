/* eslint-disable @typescript-eslint/naming-convention */

import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {firstValueFrom} from 'rxjs';
import {statisticsMapQueries} from '../../../configs/statistics.config';
import {GeometryWithSrs, PolygonWithSrs} from '../../../interfaces/geojson-types-with-srs.interface';
import {TopicsStatisticInfoListData} from '../../../models/gb3-api-generated.interfaces';
import {createCircle} from '../../../utils/statistics-geometry.utils';
import {ConfigService} from '../../config.service';
import {Gb3StatisticsService} from './gb3-statistics.service';

describe('Gb3StatisticsService', () => {
  let service: Gb3StatisticsService;
  let http: HttpTestingController;
  let endpoint: string;
  let response: TopicsStatisticInfoListData;

  const polygon: PolygonWithSrs = {
    type: 'Polygon',
    srs: 2056,
    coordinates: [
      [
        [2680000, 1254000],
        [2680000, 1255000],
        [2681000, 1255000],
        [2680000, 1254000],
      ],
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore(), provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Gb3StatisticsService);
    http = TestBed.inject(HttpTestingController);
    const config = TestBed.inject(ConfigService);
    endpoint = `${config.apiConfig.gb2Api.baseUrl}/${config.apiConfig.gb2Api.version}/topics/StatBeschaeftigteZH/statistic_info`;
    response = {
      statistic_info: {
        topic: 'StatBeschaeftigteZH',
        topic_title: 'Employment statistics',
        geolion_karten_uuid: 'map-uuid',
        layer: 'stat-ent-p',
        layer_title: 'Employment',
        geolion_geodatensatz_uuid: 'dataset-uuid',
        fields: ['anz_besch', 'anz_vzae', 'anz_ast'],
        statistic: 'sum',
        geometry: '2680595,1254504,1000',
        srid: 2056,
        feature_geometry: null,
        results: {
          anz_besch: {alias: 'Employees', value: 1234, count: 10},
          anz_vzae: {alias: 'Full-time equivalents', value: '1050.5', count: 9},
          anz_ast: {alias: 'Workplaces', value: 0, count: 10},
        },
      },
    };
  });

  afterEach(() => {
    http.verify();
  });

  it('keeps both statistics maps configured but defers the unknown population fields', () => {
    expect(Object.keys(statisticsMapQueries)).toEqual(['StatBevoelkerungZH', 'StatBeschaeftigteZH']);
    expect(statisticsMapQueries['StatBevoelkerungZH']).toEqual([]);
  });

  it('sends the configured employment query with polygon WKT and the input SRID', async () => {
    const result = firstValueFrom(service.loadStatistics(polygon));
    const request = http.expectOne((req) => req.url.startsWith(`${endpoint}?`));
    const url = new URL(request.request.url);

    expect(request.request.method).toBe('GET');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      layer: 'stat-ent-p',
      field: 'anz_besch,anz_vzae,anz_ast',
      statistic: 'sum',
      geometry: 'POLYGON((2680000 1254000,2680000 1255000,2681000 1255000,2680000 1254000))',
      srid: '2056',
    });
    request.flush(response);
    await result;
  });

  it('maps aliases, numeric strings, zero values, titles and metadata links', async () => {
    const result = firstValueFrom(service.loadStatistics(polygon));
    http.expectOne((req) => req.url.startsWith(`${endpoint}?`)).flush(response);

    expect(await result).toEqual([
      {
        topic: 'StatBeschaeftigteZH',
        title: 'Employment statistics',
        metaDataLink: '/data/maps/map-uuid',
        layers: [
          {
            layer: 'stat-ent-p',
            title: 'Employment',
            metaDataLink: '/data/datasets/dataset-uuid',
            columns: ['Summe'],
            status: 'ok',
            rows: [
              {label: 'Employees', values: [{value: 1234, unit: null}], isGroupHeader: false},
              {label: 'Full-time equivalents', values: [{value: 1050.5, unit: null}], isGroupHeader: false},
              {label: 'Workplaces', values: [{value: 0, unit: null}], isGroupHeader: false},
            ],
          },
        ],
      },
    ]);
  });

  it('preserves the response field order and null values when other fields have data', async () => {
    response.statistic_info.fields = ['anz_ast', 'anz_besch', 'anz_vzae'];
    response.statistic_info.results['anz_besch'] = {alias: 'Employees', value: null, count: 0};
    const result = firstValueFrom(service.loadStatistics(polygon));
    http.expectOne((req) => req.url.startsWith(`${endpoint}?`)).flush(response);

    const layer = (await result)[0].layers[0];
    expect(layer.status).toBe('ok');
    expect(layer.rows.map((row) => row.label)).toEqual(['Workplaces', 'Employees', 'Full-time equivalents']);
    expect(layer.rows[1].values).toEqual([{value: null, unit: null}]);
  });

  it('reports no data when all fields have zero matching non-null values', async () => {
    for (const entry of Object.values(response.statistic_info.results)) {
      entry.value = null;
      entry.count = 0;
    }
    const result = firstValueFrom(service.loadStatistics(polygon));
    http.expectOne((req) => req.url.startsWith(`${endpoint}?`)).flush(response);

    expect((await result)[0].layers[0].status).toBe('noData');
  });

  it('omits metadata links when the API returns no UUIDs', async () => {
    response.statistic_info.geolion_karten_uuid = null;
    response.statistic_info.geolion_geodatensatz_uuid = null;
    const result = firstValueFrom(service.loadStatistics(polygon));
    http.expectOne((req) => req.url.startsWith(`${endpoint}?`)).flush(response);

    const mapped = (await result)[0];
    expect(mapped.metaDataLink).toBeUndefined();
    expect(mapped.layers[0].metaDataLink).toBeUndefined();
  });

  it('serializes polygon holes and uses the supplied WGS84 SRID', async () => {
    const geometry: PolygonWithSrs = {
      type: 'Polygon',
      srs: 4326,
      coordinates: [
        [
          [8, 47],
          [8, 48],
          [9, 48],
          [8, 47],
        ],
        [
          [8.1, 47.1],
          [8.1, 47.2],
          [8.2, 47.2],
          [8.1, 47.1],
        ],
      ],
    };
    const result = firstValueFrom(service.loadStatistics(geometry));
    const request = http.expectOne((req) => req.url.startsWith(`${endpoint}?`));
    const url = new URL(request.request.url);
    expect(url.searchParams.get('srid')).toBe('4326');
    expect(url.searchParams.get('geometry')).toBe('POLYGON((8 47,8 48,9 48,8 47),(8.1 47.1,8.1 47.2,8.2 47.2,8.1 47.1))');
    request.flush(response);
    await result;
  });

  it('queries the polygon created by the circle tool', async () => {
    const circle = createCircle({type: 'Point', coordinates: [2680595, 1254504], srs: 2056}, 1000);
    const result = firstValueFrom(service.loadStatistics(circle));
    const request = http.expectOne((req) => req.url.startsWith(`${endpoint}?`));
    const wkt = new URL(request.request.url).searchParams.get('geometry')!;
    expect(wkt.startsWith('POLYGON((2681595 1254504,')).toBe(true);
    expect(wkt.endsWith(',2681595 1254504))')).toBe(true);
    expect(wkt.split(',')).toHaveLength(65);
    request.flush(response);
    await result;
  });

  it.each([400, 404, 500])('propagates HTTP %s errors rather than returning mock or empty results', async (status) => {
    const result = firstValueFrom(service.loadStatistics(polygon));
    const assertion = expect(result).rejects.toMatchObject({status, error: {errors: ['Statistics request failed']}});
    http
      .expectOne((req) => req.url.startsWith(`${endpoint}?`))
      .flush({errors: ['Statistics request failed']}, {status, statusText: 'Error'});
    await assertion;
  });

  it.each(['not a number', '', ' ', 'Infinity'])('rejects invalid numeric values (%j)', async (value) => {
    response.statistic_info.results['anz_besch'].value = value;
    const result = firstValueFrom(service.loadStatistics(polygon));
    const assertion = expect(result).rejects.toThrow('Invalid statistics value for field "anz_besch"');
    http.expectOne((req) => req.url.startsWith(`${endpoint}?`)).flush(response);
    await assertion;
  });

  it.each<GeometryWithSrs>([
    {type: 'Point', coordinates: [0, 0], srs: 2056},
    {type: 'MultiPolygon', coordinates: [polygon.coordinates], srs: 2056},
  ])('rejects unsupported geometry without sending a request ($type)', async (geometry) => {
    await expect(firstValueFrom(service.loadStatistics(geometry))).rejects.toThrow('Unsupported statistics geometry');
  });
});
