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

@Injectable({
  providedIn: 'root'
})
export class EsriSymbolizationService {
  private readonly layerSymbolizations: LayerSymbolizations = this.configService.layerSymbolizations;

  constructor(private readonly configService: ConfigService) {}

  public createSymbolizationForDrawingLayer(geometry: GeometryWithSrs, drawingLayer: DrawingLayer): __esri.Symbol {
    switch (geometry.type) {
      case 'Point':
      case 'MultiPoint':
        return this.createPointSymbolization(drawingLayer);
      case 'LineString':
      case 'MultiLineString':
        return this.createLineSymbolization(drawingLayer);
      case 'Polygon':
      case 'MultiPolygon':
        return this.createPolygonSymbolization(drawingLayer);
      case 'GeometryCollection': {
        throw new Error('Unsupported in Esri'); // todo: error handling
      }
    }
  }

  private createPointSymbolization(drawingLayer: DrawingLayer): MarkerSymbol {
    const pointSymbology = this.layerSymbolizations[drawingLayer].point;
    switch (pointSymbology.type) {
      case 'simple':
        return new EsriSimpleMarkerSymbol({
          color: this.createEsriColor(pointSymbology.color),
          size: pointSymbology.size,
          outline: {
            width: pointSymbology.outline.width,
            color: this.createEsriColor(pointSymbology.outline.color)
          }
        });
      case 'picture':
        return new EsriPictureMarkerSymbol({
          url: pointSymbology.url,
          width: pointSymbology.width,
          height: pointSymbology.height,
          xoffset: pointSymbology.xOffset,
          yoffset: pointSymbology.yOffset,
          angle: pointSymbology.angle
        });
    }
  }

  private createLineSymbolization(drawingLayer: DrawingLayer): SimpleLineSymbol {
    const lineSymbology = this.layerSymbolizations[drawingLayer].line;
    return new EsriSimpleLineSymbol({
      color: this.createEsriColor(lineSymbology.color),
      width: lineSymbology.width
    });
  }

  private createPolygonSymbolization(drawingLayer: DrawingLayer): SimpleFillSymbol {
    const polygonSymbology = this.layerSymbolizations[drawingLayer].polygon;
    return new EsriSimpleFillSymbol({
      color: this.createEsriColor(polygonSymbology.fill.color),
      outline: {
        width: polygonSymbology.outline.width,
        color: this.createEsriColor(polygonSymbology.outline.color)
      }
    });
  }

  private createEsriColor(color: SymbolizationColor): Color {
    return new EsriColor(color);
  }
}
