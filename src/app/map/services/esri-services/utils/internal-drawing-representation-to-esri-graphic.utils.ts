import {Gb3StyledInternalDrawingRepresentation} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import Graphic from '@arcgis/core/Graphic';
import {StyleRepresentationToEsriSymbolUtils} from './style-representation-to-esri-symbol.utils';
import {GeometryWithSrs} from '../../../../shared/interfaces/geojson-types-with-srs.interface';
import Geometry from '@arcgis/core/geometry/Geometry';
import {geojsonToArcGIS} from '@terraformer/arcgis';
import Point from '@arcgis/core/geometry/Point';
import Multipoint from '@arcgis/core/geometry/Multipoint';
import Polyline from '@arcgis/core/geometry/Polyline';
import Polygon from '@arcgis/core/geometry/Polygon';
import {UnsupportedGeometryType} from '../errors/esri.errors';
import {AbstractEsriDrawableToolStrategy} from '../tool-service/strategies/abstract-esri-drawable-tool.strategy';

export class InternalDrawingRepresentationToEsriGraphicUtils {
  public static convert(drawing: Gb3StyledInternalDrawingRepresentation): Graphic {
    const symbolization = StyleRepresentationToEsriSymbolUtils.convert(drawing.properties.style, drawing.labelText);
    const geometry = InternalDrawingRepresentationToEsriGraphicUtils.convertGeoJsonToArcGIS(drawing.geometry);
    const attributes = {
      [AbstractEsriDrawableToolStrategy.identifierFieldName]: drawing.properties.__id,
      [AbstractEsriDrawableToolStrategy.belongsToFieldName]: drawing.properties.__belongsTo,
      [AbstractEsriDrawableToolStrategy.toolFieldName]: drawing.properties.__tool,
    };
    return new Graphic({geometry: geometry, symbol: symbolization, attributes});
  }

  /**
   * Terraformer.geojsonToArcGIS() does return a Geometry instance, yet it misses the type property. This will then fail if injected
   * directly into a new Graphic() object, since it cannot be autocast when missing the type. This method here extracts the ArcGIS JSON
   * format and returns a properly typed object, while also setting the correct SRS.
   * @param geometry The geoJSON geometry that needs to be transformed
   */
  private static convertGeoJsonToArcGIS(geometry: GeometryWithSrs): Geometry {
    const arcGisJsonRepresentation = geojsonToArcGIS(geometry);
    switch (geometry.type) {
      case 'Point':
        return new Point({...arcGisJsonRepresentation, spatialReference: {wkid: geometry.srs}});
      case 'MultiPoint':
        return new Multipoint({...arcGisJsonRepresentation, spatialReference: {wkid: geometry.srs}});
      case 'LineString':
      case 'MultiLineString':
        return new Polyline({...arcGisJsonRepresentation, spatialReference: {wkid: geometry.srs}});
      case 'Polygon':
      case 'MultiPolygon':
        return new Polygon({...arcGisJsonRepresentation, spatialReference: {wkid: geometry.srs}});
      case 'GeometryCollection':
        throw new UnsupportedGeometryType(geometry.type);
    }
  }
}
