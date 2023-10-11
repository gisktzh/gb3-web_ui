import {InternalDrawingRepresentation} from '../interfaces/internal-drawing-representation.interface';
import {Gb3VectorLayer} from '../interfaces/gb3-vector-layer.interface';

export class SymbolizationToGb3ConverterUtils {
  /**
   * Converts a list of internal drawings to a GB3VectorLayer representation. Currently, this only supports a redlining style for all
   * features. As part of GB3-629, the style extraction logic will need to use the features' style property to extract the feature
   * style. It will also need a proper mapping onto the ID attribute of the feature.
   *
   * todo GB3-629: implement logic for feature style
   * @param features
   */
  public static convert(features: InternalDrawingRepresentation[]): Gb3VectorLayer {
    return {
      type: 'Vector',
      geojson: {
        type: 'FeatureCollection',
        features: features.map((feature) => ({
          type: feature.type,
          geometry: feature.geometry,
          properties: {style: 'REDLINING', text: feature.labelText ?? ''},
        })),
      },
      styles: {
        REDLINING: {
          pointRadius: 3,
          fillColor: '#ff0000',
          fillOpacity: 0.4,
          strokeColor: '#ff0000',
          strokeWidth: 2,
          label: '[text]',
          fontSize: '8px',
          fontColor: '#ff0000',
          fontFamily: 'Arial,Helvetica,sans-serif',
          fontWeight: 'normal',
          labelOutlineColor: '#ffffff',
          labelOutlineWidth: 2,
          labelAlign: 'ct',
          labelYOffset: 15,
        },
      },
    };
  }
}
