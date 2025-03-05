import Graphic from '@arcgis/core/Graphic';
import {Gb3StyledInternalDrawingRepresentation} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import {GeometryMissing, SymbolizationMissing, UnsupportedGeometryType} from '../errors/esri.errors';
import {AbstractEsriDrawableToolStrategy} from '../tool-service/strategies/abstract-esri-drawable-tool.strategy';
import {DrawingLayer} from '../../../../shared/enums/drawing-layer.enum';
import {SupportedSrs} from '../../../../shared/types/supported-srs.type';
import {EsriSymbolToStyleRepresentationUtils} from './esri-symbol-to-style-representation.utils';
import {hasNonNullishProperty} from '../type-guards/esri-nullish.type-guard';
import {silentArcgisToGeoJSON} from './esri-transformer-wrapper.utils';

export class EsriGraphicToInternalDrawingRepresentationUtils {
  /**
   * This mapper converts an Esri graphic object to the GB3 internal drawing representation
   */
  public static convert(
    graphic: Graphic,
    labelText: string | undefined,
    srs: SupportedSrs,
    source: DrawingLayer,
  ): Gb3StyledInternalDrawingRepresentation {
    if (!hasNonNullishProperty(graphic, 'geometry')) {
      throw new GeometryMissing();
    }

    if (!hasNonNullishProperty(graphic, 'symbol')) {
      throw new SymbolizationMissing();
    }

    const geoJsonFeature = silentArcgisToGeoJSON(graphic.geometry);

    if (geoJsonFeature.type === 'MultiLineString' || geoJsonFeature.type === 'GeometryCollection') {
      throw new UnsupportedGeometryType(geoJsonFeature.type);
    }

    return {
      type: 'Feature',
      geometry: {...geoJsonFeature, srs},
      properties: {
        style: EsriSymbolToStyleRepresentationUtils.convert(graphic.symbol),
        [AbstractEsriDrawableToolStrategy.identifierFieldName]: graphic.attributes[AbstractEsriDrawableToolStrategy.identifierFieldName],
        [AbstractEsriDrawableToolStrategy.belongsToFieldName]: graphic.attributes[AbstractEsriDrawableToolStrategy.belongsToFieldName],
        [AbstractEsriDrawableToolStrategy.toolFieldName]: graphic.attributes[AbstractEsriDrawableToolStrategy.toolFieldName],
      },
      source,
      labelText,
    };
  }
}
