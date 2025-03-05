import {Gb3StyleRepresentation} from '../../../../shared/interfaces/internal-drawing-representation.interface';
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
        const defaultOutline = ColorUtils.convertSymbolizationColorToHex(defaultSymbolization.point.outline.color);
        return {
          pointRadius: symbol.size,
          fillColor: symbol.color.toHex(),
          fillOpacity: symbol.color.a,
          strokeWidth: symbol.outline.width,
          strokeOpacity: symbol.outline.color?.a ?? defaultOutline.alpha,
          strokeColor: symbol.outline.color?.toHex() ?? defaultOutline.hexColor,
          type: 'point',
        };
      }
      case 'simple-line': {
        const defaultColor = ColorUtils.convertSymbolizationColorToHex(defaultSymbolization.line.color);
        return {
          strokeColor: symbol.color?.toHex() ?? defaultColor.hexColor,
          strokeOpacity: symbol.color?.a ?? defaultColor.alpha,
          strokeWidth: symbol.width,
          type: 'line',
        };
      }
      case 'simple-fill': {
        const defaultStrokeColor = ColorUtils.convertSymbolizationColorToHex(defaultSymbolization.polygon.outline.color);
        return {
          fillColor: symbol.color.toHex(),
          fillOpacity: symbol.color.a,
          strokeWidth: symbol.outline?.width ?? defaultSymbolization.polygon.outline.width,
          strokeOpacity: symbol.outline?.color?.a ?? defaultStrokeColor.alpha,
          strokeColor: symbol.outline?.color?.toHex() ?? defaultStrokeColor.hexColor,
          type: 'polygon',
        };
      }
      case 'text': {
        const defaultFontColor = ColorUtils.convertSymbolizationColorToHex(defaultSymbolization.text.color);
        const defaultHaloColor = ColorUtils.convertSymbolizationColorToHex(defaultSymbolization.text.outline.color);
        return {
          haloColor: symbol.haloColor?.toHex() ?? defaultHaloColor.hexColor,
          fontColor: symbol.color?.toHex() ?? defaultFontColor.hexColor,
          fontFamily: symbol.font.family,
          fontSize: symbol.font.size.toString(),
          haloRadius: symbol.haloSize?.toString() ?? defaultSymbolization.text.outline.width.toString(),
          labelYOffset: symbol.yoffset.toString(),
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
