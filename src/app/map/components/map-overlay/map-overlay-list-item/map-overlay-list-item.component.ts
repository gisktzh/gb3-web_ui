import {Component, Input} from '@angular/core';
import {ToggleButtonPosition} from '../../../types/toggle-button-position.type';
import {MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelContent} from '@angular/material/expansion';
import {NgClass} from '@angular/common';
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
    NgClass,
    MatExpansionPanelHeader,
    MatIcon,
    MatTooltip,
    ShowTooltipIfTruncatedDirective,
    RouterLink,
    MatExpansionPanelContent,
  ],
})
export class MapOverlayListItemComponent {
  @Input() public overlayTitle: string = '';
  @Input() public metaDataLink?: string;
  @Input() public forceExpanded: boolean = false;
  @Input() public disabled: boolean = false;
  @Input() public toggleButtonPosition: ToggleButtonPosition = 'start';
  @Input() public removeContentIndent: boolean = false;
  @Input() public hasBackgroundColor: boolean = true;
  @Input() public showInteractiveElements: boolean = true;
}
