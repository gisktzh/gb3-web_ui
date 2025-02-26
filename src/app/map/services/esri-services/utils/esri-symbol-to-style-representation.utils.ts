import {Gb3StyleRepresentation} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {UnsupportedSymbolizationType} from '../errors/esri.errors';
import {SymbolUnion} from '@arcgis/core/unionTypes';

const CENTER_TOP_LABEL_ALIGNMENT = 'ct';
const TEXT_LABEL = '[text]';

export class EsriSymbolToStyleRepresentationUtils {
  public static convert(symbol: SymbolUnion): Gb3StyleRepresentation {
    switch (symbol.type) {
      case 'simple-marker': {
        const castSymbol = symbol as SimpleMarkerSymbol;
        return {
          pointRadius: castSymbol.size,
          fillColor: castSymbol.color.toHex(),
          fillOpacity: castSymbol.color.a,
          strokeWidth: castSymbol.outline.width,
          strokeOpacity: castSymbol.outline.color?.a ?? 0,
          strokeColor: castSymbol.outline.color?.toHex() ?? '',
          type: 'point',
        };
      }
      case 'simple-line': {
        const castSymbol = symbol as SimpleLineSymbol;
        return {
          strokeColor: castSymbol.color?.toHex() ?? '',
          strokeOpacity: castSymbol.color?.a ?? 0,
          strokeWidth: castSymbol.width,
          type: 'line',
        };
      }
      case 'simple-fill': {
        const castSymbol = symbol as SimpleFillSymbol;
        return {
          fillColor: castSymbol.color.toHex(),
          fillOpacity: castSymbol.color.a,
          strokeWidth: castSymbol.outline?.width ?? 0,
          strokeOpacity: castSymbol.outline?.color?.a ?? 0,
          strokeColor: castSymbol.outline?.color?.toHex() ?? '',
          type: 'polygon',
        };
      }
      case 'text': {
        const castSymbol = symbol as TextSymbol;
        return {
          haloColor: castSymbol.haloColor?.toHex() ?? '',
          fontColor: castSymbol.color?.toHex() ?? '',
          fontFamily: castSymbol.font.family,
          fontSize: castSymbol.font.size.toString(),
          haloRadius: castSymbol.haloSize?.toString() ?? '',
          labelYOffset: castSymbol.yoffset.toString(),
          labelAlign: CENTER_TOP_LABEL_ALIGNMENT,
          label: TEXT_LABEL,
          type: 'text',
        };
      }
      case 'picture-marker':
      case 'picture-fill':
      case 'point-3d':
      case 'line-3d':
      case 'polygon-3d':
      case 'web-style':
      case 'mesh-3d':
      case 'label-3d':
      case 'cim':
        throw new UnsupportedSymbolizationType(symbol.type);
    }
  }
}
