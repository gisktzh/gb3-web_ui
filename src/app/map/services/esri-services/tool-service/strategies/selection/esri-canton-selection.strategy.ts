import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import {DataDownloadSelection} from '../../../../../../shared/interfaces/data-download-selection.interface';
import {UnstyledInternalDrawingRepresentation} from '../../../../../../shared/interfaces/internal-drawing-representation.interface';
import {AbstractEsriSelectionStrategy} from '../abstract-esri-selection.strategy';
import {Observable} from 'rxjs';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {map} from 'rxjs/operators';
import {CantonWithGeometry} from '../../../../../../shared/interfaces/gb3-geoshop-product.interface';
import {SupportedGeometry} from '../../../../../../shared/types/SupportedGeometry.type';
import {ConfigService} from '../../../../../../shared/services/config.service';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';

export class EsriCantonSelectionStrategy extends AbstractEsriSelectionStrategy<DrawingCallbackHandler['completeSelection']> {
  private readonly cantonWithGeometry$;
  constructor(
    layer: GraphicsLayer,
    polygonSymbol: SimpleFillSymbol,
    completeCallbackHandler: DrawingCallbackHandler['completeSelection'],
    cantonWithGeometry$: Observable<CantonWithGeometry | undefined>,
    private readonly configService: ConfigService,
  ) {
    super(layer, polygonSymbol, completeCallbackHandler);
    this.cantonWithGeometry$ = cantonWithGeometry$;
  }

  protected createSelection(): Observable<DataDownloadSelection | undefined> {
    return this.cantonWithGeometry$.pipe(
      map((cantonWithGeometry) => {
        if (!cantonWithGeometry) {
          return undefined;
        }
        const selection: DataDownloadSelection = {
          type: 'canton',
          drawingRepresentation: this.createDrawingRepresentation(cantonWithGeometry.boundingBox),
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
