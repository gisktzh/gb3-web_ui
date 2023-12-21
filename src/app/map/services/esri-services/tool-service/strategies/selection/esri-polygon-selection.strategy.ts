import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import {AbstractEsriDrawableToolStrategy, SupportedEsriTool} from '../abstract-esri-drawable-tool.strategy';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';
import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import {DataDownloadSelection} from '../../../../../../shared/interfaces/data-download-selection.interface';
import {EsriSymbolizationService} from '../../../esri-symbolization.service';
import {EsriGraphicToInternalDrawingRepresentationUtils} from '../../../utils/esri-graphic-to-internal-drawing-representation.utils';
import {SupportedSrs} from '../../../../../../shared/types/supported-srs.type';
import Graphic from '@arcgis/core/Graphic';

type PolygonType = Extract<SupportedEsriTool, 'circle' | 'polygon' | 'rectangle'>;

export class EsriPolygonSelectionStrategy extends AbstractEsriDrawableToolStrategy<DrawingCallbackHandler['completeSelection']> {
  public readonly internalLayerType: InternalDrawingLayer = InternalDrawingLayer.Selection;
  protected readonly tool: SupportedEsriTool = 'polygon';
  private readonly srs: SupportedSrs;
  private readonly esriSymbolizationService: EsriSymbolizationService;

  public start(): void {
    this.sketchViewModel.create(this.tool, {mode: 'click'});
    this.sketchViewModel.on('create', ({state, graphic}) => {
      switch (state) {
        case 'cancel':
        case 'active':
          break; // currently, these events do not trigger any action
        case 'start':
          // remove all old selections before starting a new one
          this.layer.removeAll();
          break;
        case 'complete':
          this.complete(graphic);
          break;
      }
    });
  }

  private complete(graphic: Graphic) {
    this.setIdentifierOnGraphic(graphic);
    const drawingRepresentation = EsriGraphicToInternalDrawingRepresentationUtils.convert(
      graphic,
      undefined,
      this.srs,
      this.internalLayerType,
      this.esriSymbolizationService,
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
    polygonType: PolygonType,
    srs: SupportedSrs,
    esriSymbolizationService: EsriSymbolizationService,
  ) {
    super(layer, mapView, completeCallbackHandler);

    layer.removeAll();
    this.sketchViewModel.polygonSymbol = polygonSymbol;
    this.tool = polygonType;
    this.srs = srs;
    this.esriSymbolizationService = esriSymbolizationService;
  }
}
