import {Component, inject, input} from '@angular/core';
import {LegendDisplay} from '../../../../shared/interfaces/legend.interface';
import {ConfigService} from '../../../../shared/services/config.service';
import {MapOverlayListItemComponent} from '../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {MatIcon} from '@angular/material/icon';
import {NgTemplateOutlet} from '@angular/common';
import {LegendContentComponent} from '../legend-content/legend-content.component';

@Component({
  selector: 'legend-item',
  templateUrl: './legend-item.component.html',
  styleUrls: ['./legend-item.component.scss'],
  imports: [MapOverlayListItemComponent, MatIcon, NgTemplateOutlet, LegendContentComponent],
})
export class LegendItemComponent {
  public readonly legendItem = input.required<LegendDisplay>();
  public readonly showInteractiveElements = input(true);
  public readonly staticFilesBaseUrl = inject(ConfigService).apiConfig.gb2StaticFiles.baseUrl;
}
