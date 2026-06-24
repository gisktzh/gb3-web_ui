import {Component, inject, input} from '@angular/core';
import {ActiveMapItem} from '../../../../models/active-map-item.model';
import {MapLayer} from '../../../../../shared/interfaces/topic.interface';
import {ActiveMapItemActions} from '../../../../../state/map/actions/active-map-item.actions';
import {Store} from '@ngrx/store';
import {selectScale} from '../../../../../state/map/reducers/map-config.reducer';
import {MatIcon} from '@angular/material/icon';
import {CdkDragHandle} from '@angular/cdk/drag-drop';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatTooltip} from '@angular/material/tooltip';

import {LayerTooltipPipe} from '../../../../../shared/pipes/layer-tooltip.pipe';

@Component({
  selector: 'active-map-item-layer',
  templateUrl: './active-map-item-layer.component.html',
  styleUrls: ['./active-map-item-layer.component.scss'],
  imports: [MatIcon, CdkDragHandle, MatCheckbox, MatTooltip, LayerTooltipPipe],
})
export class ActiveMapItemLayerComponent {
  private readonly store = inject(Store);

  public readonly activeMapItem = input.required<ActiveMapItem>();
  public readonly layer = input.required<MapLayer>();

  public readonly scale = this.store.selectSignal(selectScale);

  public toggleSublayerVisibility(layer: MapLayer) {
    this.store.dispatch(
      ActiveMapItemActions.setSublayerVisibility({visible: !layer.visible, activeMapItem: this.activeMapItem(), layerId: layer.id}),
    );
  }
}
