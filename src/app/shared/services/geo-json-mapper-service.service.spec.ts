import {TestBed} from '@angular/core/testing';

import {GeoJSONMapperServiceService} from './geo-json-mapper-service.service';
import {
  Point as GeoJSONPoint,
  MultiPoint as GeoJSONMultiPoint,
  Polygon as GeoJSONPolygon,
  MultiPolygon as GeoJSONMultiPolygon
} from 'geojson';
import {Point as EsriPoint, Multipoint as EsriMultiPoint, Polygon as EsriPolygon} from '@arcgis/core/geometry';

describe('GeoJsonMapperServiceService', () => {
  let service: GeoJSONMapperServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeoJSONMapperServiceService);
  });

  describe('Point', () => {
    it('transforms a GeoJSON point to an Esri point', () => {
      const minimalPoint: GeoJSONPoint = {type: 'Point', coordinates: [48.0, 8.0]};
      const esriPoint = service.fromGeoJSONToEsri(minimalPoint);

      expect(esriPoint).toBeInstanceOf(EsriPoint);

      expect((esriPoint as EsriPoint).x).toEqual(minimalPoint.coordinates[0]);
      expect((esriPoint as EsriPoint).y).toEqual(minimalPoint.coordinates[1]);
    });
  });

  describe('MultiPoint', () => {
    it('transforms a GeoJSON multipoint to an Esri multipoint', () => {
      const minimalMultiPoint: GeoJSONMultiPoint = {
        type: 'MultiPoint',
        coordinates: [
          [48.0, 8.0],
          [49.0, 9.0]
        ]
      };

      const esriMultiPoint = service.fromGeoJSONToEsri(minimalMultiPoint);

      expect(esriMultiPoint).toBeInstanceOf(EsriMultiPoint);
      expect((esriMultiPoint as EsriMultiPoint).points[0]).toEqual(minimalMultiPoint.coordinates[0]);
      expect((esriMultiPoint as EsriMultiPoint).points[1]).toEqual(minimalMultiPoint.coordinates[1]);
    });
  });

  describe('Polygon', () => {
    it('transforms a GeoJSON polygon to an Esri polygon', () => {
      // Represents a minimal polygon with an interior ring
      const minimalPolygon: GeoJSONPolygon = {
        type: 'Polygon',
        coordinates: [
          [
            [100.0, 0.0],
            [101.0, 0.0],
            [101.0, 1.0],
            [100.0, 1.0],
            [100.0, 0.0]
          ],
          [
            [100.8, 0.8],
            [100.8, 0.2],
            [100.2, 0.2],
            [100.2, 0.8],
            [100.8, 0.8]
          ]
        ]
      };

      const esriPolygon = service.fromGeoJSONToEsri(minimalPolygon);

      expect(esriPolygon).toBeInstanceOf(EsriPolygon);
      expect((esriPolygon as EsriPolygon).rings).toEqual(minimalPolygon.coordinates);
    });

    it('transforms a GeoJSON multipolygon to an Esri polygon', () => {
      // Represents a minimal polygon with an interior ring
      const minimalMultiPolygon: GeoJSONMultiPolygon = {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [102.0, 2.0],
              [103.0, 2.0],
              [103.0, 3.0],
              [102.0, 3.0],
              [102.0, 2.0]
            ]
          ],
          [
            [
              [100.0, 0.0],
              [101.0, 0.0],
              [101.0, 1.0],
              [100.0, 1.0],
              [100.0, 0.0]
            ],
            [
              [100.2, 0.2],
              [100.2, 0.8],
              [100.8, 0.8],
              [100.8, 0.2],
              [100.2, 0.2]
            ]
          ]
        ]
      };

      const esriPolygon = service.fromGeoJSONToEsri(minimalMultiPolygon);

      expect(esriPolygon).toBeInstanceOf(EsriPolygon);
      expect((esriPolygon as EsriPolygon).rings).toEqual(minimalMultiPolygon.coordinates.flat());
    });
  });
});
