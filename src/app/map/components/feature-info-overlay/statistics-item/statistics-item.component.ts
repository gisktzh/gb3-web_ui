import {ChangeDetectionStrategy, Component, computed, inject, input, LOCALE_ID} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {StatisticsResult} from '../../../../shared/interfaces/statistics.interface';
import {queryResultStatusTexts} from '../../../../shared/configs/query-result-status.config';
import {MapOverlayListItemComponent} from '../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {ResizableInfoTableComponent} from '../info-table/resizable-info-table.component';
import {mapStatisticsDataToView} from '../../../utils/map-statistics-data-to-view.utils';

@Component({
  selector: 'statistics-item',
  templateUrl: './statistics-item.component.html',
  styleUrls: ['./statistics-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MapOverlayListItemComponent, MatIcon, ResizableInfoTableComponent],
})
export class StatisticsItemComponent {
  private readonly decimalPipe = new DecimalPipe(inject(LOCALE_ID));

  public readonly result = input.required<StatisticsResult>();
  public readonly showInteractiveElements = input(true);

  public readonly layerViews = computed(() =>
    this.result().layers.map((layer) => {
      const statusText = layer.status === 'ok' ? undefined : queryResultStatusTexts[layer.status];
      const tableSections =
        layer.status === 'ok'
          ? mapStatisticsDataToView(layer, (value) => this.decimalPipe.transform(value, '1.0-2') ?? value.toString())
          : [];

      return {
        layer,
        statusText,
        tableSections: tableSections.map((section) => ({
          ...section,
          tableLabel: `Statistik zu ${layer.title}${section.title !== undefined ? `: ${section.title}` : ''}`,
        })),
      };
    }),
  );
}
