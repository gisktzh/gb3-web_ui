import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import {Store} from '@ngrx/store';
import {DataDownloadActions} from '../../../../../../state/map/actions/data-download.actions';
import {DataDownloadSelection} from '../../../../../../shared/interfaces/data-download-selection.interface';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {InternalDrawingRepresentation} from '../../../../../../shared/interfaces/internal-drawing-representation.interface';
import Extent from '@arcgis/core/geometry/Extent';
import Graphic from '@arcgis/core/Graphic';
import {AbstractEsriSelectionStrategy} from './abstract-esri-selection.strategy';

export class EsriScreenExtentSelectionStrategy extends AbstractEsriSelectionStrategy {
  constructor(
    layer: GraphicsLayer,
    polygonSymbol: SimpleFillSymbol,
    store: Store,
    private readonly screenExtent: Extent,
  ) {
    super(layer, polygonSymbol, store);
  }

  public start(): void {
    this.drawRepresentationOnMap();
    this.dispatchSetSelection();
  }

  private drawRepresentationOnMap() {
    const graphic = new Graphic({geometry: this.screenExtent, symbol: this.polygonSymbol});
    this.layer.add(graphic);
  }

  private dispatchSetSelection() {
    const drawingRepresentation = this.createDrawingRepresentation();
    const selection: DataDownloadSelection = {
      type: 'select-section',
      drawingRepresentation: drawingRepresentation,
    };
    this.store.dispatch(DataDownloadActions.setSelection({selection}));
  }

  private createDrawingRepresentation(): InternalDrawingRepresentation {
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
