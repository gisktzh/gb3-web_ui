import {Geometry} from '../models/gb3-api-generated.interfaces';
import {SupportedGeometry} from '../types/SupportedGeometry.type';
import {LineString, MultiPolygon, Point, Polygon} from 'geojson';

export class ApiGeojsonGeometryToGb3ConverterUtils {
  /**
   * This mapper casts the generic geometry from the GB3 API to a narrowly typed, internal GeoJSON typing.
   * This is necessary because the API (in its current state) does not use the GeoJSON interface, but allows for type and coordinate
   * combinations that do not exist.
   * @param geometry The geometry to be converted
   */
  public static convert(geometry: Geometry): SupportedGeometry {
    let castedGeometry: SupportedGeometry;
    switch (geometry.type) {
      case 'Polygon': {
        castedGeometry = geometry as Polygon;
        break;
      }
      case 'Point': {
        castedGeometry = geometry as Point;
        break;
      }
      case 'LineString': {
        castedGeometry = geometry as LineString;
        break;
      }
      case 'MultiPoint': {
        castedGeometry = geometry as Polygon;
        break;
      }
      case 'MultiPolygon': {
        castedGeometry = geometry as MultiPolygon;
        break;
      }
    }

    return castedGeometry;
  }
}
