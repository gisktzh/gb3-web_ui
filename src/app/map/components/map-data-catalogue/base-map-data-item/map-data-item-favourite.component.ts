import {Component, computed, inject, input, signal} from '@angular/core';
import {BaseMapDataItemComponent} from './base-map-data-item.component';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {Store} from '@ngrx/store';
import {selectActiveTool} from '../../../../state/map/reducers/tool.reducer';
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

const FAVOURITE_ERROR_TOOLTIP =
  'Der Favorit kann nicht angezeigt werden. Dies kann verschiedene Gründe haben - z.B. existiert eine (' +
  'oder mehrere) Karten innerhalb des Favorits nicht mehr.';

@Component({
  selector: 'map-data-item-favourite',
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
export class MapDataItemFavouriteComponent extends BaseMapDataItemComponent {
  private readonly store = inject(Store);
  public override readonly loadingState = input.required<LoadingState>();
  public override readonly invalid = input<boolean>();
  public override readonly showExpandButton = signal(false);
  public override showDeleteButton = true;
  public override errorTooltip: string = FAVOURITE_ERROR_TOOLTIP;
  public readonly activeTool = this.store.selectSignal(selectActiveTool);
  public override readonly isAddItemDisabled = computed(() => !!this.activeTool());
}
