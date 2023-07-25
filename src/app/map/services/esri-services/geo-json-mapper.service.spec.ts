import {TestBed} from '@angular/core/testing';

import {GeoJSONMapperService} from './geo-json-mapper.service';
import {Multipoint as EsriMultiPoint, Point as EsriPoint, Polygon as EsriPolygon, Polyline as EsriPolyline} from '@arcgis/core/geometry';
import {
  LineStringWithSrs,
  MultiLineStringWithSrs,
  MultiPointWithSrs,
  MultiPolygonWithSrs,
  PointWithSrs,
  PolygonWithSrs,
} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {SupportedSrs} from '../../../shared/types/supported-srs';
import {MinimalGeometriesUtils} from '../../../testing/map-testing/minimal-geometries.utils';

describe('GeoJsonMapperService', () => {
  const defaultSrs: SupportedSrs = 4326;
  let service: GeoJSONMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeoJSONMapperService);
  });

  describe('Point', () => {
    it('transforms a GeoJSON point to an Esri point', () => {
      const minimalPoint: PointWithSrs = MinimalGeometriesUtils.getMinimalPoint(defaultSrs);
      const esriPoint = service.fromGeoJSONToEsri(minimalPoint);

      expect(esriPoint).toBeInstanceOf(EsriPoint);

      expect((esriPoint as EsriPoint).x).toEqual(minimalPoint.coordinates[0]);
      expect((esriPoint as EsriPoint).y).toEqual(minimalPoint.coordinates[1]);
      expect((esriPoint as EsriPoint).spatialReference.wkid).toEqual(defaultSrs);
    });
  });

  describe('MultiPoint', () => {
    it('transforms a GeoJSON multipoint to an Esri multipoint', () => {
      const minimalMultiPoint: MultiPointWithSrs = MinimalGeometriesUtils.getMinimalMultiPoint(defaultSrs);

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
      const minimalPolygon: PolygonWithSrs = MinimalGeometriesUtils.getMinimalPolygon(defaultSrs);

      const esriPolygon = service.fromGeoJSONToEsri(minimalPolygon);

      expect(esriPolygon).toBeInstanceOf(EsriPolygon);
      expect((esriPolygon as EsriPolygon).rings).toEqual(minimalPolygon.coordinates);
      expect((esriPolygon as EsriPolygon).spatialReference.wkid).toEqual(defaultSrs);
    });

    it('transforms a GeoJSON multipolygon to an Esri polygon', () => {
      const minimalMultiPolygon: MultiPolygonWithSrs = MinimalGeometriesUtils.getMinimalMultiPolygon(defaultSrs);

      const esriPolygon = service.fromGeoJSONToEsri(minimalMultiPolygon);

      expect(esriPolygon).toBeInstanceOf(EsriPolygon);
      expect((esriPolygon as EsriPolygon).rings).toEqual(minimalMultiPolygon.coordinates.flat());
      expect((esriPolygon as EsriPolygon).spatialReference.wkid).toEqual(defaultSrs);
    });
  });

  describe('Polyline', () => {
    it('transforms a GeoJSON linestring to an Esri polyline', () => {
      const minimalLineString: LineStringWithSrs = MinimalGeometriesUtils.getMinimalLineString(defaultSrs);

      const esriPolyline = service.fromGeoJSONToEsri(minimalLineString);

      expect(esriPolyline).toBeInstanceOf(EsriPolyline);
      expect((esriPolyline as EsriPolyline).paths).toEqual([minimalLineString.coordinates]);
    });

    it('transforms a GeoJSON multilinestring to an Esri polyline', () => {
      const minimalMultiLineString: MultiLineStringWithSrs = MinimalGeometriesUtils.getMinimalMultiLineString(defaultSrs);

      const esriPolyline = service.fromGeoJSONToEsri(minimalMultiLineString);

      expect(esriPolyline).toBeInstanceOf(EsriPolyline);
      expect((esriPolyline as EsriPolyline).paths).toEqual([minimalMultiLineString.coordinates.flat()]);
      expect((esriPolyline as EsriPolyline).spatialReference.wkid).toEqual(defaultSrs);
    });
  });
});
