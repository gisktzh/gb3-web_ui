import {Gb3StyledInternalDrawingRepresentation} from '../interfaces/internal-drawing-representation.interface';
import {Gb3GeoJsonFeature, Gb3VectorLayer, Gb3VectorLayerStyle} from '../interfaces/gb3-vector-layer.interface';
import {UserDrawingLayer} from '../enums/drawing-layer.enum';
import {MapConstants} from '../constants/map.constants';
import {UuidUtils} from './uuid.utils';

export class SymbolizationToGb3ConverterUtils {
  /**
   * Converts a list of internal drawings to a GB3VectorLayer representation.
   */
  public static convertInternalToExternalRepresentation(features: Gb3StyledInternalDrawingRepresentation[]): Gb3VectorLayer {
    const gb3GeoJsonFeatures: Gb3GeoJsonFeature[] = [];
    const allStyles: Gb3VectorLayerStyle = {};
    features.forEach((feature) => {
      const uuid = UuidUtils.createUuid();
      const style = feature.properties.style;

      const gb3GeoJsonFeature: Gb3GeoJsonFeature = {
        type: feature.type,
        geometry: feature.geometry,
        properties: {
          id: feature.properties[MapConstants.DRAWING_IDENTIFIER],
          belongsTo: feature.properties[MapConstants.BELONGS_TO_IDENTIFIER],
          style: uuid,
          text: feature.labelText,
        },
      };

      gb3GeoJsonFeatures.push(gb3GeoJsonFeature);
      allStyles[uuid] = style;
    });
    return {
      type: 'Vector',
      geojson: {
        type: 'FeatureCollection',
        features: gb3GeoJsonFeatures,
      },
      styles: allStyles,
      content: undefined, // TODO gb3-645: remove once api ready
    };
  }

  public static convertExternalToInternalRepresentation(
    gb3VectorLayer: Gb3VectorLayer,
    source: UserDrawingLayer,
  ): Gb3StyledInternalDrawingRepresentation[] {
    return gb3VectorLayer.geojson.features.map((feature) => ({
      type: 'Feature',
      properties: {
        [MapConstants.DRAWING_IDENTIFIER]: feature.properties.id,
        [MapConstants.BELONGS_TO_IDENTIFIER]: feature.properties.belongsTo,
        style: gb3VectorLayer.styles[feature.properties.style],
      },
      geometry: {
        ...feature.geometry,
        srs: 2056,
      },
      source: source,
      labelText: feature.properties.text,
    }));
  }
}
