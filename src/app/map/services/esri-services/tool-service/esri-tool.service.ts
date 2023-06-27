import {Injectable, OnDestroy} from '@angular/core';
import {ToolService} from '../../../interfaces/tool.service';
import {EsriMapViewService} from '../esri-map-view.service';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {Store} from '@ngrx/store';
import {ActiveMapItemFactory} from '../../../../shared/factories/active-map-item.factory';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import {selectDrawingLayers} from '../../../../state/map/selectors/drawing-layers.selector';
import {Subscription, tap} from 'rxjs';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {MeasurementTool} from '../../../../state/map/states/tool.state';
import {EsriToolStrategy} from './interfaces/strategy.interface';
import {DefaultStrategy} from './strategies/default.strategy';
import {LineMeasurementStrategy} from './strategies/line-measurement.strategy';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';

@Injectable({
  providedIn: 'root'
})
export class EsriToolService implements ToolService, OnDestroy {
  private toolStrategy: EsriToolStrategy = new DefaultStrategy();
  private drawingLayers: ActiveMapItem[] = [];
  private readonly drawingLayers$ = this.store.select(selectDrawingLayers);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly esriMapViewService: EsriMapViewService, private readonly store: Store) {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public startMeasurement(measurementType: MeasurementTool): void {
    const drawingLayer = this.esriMapViewService.findEsriLayer('measurement');

    if (!drawingLayer) {
      reactiveUtils
        .once(() => this.esriMapViewService.findEsriLayer('measurement'))
        .then((layer) => {
          this.setMeasurementStrategy(measurementType, layer as GraphicsLayer);
          this.startDrawing();
        });

      const drawingLayerAdd = ActiveMapItemFactory.createDrawingMapItem();
      this.store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: drawingLayerAdd, position: 0}));
    } else {
      this.forceVisibility();
      this.setMeasurementStrategy(measurementType, drawingLayer as GraphicsLayer);
      this.startDrawing();
    }
  }

  private initSubscriptions() {
    this.subscriptions.add(this.drawingLayers$.pipe(tap((drawingLayers) => (this.drawingLayers = drawingLayers))).subscribe());
  }

  private startDrawing() {
    this.toolStrategy.start();
  }

  /**
   * Forces the drawing layer to become visible to prevent users from measuring on transparent or invisible drawing layers.
   * @private
   */
  private forceVisibility() {
    // todo: refactor to array once we have more to avoid non-null assertion
    const activeMapItem = this.drawingLayers.find((l) => l.id === 'measurement')!;
    this.store.dispatch(ActiveMapItemActions.forceFullVisibility({activeMapItem}));
  }

  private setMeasurementStrategy(measurementType: MeasurementTool, layer: GraphicsLayer) {
    switch (measurementType) {
      case 'measure-area':
        throw Error('Measure Area not yet implemented!');
      case 'measure-line':
        this.toolStrategy = new LineMeasurementStrategy(layer, this.esriMapViewService.mapView);
        break;
      case 'measure-point':
        throw Error('Measure Point not yet implemented!');
    }
  }
}
