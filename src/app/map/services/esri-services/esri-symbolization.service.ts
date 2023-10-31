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
import {FavouriteGb3DrawingStyle} from '../../../shared/interfaces/favourite.interface';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';

@Injectable({
  providedIn: 'root',
})
export class EsriSymbolizationService {
  private readonly layerSymbolizations: LayerSymbolizations = this.configService.layerSymbolizations;

  constructor(private readonly configService: ConfigService) {}

  public createSymbolizationForDrawingLayer(geometry: GeometryWithSrs, drawingLayer: DrawingLayer, label?: string): __esri.Symbol {
    switch (geometry.type) {
      case 'Point':
      case 'MultiPoint':
        // this is only required for drawings since labels for measurements will be regenerated afterwards
        if (drawingLayer === 'drawings' && label) {
          const textSymbol = this.createTextSymbolization(drawingLayer);
          textSymbol.text = label;
          return textSymbol;
        }
        return this.createPointSymbolization(drawingLayer);
      case 'LineString':
      case 'MultiLineString':
        return this.createLineSymbolization(drawingLayer);
      case 'Polygon':
      case 'MultiPolygon':
        return this.createPolygonSymbolization(drawingLayer);
      case 'GeometryCollection': {
        throw new UnsupportedGeometryType(geometry.type);
      }
    }
  }

  public createTextSymbolization(drawingLayer: DrawingLayer): TextSymbol {
    const textSymbology = this.layerSymbolizations[drawingLayer].text;
    return new TextSymbol({
      font: {
        size: textSymbology.size,
      },
      color: this.createEsriColor(textSymbology.color),
      haloColor: this.createEsriColor(textSymbology.outline.color),
      haloSize: textSymbology.outline.width,
      yoffset: textSymbology.yOffset,
      xoffset: textSymbology.xOffset,
    });
  }

  public createPointSymbolization(drawingLayer: DrawingLayer): MarkerSymbol {
    const pointSymbology = this.layerSymbolizations[drawingLayer].point;
    switch (pointSymbology.type) {
      case 'simple':
        return new EsriSimpleMarkerSymbol({
          color: this.createEsriColor(pointSymbology.color),
          size: pointSymbology.size,
          outline: {
            width: pointSymbology.outline.width,
            color: this.createEsriColor(pointSymbology.outline.color),
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

  public createLineSymbolization(drawingLayer: DrawingLayer): SimpleLineSymbol {
    const lineSymbology = this.layerSymbolizations[drawingLayer].line;
    return new EsriSimpleLineSymbol({
      color: this.createEsriColor(lineSymbology.color),
      width: lineSymbology.width,
    });
  }

  public createPolygonSymbolization(drawingLayer: DrawingLayer): SimpleFillSymbol {
    const polygonSymbology = this.layerSymbolizations[drawingLayer].polygon;
    return new EsriSimpleFillSymbol({
      color: this.createEsriColor(polygonSymbology.fill.color),
      outline: {
        width: polygonSymbology.outline.width,
        color: this.createEsriColor(polygonSymbology.outline.color),
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public extractGb3SymbolizationFromSymbol(symbol: Symbol): FavouriteGb3DrawingStyle {
    // todo: GB3-604/GB3-608, styling
    switch (symbol.type) {
      case 'simple-marker':
        return {
          pointRadius: (symbol as SimpleMarkerSymbol).size.toString(),
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
          type: 'text',
        };
      default:
        throw new UnsupportedSymbolizationType(symbol.type);
    }
  }

  private createEsriColor(color: SymbolizationColor): Color {
    return new EsriColor(color);
  }
}
