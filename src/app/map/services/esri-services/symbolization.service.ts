import {Injectable} from '@angular/core';
import {EsriColor, EsriSimpleFillSymbol, EsriSimpleLineSymbol, EsriSimpleMarkerSymbol} from '../../external/esri.module';
import {ConfigService} from '../../../shared/services/config.service';
import {DrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {GeometryWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {LayerSymbolizations, SymbolizationColor} from '../../../shared/interfaces/symbolization.interface';

@Injectable({
  providedIn: 'root'
})
export class SymbolizationService {
  private readonly layerSymbolizations: LayerSymbolizations = this.configService.layerSymbolizations;

  constructor(private readonly configService: ConfigService) {}

  public createSymbolizationForDrawingLayer(geometry: GeometryWithSrs, drawingLayer: DrawingLayer) {
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
        throw new Error('Unsupported in Esri');
      } // todo: error handling
    }
  }

  private createPointSymbolization(drawingLayer: DrawingLayer) {
    const pointSymbology = this.layerSymbolizations[drawingLayer].point;
    switch (pointSymbology.type) {
      case 'simple':
        return new EsriSimpleMarkerSymbol({
          color: this.createEsriColor(pointSymbology.color),
          size: pointSymbology.size
        });
      case 'svg':
        return new EsriSimpleMarkerSymbol({
          color: this.createEsriColor(pointSymbology.color),
          path: pointSymbology.path,
          xoffset: pointSymbology.xOffset,
          yoffset: pointSymbology.yOffset,
          size: pointSymbology.size,
          angle: pointSymbology.angle
        });
    }
  }

  private createLineSymbolization(drawingLayer: DrawingLayer) {
    return new EsriSimpleLineSymbol({
      color: this.createEsriColor(this.layerSymbolizations[drawingLayer].line.color),
      width: this.layerSymbolizations[drawingLayer].line.width
    });
  }

  private createPolygonSymbolization(drawingLayer: DrawingLayer) {
    return new EsriSimpleFillSymbol({color: this.createEsriColor(this.layerSymbolizations[drawingLayer].polygon.fill.color)});
  }

  private createEsriColor(color: SymbolizationColor) {
    return new EsriColor(color);
  }
}
