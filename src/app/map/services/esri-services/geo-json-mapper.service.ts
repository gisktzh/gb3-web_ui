import {Injectable} from '@angular/core';
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
import {GeometryUnion} from '@arcgis/core/unionTypes';
import Point from '@arcgis/core/geometry/Point';
import Multipoint from '@arcgis/core/geometry/Multipoint';
import Polygon from '@arcgis/core/geometry/Polygon';
import Polyline from '@arcgis/core/geometry/Polyline';

@Injectable({
  providedIn: 'root',
})
export class GeoJSONMapperService {
  public fromGeoJSONToEsri<T extends GeometryWithSrs>(geometry: T): GeometryUnion {
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
    return new Point({x: point.coordinates[0], y: point.coordinates[1], spatialReference: {wkid: point.srs}});
  }

  private geoJSONMultiPointToEsriMultiPoint(multiPoint: MultiPointWithSrs): __esri.Multipoint {
    const points = multiPoint.coordinates.map((point) => [point[0], point[1]]);
    return new Multipoint({points: points, spatialReference: {wkid: multiPoint.srs}});
  }

  private geoJSONPolygonToEsriPolygon(polygon: PolygonWithSrs): __esri.Polygon {
    return new Polygon({rings: polygon.coordinates, spatialReference: {wkid: polygon.srs}});
  }

  private geoJSONMultiPolygonToEsriPolygon(multiPolygon: MultiPolygonWithSrs): __esri.Polygon {
    // Esri does not deal with MultiPolygon, all polygons are treated one and the same. A MultiPolygon just extracts all
    // polygon coordinates as flat array and returns a Polygon
    return new Polygon({rings: multiPolygon.coordinates.flat(), spatialReference: {wkid: multiPolygon.srs}});
  }

  private geoJSONLineStringToEsriPolyline(lineString: LineStringWithSrs): __esri.Polyline {
    return new Polyline({paths: [lineString.coordinates], spatialReference: {wkid: lineString.srs}});
  }

  private geoJSONMultiLineStringToEsriPolyline(multiLineString: MultiLineStringWithSrs): __esri.Polyline {
    return new Polyline({paths: multiLineString.coordinates, spatialReference: {wkid: multiLineString.srs}});
  }
}
