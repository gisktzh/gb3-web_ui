import {Gb3StyleRepresentation} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Color from '@arcgis/core/Color';
import {ColorUtils} from '../../../../shared/utils/color.utils';
import {SymbolizationColor} from '../../../../shared/interfaces/symbolization.interface';
import {SymbolUnion} from '@arcgis/core/unionTypes';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';

export class StyleRepresentationToEsriSymbolUtils {
  public static convert(style: Gb3StyleRepresentation, labelText?: string): SymbolUnion {
    switch (style.type) {
      case 'text': {
        return new TextSymbol({
          text: labelText,
          font: {
            size: style.fontSize,
          },
          color: this.convertHexToEsriColor(style.fontColor),
          haloColor: this.convertHexToEsriColor(style.haloColor),
          haloSize: style.haloRadius,
          yoffset: style.labelYOffset,
        });
      }
      case 'point': {
        return new SimpleMarkerSymbol({
          color: this.convertHexToEsriColor(style.fillColor, style.fillOpacity),
          size: style.pointRadius,
          outline: {
            color: this.convertHexToEsriColor(style.strokeColor, style.strokeOpacity),
            width: style.strokeWidth,
          },
        });
      }
      case 'line': {
        return new SimpleLineSymbol({
          color: this.convertHexToEsriColor(style.strokeColor, style.strokeOpacity),
          width: style.strokeWidth,
        });
      }
      case 'polygon': {
        return new SimpleFillSymbol({
          color: this.convertHexToEsriColor(style.fillColor, style.fillOpacity),
          outline: {
            color: this.convertHexToEsriColor(style.strokeColor, style.strokeOpacity),
            width: style.strokeWidth,
          },
        });
      }
    }
  }

  private static convertHexToEsriColor(hex: string, alpha?: number): Color {
    return this.createEsriColor(ColorUtils.convertHexToSymbolizationColor(hex, alpha));
  }

  private static createEsriColor(color: SymbolizationColor): Color {
    return new Color(color);
  }
}
