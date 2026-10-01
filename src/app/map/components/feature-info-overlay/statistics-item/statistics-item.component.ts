import {ChangeDetectionStrategy, Component, computed, inject, input, LOCALE_ID, ViewEncapsulation} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {StatisticsResult, StatisticsResultLayer} from '../../../../shared/interfaces/statistics.interface';
import {Store} from '@ngrx/store';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {StatisticsActions} from '../../../../state/map/actions/statistics.actions';
import {selectHighlightedLayer} from '../../../../state/map/reducers/statistics.reducer';
import {queryResultStatusTexts} from '../../../../shared/configs/query-result-status.config';
import {MapOverlayListItemComponent} from '../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {ResizableInfoTableComponent} from '../info-table/resizable-info-table.component';
import {mapStatisticsDataToView} from '../../../utils/map-statistics-data-to-view.utils';

@Component({
  selector: 'statistics-item',
  templateUrl: './statistics-item.component.html',
  styleUrls: ['./statistics-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
  imports: [MapOverlayListItemComponent, MatIcon, ResizableInfoTableComponent, MatRadioButton, MatRadioGroup],
})
export class StatisticsItemComponent {
  private readonly decimalPipe = new DecimalPipe(inject(LOCALE_ID));
  private readonly store = inject(Store);

  public readonly result = input.required<StatisticsResult>();
  public readonly showInteractiveElements = input(true);
  public readonly highlightedLayer = this.store.selectSignal(selectHighlightedLayer);
  public readonly highlightedLayerName = computed(() => {
    const highlighted = this.highlightedLayer();
    return highlighted?.topic === this.result().topic ? highlighted.layer : undefined;
  });

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
        tableSections: tableSections.map((section, sectionIndex) => ({
          ...section,
          data: {
            ...section.data,
            headers: section.data.headers.map((header, headerIndex) => ({
              ...header,
              showMarking: sectionIndex === 0 && headerIndex === 0,
            })),
          },
          tableLabel: `Statistik zu ${layer.title}${section.title !== undefined ? `: ${section.title}` : ''}`,
        })),
      };
    }),
  );

  public highlightLayer(layer: StatisticsResultLayer) {
    if (this.showInteractiveElements() && layer.featureGeometry && this.highlightedLayerName() !== layer.layer) {
      this.store.dispatch(StatisticsActions.highlightLayer({topic: this.result().topic, layer: layer.layer}));
    }
  }

  public toggleLayerHighlight(layer: StatisticsResultLayer) {
    if (!this.showInteractiveElements() || !layer.featureGeometry) {
      return;
    }
    if (this.highlightedLayerName() === layer.layer) {
      this.store.dispatch(StatisticsActions.clearHighlight());
    } else {
      this.highlightLayer(layer);
    }
  }
}
