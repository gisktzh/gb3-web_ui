import {Gb3StyledInternalDrawingRepresentation, Gb3StyleRepresentation} from '../interfaces/internal-drawing-representation.interface';
import {Gb3VectorLayer} from '../interfaces/gb3-vector-layer.interface';
import {UserDrawingLayer} from '../enums/drawing-layer.enum';
import {v4 as uuidv4} from 'uuid';
import {RedliningIdentifier} from '../enums/redlining-identifier.enum';

const REDLINING_STYLE = {
  [RedliningIdentifier.GeometryOnly]: {
    pointRadius: 3,
    fillColor: '#ff0000',
    fillOpacity: 0.4,
    strokeColor: '#ff0000',
    strokeWidth: 2,
  },
};

const REDLINING_STYLE_LABEL = {
  [RedliningIdentifier.LabelOnly]: {
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
};

const REDLINING_STYLE_GEOMETRY_WITH_LABEL = {
  [RedliningIdentifier.GeometryWithLabel]: {
    ...REDLINING_STYLE[RedliningIdentifier.GeometryOnly],
    ...REDLINING_STYLE_LABEL[RedliningIdentifier.LabelOnly],
  },
};

export class SymbolizationToGb3ConverterUtils {
  /**
   * Converts a list of internal drawings to a GB3VectorLayer representation. Currently, this only supports a redlining style for all
   * features. As part of GB3-629, the style extraction logic will need to use the features' style property to extract the feature
   * style. It will also need a proper mapping onto the ID attribute of the feature.
   *
   * todo GB3-629: implement logic for feature style
   * @param features
   */
  public static convertInternalToExternalRepresentation(features: Gb3StyledInternalDrawingRepresentation[]): Gb3VectorLayer {
    return {
      type: 'Vector',
      geojson: {
        type: 'FeatureCollection',
        features: features.map((feature) => ({
          type: feature.type,
          geometry: feature.geometry,
          properties: {
            style: feature.labelText
              ? SymbolizationToGb3ConverterUtils.getLabelStyle(feature.properties.style)
              : RedliningIdentifier.GeometryOnly,
            text: feature.labelText ? feature.labelText : '', // todo GB3-863: PrintAPI currently requires this property to be set
          },
        })),
      },
      styles: {
        ...REDLINING_STYLE,
        ...REDLINING_STYLE_GEOMETRY_WITH_LABEL,
        ...REDLINING_STYLE_LABEL,
      },
    };
  }

  public static convertExternalToInternalRepresentation(
    gb3VectorLayer: Gb3VectorLayer,
    source: UserDrawingLayer,
  ): Gb3StyledInternalDrawingRepresentation[] {
    return gb3VectorLayer.geojson.features.map((feature) => ({
      type: 'Feature',
      properties: {
        __id: uuidv4(),
        style: {
          type: 'point',
          fillColor: '#ff0000',
          fillOpacity: 0.4,
          strokeColor: '#ff0000',
          strokeWidth: 2,
          pointRadius: '3px',
          strokeOpacity: 1,
        },
      },
      geometry: {
        ...feature.geometry,
        srs: 2056,
      },
      source: source,
      labelText: feature.properties.text,
    }));
  }

  private static getLabelStyle(type: Gb3StyleRepresentation): RedliningIdentifier {
    if (type.type === 'text') {
      return RedliningIdentifier.LabelOnly;
    }

    return RedliningIdentifier.GeometryWithLabel;
  }
}
