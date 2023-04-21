import {Component, Input} from '@angular/core';
import {ActiveMapItem} from '../../../../models/active-map-item.model';
import {MapLayer} from '../../../../../shared/interfaces/topic.interface';
import {ActiveMapItemActions} from '../../../../../state/map/actions/active-map-item.actions';
import {Store} from '@ngrx/store';

@Component({
  selector: 'active-map-item-layer',
  templateUrl: './active-map-item-layer.component.html',
  styleUrls: ['./active-map-item-layer.component.scss']
})
export class ActiveMapItemLayerComponent {
  @Input() public activeMapItem!: ActiveMapItem;
  @Input() public layer!: MapLayer;

  constructor(private readonly store: Store) {}

  public toggleSublayerVisibility(layer: MapLayer) {
    this.store.dispatch(
      ActiveMapItemActions.setSublayerVisibility({visible: !layer.visible, activeMapItem: this.activeMapItem, layerId: layer.id})
    );
  }
}
