import Graphic from '@arcgis/core/Graphic';
import {Gb3StyledInternalDrawingRepresentation} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import {silentArcgisToGeoJSON} from '../../../../shared/utils/esri-transformer-wrapper.utils';
import {UnsupportedGeometryType} from '../errors/esri.errors';
import {AbstractEsriDrawableToolStrategy} from '../tool-service/strategies/abstract-esri-drawable-tool.strategy';
import {DrawingLayer} from '../../../../shared/enums/drawing-layer.enum';
import {EsriSymbolizationService} from '../esri-symbolization.service';
import {SupportedSrs} from '../../../../shared/types/supported-srs.type';

export class EsriGraphicToInternalDrawingRepresentationUtils {
  /**
   * This mapper converts an Esri graphic object to the GB3 internal drawing representation
   */
  public static convert(
    graphic: Graphic,
    labelText: string | undefined,
    srs: SupportedSrs,
    source: DrawingLayer,
    esriSymbolizationService: EsriSymbolizationService,
  ): Gb3StyledInternalDrawingRepresentation {
    const geoJsonFeature = silentArcgisToGeoJSON(graphic.geometry);

    if (geoJsonFeature.type === 'MultiLineString' || geoJsonFeature.type === 'GeometryCollection') {
      throw new UnsupportedGeometryType(geoJsonFeature.type);
    }

    return {
      type: 'Feature',
      geometry: {...geoJsonFeature, srs},
      properties: {
        style: esriSymbolizationService.extractGb3SymbolizationFromSymbol(graphic.symbol),
        [AbstractEsriDrawableToolStrategy.identifierFieldName]: graphic.attributes[AbstractEsriDrawableToolStrategy.identifierFieldName],
        [AbstractEsriDrawableToolStrategy.belongsToFieldName]: graphic.attributes[AbstractEsriDrawableToolStrategy.belongsToFieldName],
      },
      source,
      labelText,
    };
  }
}
