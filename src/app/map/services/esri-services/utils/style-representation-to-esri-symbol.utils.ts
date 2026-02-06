import {Gb3StyleRepresentation} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Color from '@arcgis/core/Color';
import {ColorUtils} from '../../../../shared/utils/color.utils';
import {SymbolizationColor} from '../../../../shared/interfaces/symbolization.interface';
import {SymbolUnion} from '@arcgis/core/unionTypes';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {EsriDrawingSymbolDefinition} from '../tool-service/strategies/drawing/drawing-symbol/esri-drawing-symbol-definition';
import {MapDrawingSymbol} from 'src/app/shared/interfaces/map-drawing-symbol.interface';
import {DrawingSymbolDescriptor} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-descriptor.interface';
import {EsriDrawingSymbolDescriptor} from '../tool-service/strategies/drawing/drawing-symbol/esri-drawing-symbol-descriptor';
import {DrawingSymbolDefinition} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';

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
        if (mapDrawingSymbol?.drawingSymbolDescriptor) {
          const drawingSymbolDescriptor = mapDrawingSymbol.drawingSymbolDescriptor;
          drawingSymbolDescriptor.resize(style.symbolSize);
          drawingSymbolDescriptor.rotate(style.symbolRotation);

          if (StyleRepresentationToEsriSymbolUtils.isEsriDrawingSymbolDescriptor(drawingSymbolDescriptor)) {
            return drawingSymbolDescriptor;
          }

          return EsriDrawingSymbolDescriptor.fromJSON(drawingSymbolDescriptor.toJSON());
        }

        if (mapDrawingSymbol?.drawingSymbolDefinition) {
          const drawingSymbolDefinition = mapDrawingSymbol.drawingSymbolDefinition;

          if (StyleRepresentationToEsriSymbolUtils.isEsriDrawingSymbolDefinition(drawingSymbolDefinition)) {
            return await drawingSymbolDefinition.fetchDrawingSymbolDescriptor(style.symbolSize, style.symbolRotation);
          }

          return await EsriDrawingSymbolDefinition.fromJSON(drawingSymbolDefinition.toJSON()).fetchDrawingSymbolDescriptor(
            style.symbolSize,
            style.symbolRotation,
          );
        }

        if (style.symbolDefinition) {
          return await EsriDrawingSymbolDefinition.fromJSON(style.symbolDefinition.toJSON()).fetchDrawingSymbolDescriptor(
            style.symbolSize,
            style.symbolRotation,
          );
        }

        return new EsriDrawingSymbolDescriptor(); // Empty since a symbol was requested, but no symbol is present (yet).
      }
    }
  }

  private static convertHexToEsriColor(hex: string, alpha?: number): Color {
    return this.createEsriColor(ColorUtils.convertHexToSymbolizationColor(hex, alpha));
  }

  private static createEsriColor(color: SymbolizationColor): Color {
    return new Color(color);
  }

  private static isEsriDrawingSymbolDescriptor(
    drawingSymbolDescriptor: DrawingSymbolDescriptor,
  ): drawingSymbolDescriptor is EsriDrawingSymbolDescriptor {
    return drawingSymbolDescriptor.type === 'cim';
  }

  private static isEsriDrawingSymbolDefinition(
    drawingSymbolDefinition: DrawingSymbolDefinition,
  ): drawingSymbolDefinition is EsriDrawingSymbolDefinition {
    return drawingSymbolDefinition.type === 'web-style';
  }
}
