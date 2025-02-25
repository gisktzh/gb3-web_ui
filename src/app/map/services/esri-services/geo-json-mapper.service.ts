import {Injectable} from '@angular/core';
import {EsriMultiPoint, EsriPoint, EsriPolygon, EsriPolyline} from './esri.module';
import {
  GeometryWithSrs,
  LineStringWithSrs,
  MultiLineStringWithSrs,
  MultiPointWithSrs,
  MultiPolygonWithSrs,
  PointWithSrs,
  PolygonWithSrs,
} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {UnsupportedGeometryType} from './errors/esri.errors';

@Injectable({
  providedIn: 'root',
})
export class GeoJSONMapperService {
  public fromGeoJSONToEsri<T extends GeometryWithSrs>(geometry: T): __esri.GeometryUnion {
    switch (geometry.type) {
      case 'Point':
        return this.geoJSONPointToEsriPoint(geometry);
      case 'MultiPoint':
        return this.geoJSONMultiPointToEsriMultiPoint(geometry);
      case 'Polygon':
        return this.geoJSONPolygonToEsriPolygon(geometry);
      case 'MultiPolygon':
        return this.geoJSONMultiPolygonToEsriPolygon(geometry);
      case 'LineString':
        return this.geoJSONLineStringToEsriPolyline(geometry);
      case 'MultiLineString':
        return this.geoJSONMultiLineStringToEsriPolyline(geometry);
      case 'GeometryCollection':
        throw new UnsupportedGeometryType(geometry.type);
    }
  }

  private geoJSONPointToEsriPoint(point: PointWithSrs): __esri.Point {
    return new EsriPoint({x: point.coordinates[0], y: point.coordinates[1], spatialReference: {wkid: point.srs}});
  }

  private geoJSONMultiPointToEsriMultiPoint(multiPoint: MultiPointWithSrs): __esri.Multipoint {
    const points = multiPoint.coordinates.map((point) => [point[0], point[1]]);
    return new EsriMultiPoint({points: points, spatialReference: {wkid: multiPoint.srs}});
  }

  private geoJSONPolygonToEsriPolygon(polygon: PolygonWithSrs): __esri.Polygon {
    return new EsriPolygon({rings: polygon.coordinates, spatialReference: {wkid: polygon.srs}});
  }

  private geoJSONMultiPolygonToEsriPolygon(multiPolygon: MultiPolygonWithSrs): __esri.Polygon {
    // Esri does not deal with MultiPolygon, all polygons are treated one and the same. A MultiPolygon just extracts all
    // polygon coordinates as flat array and returns a Polygon
    return new EsriPolygon({rings: multiPolygon.coordinates.flat(), spatialReference: {wkid: multiPolygon.srs}});
  }

  private geoJSONLineStringToEsriPolyline(lineString: LineStringWithSrs): __esri.Polyline {
    return new EsriPolyline({paths: [lineString.coordinates], spatialReference: {wkid: lineString.srs}});
  }

  private geoJSONMultiLineStringToEsriPolyline(multiLineString: MultiLineStringWithSrs): __esri.Polyline {
    // Esri does not deal with MultiLineString, all linestrings are treated one and the same. A MultiLineString just
    // extracts all linestring coordinates as flat array and returns a Polyline
    return new EsriPolyline({paths: [multiLineString.coordinates.flat()], spatialReference: {wkid: multiLineString.srs}});
  }
}
