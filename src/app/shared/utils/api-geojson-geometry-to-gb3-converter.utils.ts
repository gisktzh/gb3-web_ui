import {Geometry} from '../models/gb3-api-generated.interfaces';
import {SupportedGeometry} from '../types/SupportedGeometry.type';
import {LineString, MultiPoint, MultiPolygon, Point, Polygon} from 'geojson';

export class ApiGeojsonGeometryToGb3ConverterUtils {
  /**
   * This mapper casts the generic geometry from the GB3 API to a narrowly typed, internal GeoJSON typing.
   * This is necessary because the API (in its current state) does not use the GeoJSON interface, but allows for type and coordinate
   * combinations that do not exist.
   * @param geometry The geometry to be converted
   */
  public static convert(geometry: Geometry): SupportedGeometry {
    let castGeometry: SupportedGeometry;
    switch (geometry.type) {
      case 'Polygon': {
        castGeometry = {type: geometry.type, coordinates: geometry.coordinates} as Polygon;
        break;
      }
      case 'Point': {
        castGeometry = {type: geometry.type, coordinates: geometry.coordinates} as Point;
        break;
      }
      case 'LineString': {
        castGeometry = {type: geometry.type, coordinates: geometry.coordinates} as LineString;
        break;
      }
      case 'MultiPoint': {
        castGeometry = {type: geometry.type, coordinates: geometry.coordinates} as MultiPoint;
        break;
      }
      case 'MultiPolygon': {
        castGeometry = {type: geometry.type, coordinates: geometry.coordinates} as MultiPolygon;
        break;
      }
    }

    return castGeometry;
  }
}
