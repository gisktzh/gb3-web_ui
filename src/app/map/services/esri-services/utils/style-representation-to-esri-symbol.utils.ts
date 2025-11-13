import WebStyleSymbol from '@arcgis/core/symbols/WebStyleSymbol';
import {Gb3StyleRepresentation} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Color from '@arcgis/core/Color';
import {ColorUtils} from '../../../../shared/utils/color.utils';
import {SymbolizationColor} from '../../../../shared/interfaces/symbolization.interface';
import {SymbolUnion} from '@arcgis/core/unionTypes';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import CIMSymbol from '@arcgis/core/symbols/CIMSymbol';
import {scaleCIMSymbolTo, applyCIMSymbolRotation} from '@arcgis/core/symbols/support/cimSymbolUtils.js';
import {MapDrawingSymbol} from '../types/map-drawing-symbol.type';

export class StyleRepresentationToEsriSymbolUtils {
  public static async convert(
    style: Gb3StyleRepresentation,
    labelText?: string,
    mapDrawingSymbol?: MapDrawingSymbol,
  ): Promise<SymbolUnion> {
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
      case 'symbol': {
        if (mapDrawingSymbol) {
          if (mapDrawingSymbol.cimSymbol) {
            scaleCIMSymbolTo(mapDrawingSymbol.cimSymbol, style.symbolSize);
            applyCIMSymbolRotation(mapDrawingSymbol.cimSymbol, style.symbolRotation);

            return mapDrawingSymbol.cimSymbol;
          }

          if (mapDrawingSymbol.webStyleSymbol) {
            return await this.loadCimSymbol(mapDrawingSymbol.webStyleSymbol, style.symbolSize, style.symbolRotation);
          }
        }

        if (style.webStyleSymbol) {
          return await this.loadCimSymbol(WebStyleSymbol.fromJSON(style.webStyleSymbol), style.symbolSize, style.symbolRotation);
        }

        return new CIMSymbol(); // Empty since a symbol was requested, but no symbol is present (yet).
      }
    }
  }

  private static convertHexToEsriColor(hex: string, alpha?: number): Color {
    return this.createEsriColor(ColorUtils.convertHexToSymbolizationColor(hex, alpha));
  }

  private static createEsriColor(color: SymbolizationColor): Color {
    return new Color(color);
  }

  private static async loadCimSymbol(webStyleSymbol: WebStyleSymbol, size: number, rotation: number) {
    const cimSymbol = (await webStyleSymbol.fetchSymbol({acceptedFormats: ['cim']})) as CIMSymbol;

    scaleCIMSymbolTo(cimSymbol, size);
    applyCIMSymbolRotation(cimSymbol, rotation);

    return cimSymbol;
  }
}
