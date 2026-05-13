import {Component, input} from '@angular/core';
import {ToggleButtonPosition} from '../../../types/toggle-button-position.type';
import {MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelContent} from '@angular/material/expansion';

import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {ShowTooltipIfTruncatedDirective} from '../../../../shared/directives/show-tooltip-if-truncated.directive';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'map-overlay-list-item',
  templateUrl: './map-overlay-list-item.component.html',
  styleUrls: ['./map-overlay-list-item.component.scss'],
  imports: [
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatIcon,
    MatTooltip,
    ShowTooltipIfTruncatedDirective,
    RouterLink,
    MatExpansionPanelContent,
  ],
})
export class MapOverlayListItemComponent {
  public readonly overlayTitle = input('');
  public readonly metaDataLink = input<string>();
  public readonly forceExpanded = input(false);
  public readonly disabled = input(false);
  public readonly toggleButtonPosition = input<ToggleButtonPosition>('start');
  public readonly removeContentIndent = input(false);
  public readonly hasBackgroundColor = input(true);
  public readonly showInteractiveElements = input(true);
}
