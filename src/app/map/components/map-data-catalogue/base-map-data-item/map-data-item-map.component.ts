import {Component, computed, inject, input} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {selectMapConfigState} from '../../../../state/map/reducers/map-config.reducer';
import {BaseMapDataItemComponent} from './base-map-data-item.component';
import {MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelContent} from '@angular/material/expansion';
import {MatTooltip} from '@angular/material/tooltip';
import {DelayedMouseEnterDirective} from '../../../../shared/directives/delayed-mouse-enter.directive';
import {MatIconButton} from '@angular/material/button';

import {MatIcon} from '@angular/material/icon';
import {MatBadge} from '@angular/material/badge';
import {ShowTooltipIfTruncatedDirective} from '../../../../shared/directives/show-tooltip-if-truncated.directive';
import {Gb2ExitButtonComponent} from '../../../../shared/components/external-link-button/gb2-exit-button.component';
import {LoadingAndProcessBarComponent} from '../../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {MapDataItemMapLayerComponent} from '../map-data-item-map-layer/map-data-item-map-layer.component';
import {HighlightSearchQueryPipe} from '../../../../shared/pipes/highlight-search-query.pipe';
import {AppendMapConfigurationToUrlPipe} from '../../../../shared/pipes/append-map-configuration-to-url.pipe';

@Component({
  selector: 'map-data-item-map',
  templateUrl: './base-map-data-item.component.html',
  styleUrls: ['./base-map-data-item.component.scss'],
  imports: [
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatTooltip,
    DelayedMouseEnterDirective,
    MatIconButton,
    MatIcon,
    MatBadge,
    ShowTooltipIfTruncatedDirective,
    Gb2ExitButtonComponent,
    LoadingAndProcessBarComponent,
    MatExpansionPanelContent,
    MapDataItemMapLayerComponent,
    HighlightSearchQueryPipe,
    AppendMapConfigurationToUrlPipe,
  ],
})
export class MapDataItemMapComponent extends BaseMapDataItemComponent {
  private readonly store = inject(Store);

  public override readonly layers = input<MapLayer[]>([]);
  public override readonly imageUrl = input.required<string | undefined>();
  public override readonly gb2Url = input<string | null>(null);
  public readonly internalMapConfigState = this.store.selectSignal(selectMapConfigState);
  public override readonly mapConfigState = computed(() => {
    if (!this.gb2Url()) {
      return undefined;
    }

    return this.internalMapConfigState();
  });
  public override readonly showExpandButton = computed(() => {
    return !this.gb2Url();
  });
}
