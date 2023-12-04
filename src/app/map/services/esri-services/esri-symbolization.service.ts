import {Injectable} from '@angular/core';
import {EsriColor, EsriPictureMarkerSymbol, EsriSimpleFillSymbol, EsriSimpleLineSymbol, EsriSimpleMarkerSymbol} from './esri.module';
import {ConfigService} from '../../../shared/services/config.service';
import {DrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {GeometryWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {LayerSymbolizations, SymbolizationColor} from '../../../shared/interfaces/symbolization.interface';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Color from '@arcgis/core/Color';
import MarkerSymbol from '@arcgis/core/symbols/MarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {UnsupportedGeometryType, UnsupportedSymbolizationType} from './errors/esri.errors';
import Symbol from '@arcgis/core/symbols/Symbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import {Gb3StyleRepresentation} from '../../../shared/interfaces/internal-drawing-representation.interface';
import {DrawingStyleState} from '../../../state/map/states/drawing-style.state';
import {Store} from '@ngrx/store';
import {selectDrawingStyleState} from '../../../state/map/reducers/drawing-style.reducer';
import {tap} from 'rxjs';
import {ColorUtils} from '../../../shared/utils/color.utils';

@Injectable({
  providedIn: 'root',
})
export class EsriSymbolizationService {
  private layerSymbolizations: LayerSymbolizations = this.configService.layerSymbolizations;
  private drawingStyleSettings?: DrawingStyleState;

  constructor(
    private readonly configService: ConfigService,
    private readonly store: Store,
  ) {
    this.store
      .select(selectDrawingStyleState)
      .pipe(tap((drawingStyleState) => (this.drawingStyleSettings = drawingStyleState)))
      .subscribe();
  }

  public createSymbolizationForDrawingLayer(geometry: GeometryWithSrs, drawingLayer: DrawingLayer, label?: string): __esri.Symbol {
    switch (geometry.type) {
      case 'Point':
      case 'MultiPoint':
        // this is only required for drawings since labels for measurements will be regenerated afterwards
        if (drawingLayer === 'drawings' && label) {
          return this.createTextSymbolizationWithText(drawingLayer, label, false);
        }
        return this.createPointSymbolization(drawingLayer, false);
      case 'LineString':
      case 'MultiLineString':
        return this.createLineSymbolization(drawingLayer, false);
      case 'Polygon':
      case 'MultiPolygon':
        return this.createPolygonSymbolization(drawingLayer, false);
      case 'GeometryCollection': {
        throw new UnsupportedGeometryType(geometry.type);
      }
    }
  }

  /**
   * Creates a TextSymbol and sets its property to the supplied text.
   * @param drawingLayer
   * @param text
   * @param isCustomizable Defines whether the symbolization should take the user-defined drawing settings or default redlining only
   */
  public createTextSymbolizationWithText(drawingLayer: DrawingLayer, text: string, isCustomizable: boolean): TextSymbol {
    const textSymbology = this.createTextSymbolization(drawingLayer, isCustomizable);
    textSymbology.text = text;

    return textSymbology;
  }

  public createTextSymbolization(drawingLayer: DrawingLayer, isCustomizable: boolean): TextSymbol {
    const textSymbology = this.layerSymbolizations[drawingLayer].text;
    return new TextSymbol({
      font: {
        size: textSymbology.size,
      },
      color: this.createEsriColor(this.getCustomizedStyleSettingOrDefault(isCustomizable, 'lineColor', textSymbology.color)),
      haloColor: this.createEsriColor(textSymbology.outline.color),
      haloSize: textSymbology.outline.width,
      yoffset: textSymbology.yOffset,
      xoffset: textSymbology.xOffset,
    });
  }

  public createPointSymbolization(drawingLayer: DrawingLayer, isCustomizable: boolean): MarkerSymbol {
    const pointSymbology = this.layerSymbolizations[drawingLayer].point;
    switch (pointSymbology.type) {
      case 'simple':
        return new EsriSimpleMarkerSymbol({
          color: this.createEsriColor(this.getCustomizedStyleSettingOrDefault(isCustomizable, 'fillColor', pointSymbology.color)),
          size: pointSymbology.size,
          outline: {
            width: pointSymbology.outline.width,
            color: this.createEsriColor(this.getCustomizedStyleSettingOrDefault(isCustomizable, 'lineColor', pointSymbology.outline.color)),
          },
        });
      case 'picture':
        return new EsriPictureMarkerSymbol({
          url: pointSymbology.url,
          width: pointSymbology.width,
          height: pointSymbology.height,
          xoffset: pointSymbology.xOffset,
          yoffset: pointSymbology.yOffset,
          angle: pointSymbology.angle,
        });
    }
  }

  public createLineSymbolization(drawingLayer: DrawingLayer, isCustomizable: boolean): SimpleLineSymbol {
    const lineSymbology = this.layerSymbolizations[drawingLayer].line;
    return new EsriSimpleLineSymbol({
      color: this.createEsriColor(this.getCustomizedStyleSettingOrDefault(isCustomizable, 'lineColor', lineSymbology.color)),
      width: this.getCustomizedStyleSettingOrDefault(isCustomizable, 'lineWidth', lineSymbology.width),
    });
  }

  public createPolygonSymbolization(drawingLayer: DrawingLayer, isCustomizable: boolean): SimpleFillSymbol {
    const polygonSymbology = this.layerSymbolizations[drawingLayer].polygon;
    return new EsriSimpleFillSymbol({
      color: this.createEsriColor(this.getCustomizedStyleSettingOrDefault(isCustomizable, 'fillColor', polygonSymbology.fill.color)),
      outline: {
        width: this.getCustomizedStyleSettingOrDefault(isCustomizable, 'lineWidth', polygonSymbology.outline.width),
        color: this.createEsriColor(this.getCustomizedStyleSettingOrDefault(isCustomizable, 'lineColor', polygonSymbology.outline.color)),
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public extractGb3SymbolizationFromSymbol(symbol: Symbol): Gb3StyleRepresentation {
    switch (symbol.type) {
      case 'simple-marker':
        return {
          pointRadius: (symbol as SimpleMarkerSymbol).size,
          fillColor: symbol.color.toHex(),
          fillOpacity: symbol.color.a,
          strokeWidth: (symbol as SimpleMarkerSymbol).outline.width,
          strokeOpacity: (symbol as SimpleMarkerSymbol).outline.color.a,
          strokeColor: (symbol as SimpleMarkerSymbol).outline.color.toHex(),
          type: 'point',
        };
      case 'simple-line':
        return {
          strokeColor: symbol.color.toHex(),
          strokeOpacity: symbol.color.a,
          strokeWidth: (symbol as SimpleLineSymbol).width,
          type: 'line',
        };
      case 'simple-fill':
        return {
          fillColor: symbol.color.toHex(),
          fillOpacity: symbol.color.a,
          strokeWidth: (symbol as SimpleFillSymbol).outline.width,
          strokeOpacity: (symbol as SimpleFillSymbol).outline.color.a,
          strokeColor: (symbol as SimpleFillSymbol).outline.color.toHex(),
          type: 'polygon',
        };
      case 'text':
        return {
          haloColor: (symbol as TextSymbol).haloColor.toHex(),
          fontColor: symbol.color.toHex(),
          fontFamily: (symbol as TextSymbol).font.family,
          fontSize: (symbol as TextSymbol).font.size.toString(),
          haloRadius: (symbol as TextSymbol).haloSize.toString(),
          labelYOffset: (symbol as TextSymbol).yoffset.toString(), // todo: actual offset is rather x2.1
          labelAlign: 'ct', // todo: type?
          label: '[text]', // todo: type?
          type: 'text',
        };
      default:
        throw new UnsupportedSymbolizationType(symbol.type);
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public extractSymbolFromGb3Representation(style: Gb3StyleRepresentation, labelText?: string): __esri.Symbol {
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
        console.log(style);
        return new EsriSimpleMarkerSymbol({
          color: this.convertHexToEsriColor(style.fillColor),
          size: style.pointRadius,
          outline: {
            color: this.convertHexToEsriColor(style.strokeColor),
          },
        });
      }
      case 'line': {
        return new EsriSimpleLineSymbol({
          color: this.convertHexToEsriColor(style.strokeColor),
          width: style.strokeWidth,
        });
      }
      case 'polygon': {
        return new EsriSimpleFillSymbol({
          color: this.convertHexToEsriColor(style.fillColor, style.fillOpacity), // todo: extract default alpha value
          outline: {
            width: style.strokeWidth,
            color: this.convertHexToEsriColor(style.strokeColor),
          },
        });
      }
    }
  }

  private getCustomizedStyleSettingOrDefault<T>(isCustomizable: boolean, setting: keyof DrawingStyleState, defaultSetting: T): T {
    if (isCustomizable) {
      return (this.drawingStyleSettings?.[setting] as T) ?? defaultSetting;
    }

    return defaultSetting;
  }

  private createEsriColor(color: SymbolizationColor): Color {
    return new EsriColor(color);
  }

  private convertHexToEsriColor(hex: string, alpha?: number): Color {
    return this.createEsriColor(ColorUtils.convertHexToSymbolizationColor(hex, alpha));
  }
}
