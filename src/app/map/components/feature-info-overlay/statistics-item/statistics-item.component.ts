import {Component, input, ChangeDetectionStrategy} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {StatisticsResult, StatisticsResultLayer} from '../../../../shared/interfaces/statistics.interface';
import {queryResultStatusTexts} from '../../../../shared/configs/query-result-status.config';
import {MapOverlayListItemComponent} from '../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';

@Component({
  selector: 'statistics-item',
  templateUrl: './statistics-item.component.html',
  styleUrls: ['./statistics-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MapOverlayListItemComponent, MatIcon, DecimalPipe],
})
export class StatisticsItemComponent {
  public readonly result = input.required<StatisticsResult>();
  public readonly showInteractiveElements = input(true);

  public getStatusText(layer: StatisticsResultLayer) {
    return layer.status === 'ok' ? undefined : queryResultStatusTexts[layer.status];
  }
}
