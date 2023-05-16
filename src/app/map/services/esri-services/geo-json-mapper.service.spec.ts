import {TestBed} from '@angular/core/testing';

import {GeoJSONMapperService} from './geo-json-mapper.service';
import {Multipoint as EsriMultiPoint, Point as EsriPoint, Polygon as EsriPolygon, Polyline as EsriPolyline} from '@arcgis/core/geometry';
import {
  LineStringWithSrs,
  MultiLineStringWithSrs,
  MultiPointWithSrs,
  MultiPolygonWithSrs,
  PointWithSrs,
  PolygonWithSrs
} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {SupportedSrs} from '../../../shared/types/supported-srs';

describe('GeoJsonMapperService', () => {
  const defaultSrs: SupportedSrs = 4326;
  let service: GeoJSONMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeoJSONMapperService);
  });

  describe('Point', () => {
    it('transforms a GeoJSON point to an Esri point', () => {
      const minimalPoint: PointWithSrs = {type: 'Point', coordinates: [48.0, 8.0], srs: defaultSrs};
      const esriPoint = service.fromGeoJSONToEsri(minimalPoint);

      expect(esriPoint).toBeInstanceOf(EsriPoint);

      expect((esriPoint as EsriPoint).x).toEqual(minimalPoint.coordinates[0]);
      expect((esriPoint as EsriPoint).y).toEqual(minimalPoint.coordinates[1]);
      expect((esriPoint as EsriPoint).spatialReference.wkid).toEqual(defaultSrs);
    });
  });

  describe('MultiPoint', () => {
    it('transforms a GeoJSON multipoint to an Esri multipoint', () => {
      const minimalMultiPoint: MultiPointWithSrs = {
        type: 'MultiPoint',
        coordinates: [
          [48.0, 8.0],
          [49.0, 9.0]
        ],
        srs: defaultSrs
      };

      const esriMultiPoint = service.fromGeoJSONToEsri(minimalMultiPoint);

      expect(esriMultiPoint).toBeInstanceOf(EsriMultiPoint);
      expect((esriMultiPoint as EsriMultiPoint).points[0]).toEqual(minimalMultiPoint.coordinates[0]);
      expect((esriMultiPoint as EsriMultiPoint).points[1]).toEqual(minimalMultiPoint.coordinates[1]);
      expect((esriMultiPoint as EsriMultiPoint).spatialReference.wkid).toEqual(defaultSrs);
    });
  });

  describe('Polygon', () => {
    it('transforms a GeoJSON polygon to an Esri polygon', () => {
      // Represents a minimal polygon with an interior ring
      const minimalPolygon: PolygonWithSrs = {
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
        ],
        srs: defaultSrs
      };

      const esriPolygon = service.fromGeoJSONToEsri(minimalPolygon);

      expect(esriPolygon).toBeInstanceOf(EsriPolygon);
      expect((esriPolygon as EsriPolygon).rings).toEqual(minimalPolygon.coordinates);
      expect((esriPolygon as EsriPolygon).spatialReference.wkid).toEqual(defaultSrs);
    });

    it('transforms a GeoJSON multipolygon to an Esri polygon', () => {
      // Represents a minimal polygon with an interior ring and a polygon without a ring, as MultiPolygon
      const minimalMultiPolygon: MultiPolygonWithSrs = {
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
        ],
        srs: defaultSrs
      };

      const esriPolygon = service.fromGeoJSONToEsri(minimalMultiPolygon);

      expect(esriPolygon).toBeInstanceOf(EsriPolygon);
      expect((esriPolygon as EsriPolygon).rings).toEqual(minimalMultiPolygon.coordinates.flat());
      expect((esriPolygon as EsriPolygon).spatialReference.wkid).toEqual(defaultSrs);
    });
  });

  describe('Polyline', () => {
    it('transforms a GeoJSON linestring to an Esri polyline', () => {
      const minimalLineString: LineStringWithSrs = {
        type: 'LineString',
        coordinates: [
          [100.0, 0.0],
          [101.0, 1.0]
        ],
        srs: defaultSrs
      };

      const esriPolyline = service.fromGeoJSONToEsri(minimalLineString);

      expect(esriPolyline).toBeInstanceOf(EsriPolyline);
      expect((esriPolyline as EsriPolyline).paths).toEqual([minimalLineString.coordinates]);
    });

    it('transforms a GeoJSON multilinestring to an Esri polyline', () => {
      const minimalMultiLineString: MultiLineStringWithSrs = {
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
        ],
        srs: defaultSrs
      };

      const esriPolyline = service.fromGeoJSONToEsri(minimalMultiLineString);

      expect(esriPolyline).toBeInstanceOf(EsriPolyline);
      expect((esriPolyline as EsriPolyline).paths).toEqual([minimalMultiLineString.coordinates.flat()]);
      expect((esriPolyline as EsriPolyline).spatialReference.wkid).toEqual(defaultSrs);
    });
  });
});
