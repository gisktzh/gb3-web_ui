import {Gb3StyleRepresentation} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {UnsupportedSymbolizationType} from '../errors/esri.errors';
import {SymbolUnion} from '@arcgis/core/unionTypes';
import {defaultSymbolization} from '../../../../shared/configs/symbolization.config';
import {ColorUtils} from '../../../../shared/utils/color.utils';

const CENTER_TOP_LABEL_ALIGNMENT = 'ct';
const TEXT_LABEL = '[text]';

export class EsriSymbolToStyleRepresentationUtils {
  public static convert(symbol: SymbolUnion): Gb3StyleRepresentation {
    switch (symbol.type) {
      case 'simple-marker': {
        const castSymbol = symbol as SimpleMarkerSymbol;
        const defaultOutline = ColorUtils.convertSymbolizationColorToHex(defaultSymbolization.point.outline.color);
        return {
          pointRadius: castSymbol.size,
          fillColor: castSymbol.color.toHex(),
          fillOpacity: castSymbol.color.a,
          strokeWidth: castSymbol.outline.width,
          strokeOpacity: castSymbol.outline.color?.a ?? defaultOutline.alpha,
          strokeColor: castSymbol.outline.color?.toHex() ?? defaultOutline.hexColor,
          type: 'point',
        };
      }
      case 'simple-line': {
        const castSymbol = symbol as SimpleLineSymbol;
        const defaultColor = ColorUtils.convertSymbolizationColorToHex(defaultSymbolization.line.color);
        return {
          strokeColor: castSymbol.color?.toHex() ?? defaultColor.hexColor,
          strokeOpacity: castSymbol.color?.a ?? defaultColor.alpha,
          strokeWidth: castSymbol.width,
          type: 'line',
        };
      }
      case 'simple-fill': {
        const castSymbol = symbol as SimpleFillSymbol;
        const defaultStrokeColor = ColorUtils.convertSymbolizationColorToHex(defaultSymbolization.polygon.outline.color);
        return {
          fillColor: castSymbol.color.toHex(),
          fillOpacity: castSymbol.color.a,
          strokeWidth: castSymbol.outline?.width ?? defaultSymbolization.polygon.outline.width,
          strokeOpacity: castSymbol.outline?.color?.a ?? defaultStrokeColor.alpha,
          strokeColor: castSymbol.outline?.color?.toHex() ?? defaultStrokeColor.hexColor,
          type: 'polygon',
        };
      }
      case 'text': {
        const castSymbol = symbol as TextSymbol;
        const defaultFontColor = ColorUtils.convertSymbolizationColorToHex(defaultSymbolization.text.color);
        const defaultHaloColor = ColorUtils.convertSymbolizationColorToHex(defaultSymbolization.text.outline.color);
        return {
          haloColor: castSymbol.haloColor?.toHex() ?? defaultHaloColor.hexColor,
          fontColor: castSymbol.color?.toHex() ?? defaultFontColor.hexColor,
          fontFamily: castSymbol.font.family,
          fontSize: castSymbol.font.size.toString(),
          haloRadius: castSymbol.haloSize?.toString() ?? defaultSymbolization.text.outline.width.toString(),
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
