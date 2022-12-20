import {TestBed} from '@angular/core/testing';

import {GeoJSONMapperService} from './geo-json-mapper.service';
import {
  Point as GeoJSONPoint,
  MultiPoint as GeoJSONMultiPoint,
  Polygon as GeoJSONPolygon,
  MultiPolygon as GeoJSONMultiPolygon,
  LineString as GeoJSONLineString,
  MultiLineString as GeoJSONMultiLineString
} from 'geojson';
import {Point as EsriPoint, Multipoint as EsriMultiPoint, Polygon as EsriPolygon, Polyline as EsriPolyline} from '@arcgis/core/geometry';

describe('GeoJsonMapperService', () => {
  let service: GeoJSONMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeoJSONMapperService);
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
      // Represents a minimal polygon with an interior ring and a polygon without a ring, as MultiPolygon
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

  describe('Polyline', () => {
    it('transforms a GeoJSON linestring to an Esri polyline', () => {
      const minimalLineString: GeoJSONLineString = {
        type: 'LineString',
        coordinates: [
          [100.0, 0.0],
          [101.0, 1.0]
        ]
      };

      const esriPolyline = service.fromGeoJSONToEsri(minimalLineString);

      expect(esriPolyline).toBeInstanceOf(EsriPolyline);
      expect((esriPolyline as EsriPolyline).paths).toEqual([minimalLineString.coordinates]);
    });

    it('transforms a GeoJSON multilinestring to an Esri polyline', () => {
      const minimalMultiLineString: GeoJSONMultiLineString = {
        type: 'MultiLineString',
        coordinates: [
          [
            [100.0, 0.0],
            [101.0, 1.0]
          ],
          [
            [102.0, 2.0],
            [103.0, 3.0]
          ]
        ]
      };

      const esriPolyline = service.fromGeoJSONToEsri(minimalMultiLineString);

      expect(esriPolyline).toBeInstanceOf(EsriPolyline);
      expect((esriPolyline as EsriPolyline).paths).toEqual([minimalMultiLineString.coordinates.flat()]);
    });
  });
});
