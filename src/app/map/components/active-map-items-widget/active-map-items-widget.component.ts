import {Component, OnDestroy, OnInit} from '@angular/core';
import {EsriMapService} from '../../services/esri-map.service';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {MatSliderChange} from '@angular/material/slider';
import Collection from '@arcgis/core/core/Collection';
import {Store} from '@ngrx/store';
import {ActiveMapItemActions} from '../../../core/state/map/actions/active-map-item.actions';
import {selectActiveMapItems} from '../../../core/state/map/reducers/active-map-item.reducer';
import {Subscription} from 'rxjs';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {LegendActions} from '../../../core/state/map/actions/legend.actions';

@Component({
  selector: 'active-map-items-widget',
  templateUrl: './active-map-items-widget.component.html',
  styleUrls: ['./active-map-items-widget.component.scss']
})
export class ActiveMapItemsWidgetComponent implements OnInit, OnDestroy {
  private readonly activeMapItems$ = this.store.select(selectActiveMapItems);
  private readonly subscription: Subscription = new Subscription();

  private activeMapItems: ActiveMapItem[] = [];

  constructor(private readonly mapService: EsriMapService, private readonly store: Store) {}

  public ngOnInit() {
    this.subscription.add(
      this.activeMapItems$.subscribe((currentActiveMapItems) => {
        this.activeMapItems = currentActiveMapItems;
      })
    );
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public get layerViews(): __esri.Collection<__esri.LayerView> {
    return this.mapService.mapView.layerViews;
  }

  // TODO: this creates a lot of calculations as Angular will evaluate functions inside HTML a lot
  public getSubLayers(layer: __esri.Layer): __esri.Collection<__esri.WMSSublayer> {
    const wmsLayer = layer as __esri.WMSLayer;
    return wmsLayer ? wmsLayer.sublayers : new Collection<__esri.WMSSublayer>();
  }

  public drop($event: CdkDragDrop<any>) {
    this.layerViews.reorder(this.layerViews.getItemAt($event.previousIndex), $event.currentIndex);
  }

  public onOpacitySliderChange($event: MatSliderChange, layerView: __esri.LayerView) {
    layerView.layer.opacity = $event.value ?? 0;
  }

  public removeLayer(layer: __esri.Layer) {
    // TODO this is not a clean implementation yet; it should be only about active map items (topics/single layers) here and not the Esri layers
    // TODO 'id' is not unique in case of multiple single layers
    const topicToBeRemoved = this.activeMapItems.find((amt) => amt.id === layer.id);
    if (topicToBeRemoved) {
      this.store.dispatch(ActiveMapItemActions.removeActiveMapItem(topicToBeRemoved));
    }
  }

  public removeAllLayers() {
    this.store.dispatch(ActiveMapItemActions.removeAllActiveMapItems());
  }

  public toggleLayerVisibility(layerView: __esri.LayerView) {
    layerView.visible = !layerView.visible;
  }

  // TODO this should be a generic Layer and not a WMSSubLayer to ensure that we are compatible with other types of maps later
  public toggleSubLayerVisibility(subLayer: __esri.WMSSublayer, parentLayer: __esri.Layer) {
    if (parentLayer.visible) {
      // only allow toggle if parent is visible
      subLayer.visible = !subLayer.visible;
    }
  }

  public toggleLegend() {
    this.store.dispatch(LegendActions.showLegend());
  }
}
