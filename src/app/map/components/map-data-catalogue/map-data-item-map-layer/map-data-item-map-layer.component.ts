import {Component, computed, inject, input, output} from '@angular/core';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {Store} from '@ngrx/store';
import {selectScale} from '../../../../state/map/reducers/map-config.reducer';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

import {MatTooltip} from '@angular/material/tooltip';
import {HighlightSearchQueryPipe} from '../../../../shared/pipes/highlight-search-query.pipe';
import {LayerTooltipPipe} from '../../../../shared/pipes/layer-tooltip.pipe';

@Component({
  selector: 'map-data-item-map-layer',
  templateUrl: './map-data-item-map-layer.component.html',
  styleUrls: ['./map-data-item-map-layer.component.scss'],
  imports: [MatCheckbox, MatIconButton, MatIcon, MatTooltip, HighlightSearchQueryPipe, LayerTooltipPipe],
})
export class MapDataItemMapLayerComponent {
  private readonly store = inject(Store);

  public readonly layer = input.required<MapLayer>();
  public readonly filterString = input<string | undefined>(undefined);
  public readonly isMapHovered = input(false);
  public readonly isLayerHovered = input(false);
  public readonly scale = this.store.selectSignal(selectScale);
  public readonly visibleAtCurrentScale = computed(() => {
    const scale = this.scale();
    if (!scale) {
      return true;
    }

    return this.layer().minScale < scale && scale <= this.layer().maxScale;
  });

  public readonly addLayerEvent = output();

  public addItemLayer() {
    this.addLayerEvent.emit();
  }
}
