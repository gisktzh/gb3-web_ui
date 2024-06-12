import {Geometry, VectorLayer} from '../models/gb3-api-generated.interfaces';
import {SupportedGeometry} from '../types/SupportedGeometry.type';
import {LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon} from 'geojson';
import {Gb3VectorLayer} from '../interfaces/gb3-vector-layer.interface';

export class ApiGeojsonGeometryToGb3ConverterUtils {
  /**
   * Convenience method to convert a VectorLayer from the API to a Gb3VectorLayer using the internal GeoJSON typing.
   */
  public static convertVectorLayerToGb3VectorLayer({type, styles, geojson}: VectorLayer): Gb3VectorLayer {
    return {
      type,
      styles,
      geojson: {
        type: geojson.type,
        features: geojson.features.map((feature) => ({
          type: feature.type,
          properties: feature.properties,
          geometry: ApiGeojsonGeometryToGb3ConverterUtils.castGeometryToSupportedGeometry(feature.geometry),
        })),
      },
    };
  }

  /**
   * This mapper casts the generic geometry from the GB3 API to a narrowly typed, internal GeoJSON typing.
   * This is necessary because the API (in its current state) does not use the GeoJSON interface, but allows for type and coordinate
   * combinations that do not exist.
   * @param geometry The geometry to be converted
   */
  public static castGeometryToSupportedGeometry(geometry: Geometry): SupportedGeometry {
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
      case 'MultiLineString': {
        castGeometry = {type: geometry.type, coordinates: geometry.coordinates} as MultiLineString;
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
