import {Component, OnDestroy, OnInit} from '@angular/core';
import {MapService} from '../../services/map.service';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {MatSliderChange} from '@angular/material/slider';
import Collection from '@arcgis/core/core/Collection';
import {Store} from '@ngrx/store';
import {ActiveTopicActions} from '../../../core/state/map/actions/active-topic.actions';
import {selectActiveTopics} from '../../../core/state/map/reducers/active-topics.reducer';
import {Subscription} from 'rxjs';
import {ActiveTopic} from '../../models/active-topic.model';
import {LegendActions} from '../../../core/state/map/actions/legend.actions';

@Component({
  selector: 'active-layer-widget',
  templateUrl: './active-layer-widget.component.html',
  styleUrls: ['./active-layer-widget.component.scss']
})
export class ActiveLayerWidgetComponent implements OnInit, OnDestroy {
  private readonly activeTopics$ = this.store.select(selectActiveTopics);
  private readonly subscription: Subscription = new Subscription();

  private activeTopics: ActiveTopic[] = [];

  constructor(private readonly mapService: MapService, private readonly store: Store) {}

  public ngOnInit() {
    this.subscription.add(
      this.activeTopics$.subscribe((currentActiveTopics) => {
        this.activeTopics = currentActiveTopics;
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
    // TODO this is not a clean implementation yet; it should be only about active topics here and not the Esri layers
    const topicToBeRemoved = this.activeTopics.find((at) => at.topic.title === layer.title);
    if (topicToBeRemoved) {
      this.store.dispatch(ActiveTopicActions.removeActiveTopic(topicToBeRemoved));
    }
  }

  public removeAllLayers() {
    this.store.dispatch(ActiveTopicActions.removeAllActiveTopics());
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
