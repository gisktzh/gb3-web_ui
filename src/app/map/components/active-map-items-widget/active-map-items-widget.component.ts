import {Component, OnDestroy, OnInit} from '@angular/core';
import {EsriMapService} from '../../services/esri-map.service';
import {CdkDrag, CdkDragDrop} from '@angular/cdk/drag-drop';
import {MatSliderChange} from '@angular/material/slider';
import {Store} from '@ngrx/store';
import {ActiveMapItemActions} from '../../../core/state/map/actions/active-map-item.actions';
import {selectActiveMapItems} from '../../../core/state/map/reducers/active-map-item.reducer';
import {Subscription} from 'rxjs';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {LegendActions} from '../../../core/state/map/actions/legend.actions';
import {LoadingState} from '../../../shared/enums/loading-state';
import {TopicLayer} from '../../../shared/interfaces/topic.interface';

@Component({
  selector: 'active-map-items-widget',
  templateUrl: './active-map-items-widget.component.html',
  styleUrls: ['./active-map-items-widget.component.scss']
})
export class ActiveMapItemsWidgetComponent implements OnInit, OnDestroy {
  private readonly activeMapItems$ = this.store.select(selectActiveMapItems);
  private readonly subscription: Subscription = new Subscription();

  private _activeMapItems: ActiveMapItem[] = [];

  public readonly LOADING_STATE = LoadingState;

  constructor(private readonly mapService: EsriMapService, private readonly store: Store) {}

  public get activeMapItems(): ActiveMapItem[] {
    return this._activeMapItems;
  }

  public ngOnInit() {
    this.subscription.add(
      this.activeMapItems$.subscribe((currentActiveMapItems) => {
        this._activeMapItems = currentActiveMapItems;
      })
    );
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public trackByMapItemId(index: number, item: ActiveMapItem) {
    return item.id;
  }

  public trackByLayerId(index: number, item: TopicLayer) {
    return item.id;
  }

  public dropMapItem($event: CdkDragDrop<CdkDrag>) {
    this.store.dispatch(
      ActiveMapItemActions.reorderActiveMapItem({previousIndex: $event.previousIndex, currentIndex: $event.currentIndex})
    );
  }

  public onOpacitySliderChange($event: MatSliderChange, activeMapItem: ActiveMapItem) {
    const opacity = $event.value ?? 1;
    this.store.dispatch(ActiveMapItemActions.setOpacity({opacity, activeMapItem}));
  }

  public removeActiveMapItem(activeMapItem: ActiveMapItem) {
    this.store.dispatch(ActiveMapItemActions.removeActiveMapItem(activeMapItem));
  }

  public removeAllActiveMapItems() {
    this.store.dispatch(ActiveMapItemActions.removeAllActiveMapItems());
  }

  public toggleMapItemVisibility(activeMapItem: ActiveMapItem) {
    this.store.dispatch(ActiveMapItemActions.setVisibility({visible: !activeMapItem.visible, activeMapItem}));
  }

  public toggleSublayerVisibility(activeMapItem: ActiveMapItem, layerId: number) {
    const sublayer = activeMapItem.layers.find((l) => l.id === layerId);
    if (sublayer) {
      this.store.dispatch(ActiveMapItemActions.setSublayerVisibility({visible: !sublayer.visible, activeMapItem, layerId}));
    }
  }

  public toggleLegend() {
    this.store.dispatch(LegendActions.showLegend());
  }
}
