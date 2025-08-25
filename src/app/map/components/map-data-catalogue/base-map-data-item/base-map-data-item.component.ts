import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {MapConfigState} from '../../../../state/map/states/map-config.state';
import {MapConstants} from '../../../../shared/constants/map.constants';
import {MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelContent} from '@angular/material/expansion';
import {MatTooltip} from '@angular/material/tooltip';
import {DelayedMouseEnterDirective} from '../../../../shared/directives/delayed-mouse-enter.directive';
import {MatIconButton} from '@angular/material/button';
import {NgClass} from '@angular/common';
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
    NgClass,
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
  @Input() public title!: string;
  @Input() public filterString: string | undefined = undefined;
  /**
   * URL to gb2, if the given mapitem is not yet gb3-capable.
   */
  public gb2Url: string | null = null;
  public mapConfigState?: MapConfigState;
  public isAddItemDisabled: boolean = false;

  @Output() public readonly addEvent = new EventEmitter<void>();
  @Output() public readonly hoverStartEvent = new EventEmitter<MapLayer>();
  @Output() public readonly hoverEndEvent = new EventEmitter<MapLayer>();

  public readonly addLayerEvent = new EventEmitter<MapLayer>();
  public readonly deleteEvent = new EventEmitter<void>();
  public readonly hoverDelay = MapConstants.TEMPORARY_PREVIEW_DELAY;
  public showExpandButton: boolean = true;

  public showDeleteButton: boolean = false;
  public loadingState: LoadingState;
  public invalid?: boolean;
  public errorTooltip: string = '';

  public layers: MapLayer[] = [];
  public imageUrl?: string;

  public isMapHovered: boolean = false;
  public hoveredLayer?: MapLayer;

  public addItem() {
    this.addEvent.emit();
  }

  public setIsHovered(layer?: MapLayer) {
    if (!this.gb2Url) {
      if (layer) {
        this.hoveredLayer = layer;
      } else {
        this.isMapHovered = true;
      }
    }
  }

  public hoverStart(layer?: MapLayer) {
    if (!this.gb2Url) {
      this.hoverStartEvent.emit(layer);
    }
  }

  public hoverEnd(layer?: MapLayer) {
    if (!this.gb2Url) {
      this.isMapHovered = false;
      this.hoveredLayer = undefined;
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
