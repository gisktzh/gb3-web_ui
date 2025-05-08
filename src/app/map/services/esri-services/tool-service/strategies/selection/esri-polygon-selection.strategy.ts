import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import {AbstractEsriDrawableToolStrategy} from '../abstract-esri-drawable-tool.strategy';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';
import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import {DataDownloadSelection} from '../../../../../../shared/interfaces/data-download-selection.interface';
import {EsriGraphicToInternalDrawingRepresentationUtils} from '../../../utils/esri-graphic-to-internal-drawing-representation.utils';
import {SupportedSrs} from '../../../../../../shared/types/supported-srs.type';
import Graphic from '@arcgis/core/Graphic';
import {SupportedEsriPolygonTool, SupportedEsriTool} from '../supported-esri-tool.type';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';

export class EsriPolygonSelectionStrategy extends AbstractEsriDrawableToolStrategy<DrawingCallbackHandler['completeSelection']> {
  public readonly internalLayerType: InternalDrawingLayer = InternalDrawingLayer.Selection;
  protected readonly tool: SupportedEsriTool = 'polygon';
  private readonly srs: SupportedSrs;

  public start(): void {
    this.sketchViewModel.create(this.tool, {mode: 'click'});

    reactiveUtils.on(
      () => this.sketchViewModel,
      'create',
      ({state, graphic}: {state: __esri.SketchViewModelCreateEvent['state']; graphic: Graphic}) => {
        switch (state) {
          case 'start':
            this.layer.removeAll();
            break;
          case 'active':
          case 'cancel':
            break; // currently, these events do not trigger any action
          case 'complete':
            this.complete(graphic);
            break;
        }
      },
    );
  }

  public edit(_: Graphic) {
    // currently, editing is not supported for selection strategies
  }

  private complete(graphic: Graphic) {
    this.setIdentifierOnGraphic(graphic);
    const drawingRepresentation = EsriGraphicToInternalDrawingRepresentationUtils.convert(
      graphic,
      undefined,
      this.srs,
      this.internalLayerType,
    );
    const selection: DataDownloadSelection = {
      type: 'polygon',
      drawingRepresentation,
    };
    this.completeDrawingCallbackHandler(selection);
  }

  constructor(
    layer: GraphicsLayer,
    mapView: MapView,
    polygonSymbol: SimpleFillSymbol,
    completeCallbackHandler: DrawingCallbackHandler['completeSelection'],
    polygonType: SupportedEsriPolygonTool,
    srs: SupportedSrs,
  ) {
    super(layer, mapView, completeCallbackHandler);

    layer.removeAll();
    this.sketchViewModel.polygonSymbol = polygonSymbol;
    this.tool = polygonType;
    this.srs = srs;
  }
}
