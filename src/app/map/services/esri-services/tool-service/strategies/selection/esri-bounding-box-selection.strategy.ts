import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import {DataDownloadSelection, GeometryDataDownloadSelection} from '../../../../../../shared/interfaces/data-download-selection.interface';
import {UnstyledInternalDrawingRepresentation} from '../../../../../../shared/interfaces/internal-drawing-representation.interface';
import {AbstractEsriSelectionStrategy} from '../abstract-esri-selection.strategy';
import {Observable} from 'rxjs';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {map} from 'rxjs';
import {SupportedGeometry} from '../../../../../../shared/types/SupportedGeometry.type';
import {ConfigService} from '../../../../../../shared/services/config.service';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';
import {HasBoundingBox} from '../../../../../../shared/interfaces/has-bounding-box.interface';
import {BoundingBoxDataDownloadSelectionGeometry} from '../../../../../../shared/types/data-download-selection-geometry.type';

export class EsriBoundingBoxSelectionStrategy extends AbstractEsriSelectionStrategy<DrawingCallbackHandler['completeSelection']> {
  private readonly boundingBoxWithGeometry$;
  private readonly type: BoundingBoxDataDownloadSelectionGeometry;
  constructor(
    layer: GraphicsLayer,
    polygonSymbol: SimpleFillSymbol,
    completeCallbackHandler: DrawingCallbackHandler['completeSelection'],
    boundingBoxWithGeometry$: Observable<HasBoundingBox | undefined>,
    type: BoundingBoxDataDownloadSelectionGeometry,
    private readonly configService: ConfigService,
  ) {
    super(layer, polygonSymbol, completeCallbackHandler);
    this.boundingBoxWithGeometry$ = boundingBoxWithGeometry$;
    this.type = type;
  }

  protected createSelection(): Observable<DataDownloadSelection | undefined> {
    return this.boundingBoxWithGeometry$.pipe(
      map((boundingBoxWithGeometry) => {
        if (!boundingBoxWithGeometry) {
          return undefined;
        }
        const selection: GeometryDataDownloadSelection = {
          type: this.type,
          drawingRepresentation: this.createDrawingRepresentation(boundingBoxWithGeometry.boundingBox),
        };
        return selection;
      }),
    );
  }

  private createDrawingRepresentation(geometry: SupportedGeometry): UnstyledInternalDrawingRepresentation {
    return {
      type: 'Feature',
      properties: {},
      source: InternalDrawingLayer.Selection,
      geometry: {...geometry, srs: this.configService.mapConfig.defaultMapConfig.srsId},
    };
  }
}
