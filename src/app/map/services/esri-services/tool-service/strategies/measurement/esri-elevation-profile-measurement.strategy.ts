import {AbstractEsriDrawingStrategy} from '../abstract-esri-drawing.strategy';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';
import {SupportedEsriTool} from '../supported-esri-tool.type';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';

/**
 * Note: Although used for measurement, it is actually a DrawingStrategy, because none of the MeasurementStrategy's specifics are
 * required for this measurement.
 */
export class EsriElevationProfileMeasurementStrategy extends AbstractEsriDrawingStrategy<'completeDrawing'> {
  protected readonly tool: SupportedEsriTool = 'polyline';

  constructor(
    layer: GraphicsLayer,
    mapView: MapView,
    polylineSymbol: SimpleLineSymbol,
    completeDrawingCallbackHandler: DrawingCallbackHandler<'completeDrawing'>,
  ) {
    super(layer, mapView, completeDrawingCallbackHandler);

    this.sketchViewModel.polylineSymbol = polylineSymbol;
  }
}
