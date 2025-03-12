import {Injectable} from '@angular/core';
import {ConfigService} from '../../../shared/services/config.service';
import {DrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {GeometryWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {LayerSymbolizations, SymbolizationColor} from '../../../shared/interfaces/symbolization.interface';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Color from '@arcgis/core/Color';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {UnsupportedGeometryType} from './errors/esri.errors';
import {DrawingStyleState} from '../../../state/map/states/drawing-style.state';
import {Store} from '@ngrx/store';
import {selectDrawingStyleState} from '../../../state/map/reducers/drawing-style.reducer';
import {tap} from 'rxjs';
import {MarkerSymbol2DUnion, SymbolUnion} from '@arcgis/core/unionTypes';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';

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

  public createSymbolizationForDrawingLayer(geometry: GeometryWithSrs, drawingLayer: DrawingLayer, label?: string): SymbolUnion {
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

  public createPointSymbolization(drawingLayer: DrawingLayer, isCustomizable: boolean): MarkerSymbol2DUnion {
    const pointSymbology = this.layerSymbolizations[drawingLayer].point;
    switch (pointSymbology.type) {
      case 'simple':
        return new SimpleMarkerSymbol({
          color: this.createEsriColor(this.getCustomizedStyleSettingOrDefault(isCustomizable, 'fillColor', pointSymbology.color)),
          size: pointSymbology.size,
          outline: {
            width: pointSymbology.outline.width,
            color: this.createEsriColor(this.getCustomizedStyleSettingOrDefault(isCustomizable, 'lineColor', pointSymbology.outline.color)),
          },
        });
      case 'picture':
        return new PictureMarkerSymbol({
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
    return new SimpleLineSymbol({
      color: this.createEsriColor(this.getCustomizedStyleSettingOrDefault(isCustomizable, 'lineColor', lineSymbology.color)),
      width: this.getCustomizedStyleSettingOrDefault(isCustomizable, 'lineWidth', lineSymbology.width),
    });
  }

  public createPolygonSymbolization(drawingLayer: DrawingLayer, isCustomizable: boolean): SimpleFillSymbol {
    const polygonSymbology = this.layerSymbolizations[drawingLayer].polygon;
    return new SimpleFillSymbol({
      color: this.createEsriColor(this.getCustomizedStyleSettingOrDefault(isCustomizable, 'fillColor', polygonSymbology.fill.color)),
      outline: {
        width: this.getCustomizedStyleSettingOrDefault(isCustomizable, 'lineWidth', polygonSymbology.outline.width),
        color: this.createEsriColor(this.getCustomizedStyleSettingOrDefault(isCustomizable, 'lineColor', polygonSymbology.outline.color)),
      },
    });
  }

  private getCustomizedStyleSettingOrDefault<T>(isCustomizable: boolean, setting: keyof DrawingStyleState, defaultSetting: T): T {
    if (isCustomizable) {
      return (this.drawingStyleSettings?.[setting] as T) ?? defaultSetting;
    }

    return defaultSetting;
  }

  private createEsriColor(color: SymbolizationColor): Color {
    return new Color(color);
  }
}
