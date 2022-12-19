import {Injectable} from '@angular/core';
import {
  Geometry,
  LineString as GeoJSONLineString,
  MultiLineString as GeoJSONMultiLineString,
  MultiPoint as GeoJSONMultiPoint,
  MultiPolygon as GeoJSONMultiPolygon,
  Point as GeoJSONPoint,
  Polygon as GeoJSONPolygon
} from 'geojson';
import {
  Geometry as EsriGeometry,
  Multipoint as EsriMultiPoint,
  Point as EsriPoint,
  Polygon as EsriPolygon,
  Polyline as EsriPolyline
} from '@arcgis/core/geometry';

@Injectable({
  providedIn: 'root'
})
export class GeoJSONMapperServiceService {
  public fromGeoJSONToEsri<T extends Geometry>(geometry: T): EsriGeometry {
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
      default:
        // Todo: add proper error classes
        throw new Error('Unsupported Geometry from API.');
    }
  }

  private geoJSONPointToEsriPoint(point: GeoJSONPoint): EsriPoint {
    return new EsriPoint({x: point.coordinates[0], y: point.coordinates[1], spatialReference: {wkid: 2056}});
  }

  private geoJSONMultiPointToEsriMultiPoint(multipoint: GeoJSONMultiPoint): EsriMultiPoint {
    const points = multipoint.coordinates.map((point) => [point[0], point[1]]);
    return new EsriMultiPoint({points: points, spatialReference: {wkid: 2056}});
  }

  private geoJSONPolygonToEsriPolygon(polygon: GeoJSONPolygon): EsriPolygon {
    return new EsriPolygon({rings: polygon.coordinates, spatialReference: {wkid: 2056}});
  }

  private geoJSONMultiPolygonToEsriPolygon(multiPolygon: GeoJSONMultiPolygon): EsriPolygon {
    // Esri does not deal with MultiPolygon, all polygons are treated one and the same. A MultiPolygon just extracts all
    // polygon coordinates as flat array and returns a Polygon
    return new EsriPolygon({rings: multiPolygon.coordinates.flat(), spatialReference: {wkid: 2056}});
  }

  private geoJSONLineStringToEsriPolyline(linestring: GeoJSONLineString): EsriPolyline {
    return new EsriPolyline({paths: [linestring.coordinates], spatialReference: {wkid: 2056}});
  }

  private geoJSONMultiLineStringToEsriPolyline(linestring: GeoJSONMultiLineString): EsriPolyline {
    // Esri does not deal with MultiLineString, all linestrings are treated one and the same. A MultiLineString just
    // extracts all linestring coordinates as flat array and returns a Polyline
    return new EsriPolyline({paths: [linestring.coordinates.flat()], spatialReference: {wkid: 2056}});
  }
}
