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
  public overlayTitle = input('');
  public metaDataLink = input<string>();
  public forceExpanded = input(false);
  public disabled = input(false);
  public toggleButtonPosition = input<ToggleButtonPosition>('start');
  public removeContentIndent = input(false);
  public hasBackgroundColor = input(true);
  public showInteractiveElements = input(true);
}
