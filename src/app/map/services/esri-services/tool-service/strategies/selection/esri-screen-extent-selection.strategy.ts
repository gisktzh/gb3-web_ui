import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import {DataDownloadSelection} from '../../../../../../shared/interfaces/data-download-selection.interface';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {UnstyledInternalDrawingRepresentation} from '../../../../../../shared/interfaces/internal-drawing-representation.interface';
import Extent from '@arcgis/core/geometry/Extent';
import {AbstractEsriSelectionStrategy} from '../abstract-esri-selection.strategy';
import {Observable, of} from 'rxjs';
import {SelectionCallbackHandler} from '../../interfaces/selection-callback-handler.interface';

export class EsriScreenExtentSelectionStrategy extends AbstractEsriSelectionStrategy {
  private readonly screenExtent;

  constructor(
    layer: GraphicsLayer,
    polygonSymbol: SimpleFillSymbol,
    selectionCallbackHandler: SelectionCallbackHandler,
    screenExtent: Extent,
  ) {
    super(layer, polygonSymbol, selectionCallbackHandler);
    this.screenExtent = screenExtent;
  }

  protected createSelection(): Observable<DataDownloadSelection | undefined> {
    const drawingRepresentation = this.createDrawingRepresentation();
    const selection: DataDownloadSelection = {
      type: 'select-section',
      drawingRepresentation: drawingRepresentation,
    };
    return of(selection);
  }

  private createDrawingRepresentation(): UnstyledInternalDrawingRepresentation {
    return {
      type: 'Feature',
      properties: {},
      source: InternalDrawingLayer.Selection,
      geometry: {
        type: 'Polygon',
        coordinates: this.convertExtentToPolygonGeometry(this.screenExtent),
        srs: 2056,
      },
    };
  }

  private convertExtentToPolygonGeometry(extent: Extent): number[][][] {
    return [
      [
        [extent.xmin, extent.ymin],
        [extent.xmin, extent.ymax],
        [extent.xmax, extent.ymax],
        [extent.xmax, extent.ymin],
      ],
    ];
  }
}
