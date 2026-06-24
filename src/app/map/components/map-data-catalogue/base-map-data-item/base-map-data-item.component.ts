import {Component, computed, input, output, signal, Signal, WritableSignal} from '@angular/core';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {MapConfigState} from '../../../../state/map/states/map-config.state';
import {MapConstants} from '../../../../shared/constants/map.constants';
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
  // no selector here as it is a base component
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
export class BaseMapDataItemComponent {
  public readonly title = input.required<string>();
  public readonly filterString = input<string | undefined>('');
  /**
   * URL to gb2, if the given mapitem is not yet gb3-capable.
   */
  public readonly gb2Url: Signal<string | null> = signal(null);
  public readonly mapConfigState: Signal<MapConfigState | undefined> = signal(undefined);
  public readonly isAddItemDisabled: Signal<boolean> = signal(false);

  public readonly addEvent = output();
  public readonly hoverStartEvent = output<MapLayer | undefined>();
  public readonly hoverEndEvent = output<MapLayer | undefined>();

  public readonly addLayerEvent = output<MapLayer>();
  public readonly deleteEvent = output();

  public readonly showExpandButton: Signal<boolean> = signal(true);

  public readonly loadingState: Signal<LoadingState> = signal('loaded');
  public readonly invalid: Signal<boolean | undefined> = signal(undefined);

  public readonly layers: Signal<MapLayer[]> = signal([]);
  public readonly imageUrl: Signal<string | undefined> = signal(undefined);

  public readonly isMapHovered: WritableSignal<boolean> = signal(false);
  public readonly hoveredLayer: WritableSignal<MapLayer | undefined> = signal(undefined);

  public readonly filteredLayersCount = computed(() => {
    const filterString = this.filterString();
    if (!filterString) {
      return this.layers().length;
    }

    const lowerCasedFilterString = filterString.toLowerCase();
    return this.layers().filter((layer) => layer.title.toLowerCase().includes(lowerCasedFilterString)).length;
  });

  public showDeleteButton: boolean = false;
  public errorTooltip: string = '';
  public readonly hoverDelay = MapConstants.TEMPORARY_PREVIEW_DELAY;

  public addItem() {
    this.addEvent.emit();
  }

  public setIsHovered(layer?: MapLayer) {
    if (!this.gb2Url()) {
      if (layer) {
        this.hoveredLayer.set(layer);
      } else {
        this.isMapHovered.set(true);
      }
    }
  }

  public hoverStart(layer?: MapLayer) {
    if (!this.gb2Url()) {
      this.hoverStartEvent.emit(layer);
    }
  }

  public hoverEnd(layer?: MapLayer) {
    if (!this.gb2Url()) {
      this.isMapHovered.set(false);
      this.hoveredLayer.set(undefined);
      this.hoverEndEvent.emit(layer);
    }
  }

  public deleteItem() {
    this.deleteEvent.emit();
  }

  public addItemLayer(layer: MapLayer) {
    this.addLayerEvent.emit(layer);
  }
}
