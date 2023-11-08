import {Component, Input} from '@angular/core';
import {MAT_TOOLTIP_DEFAULT_OPTIONS} from '@angular/material/tooltip';
import {toolTipFactoryLongDelay} from 'src/app/shared/factories/tooltip-long-delay.factory';
import {ConfigService} from 'src/app/shared/services/config.service';
import {ToggleButtonPosition} from '../../../types/toggle-button-position.type';

@Component({
  selector: 'map-overlay-list-item',
  templateUrl: './map-overlay-list-item.component.html',
  styleUrls: ['./map-overlay-list-item.component.scss'],
  providers: [{provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useFactory: toolTipFactoryLongDelay, deps: [ConfigService]}],
})
export class MapOverlayListItemComponent {
  @Input() public overlayTitle: string = '';
  @Input() public metaDataLink?: string;
  @Input() public forceExpanded: boolean = false;
  @Input() public disabled: boolean = false;
  @Input() public toggleButtonPosition: ToggleButtonPosition = 'start';
  @Input() public removeContentIndent: boolean = false;
  @Input() public hasBackgroundColor: boolean = true;
}
