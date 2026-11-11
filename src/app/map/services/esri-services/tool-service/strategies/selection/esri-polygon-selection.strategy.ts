import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import {AbstractEsriDrawableToolStrategy} from '../abstract-esri-drawable-tool.strategy';
import {DrawingCallbackHandler, DrawingCallbackHandlerArgsGeometrySelection} from '../../interfaces/drawing-callback-handler.interface';
import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import {EsriGraphicToInternalDrawingRepresentationUtils} from '../../../utils/esri-graphic-to-internal-drawing-representation.utils';
import {SupportedSrs} from '../../../../../../shared/types/supported-srs.type';
import Graphic from '@arcgis/core/Graphic';
import {SupportedEsriPolygonTool, SupportedEsriTool} from '../supported-esri-tool.type';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import {CreateEvent, UpdateEvent} from '@arcgis/core/widgets/Sketch/types';

export class EsriPolygonSelectionStrategy extends AbstractEsriDrawableToolStrategy<DrawingCallbackHandlerArgsGeometrySelection> {
  public readonly internalLayerType: InternalDrawingLayer = InternalDrawingLayer.Selection;
  protected readonly tool: SupportedEsriTool = 'polygon';
  private readonly srs: SupportedSrs;

  constructor(
    layer: GraphicsLayer,
    mapView: MapView,
    polygonSymbol: SimpleFillSymbol,
    completeCallbackHandler: DrawingCallbackHandler<'completeGeometrySelection'>,
    polygonType: SupportedEsriPolygonTool,
    srs: SupportedSrs,
    internalLayerType: InternalDrawingLayer = InternalDrawingLayer.Selection,
  ) {
    super(layer, mapView, completeCallbackHandler);

    this.sketchViewModel.polygonSymbol = polygonSymbol;
    this.tool = polygonType;
    this.srs = srs;
    this.internalLayerType = internalLayerType;
  }

  public start(): void {
    this.layer.removeAll();

    this.sketchViewModel.addHandles(
      reactiveUtils.on(
        () => this.sketchViewModel,
        'create',
        ({state, graphic}: CreateEvent) => {
          if (this.disposed) return;
          switch (state) {
            case 'start':
              this.layer.removeAll();
              break;
            case 'active':
            case 'cancel':
              break; // currently, these events do not trigger any action
            case 'complete':
              if (graphic) {
                this.complete(graphic);
              }
              break;
          }
        },
      ),
    );
    this.sketchViewModel.create(this.tool, {mode: 'click'});
  }

  public edit(graphic: Graphic) {
    this.sketchViewModel.addHandles(
      reactiveUtils.on(
        () => this.sketchViewModel,
        'update',
        ({state}: UpdateEvent) => {
          if (this.disposed) return;
          if (state === 'complete') this.complete(graphic);
        },
      ),
    );
    this.sketchViewModel.update(graphic, {multipleSelectionEnabled: false});
  }

  private complete(graphic: Graphic) {
    this.setIdentifierOnGraphic(graphic);
    const drawingRepresentation = EsriGraphicToInternalDrawingRepresentationUtils.convert(graphic, this.srs, this.internalLayerType);
    this.completeDrawingCallbackHandler({drawingRepresentation});
  }
}
