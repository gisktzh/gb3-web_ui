import {ChangeDetectionStrategy, Component, computed, inject, input, LOCALE_ID, OnDestroy, ViewEncapsulation} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {StatisticsResult, StatisticsResultLayer} from '../../../../shared/interfaces/statistics.interface';
import {Store} from '@ngrx/store';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {StatisticsActions} from '../../../../state/map/actions/statistics.actions';
import {selectHighlightedLayer, selectPinnedLayer} from '../../../../state/map/reducers/statistics.reducer';
import {queryResultStatusTexts} from '../../../../shared/configs/query-result-status.config';
import {MapOverlayListItemComponent} from '../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {ResizableInfoTableComponent} from '../info-table/resizable-info-table.component';
import {mapStatisticsDataToView} from '../../../utils/map-statistics-data-to-view.utils';
import {InfoTableCellComponent} from '../info-table/info-table-cell.component';
import {ResultMarkingController} from '../info-table/result-marking.controller';
import {MAP_SERVICE} from '../../../../app.tokens';
import {MapService} from '../../../interfaces/map.service';

@Component({
  selector: 'statistics-item',
  templateUrl: './statistics-item.component.html',
  styleUrls: ['./statistics-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
  imports: [MapOverlayListItemComponent, MatIcon, ResizableInfoTableComponent, MatRadioButton, MatRadioGroup, InfoTableCellComponent],
})
export class StatisticsItemComponent implements OnDestroy {
  private readonly decimalPipe = new DecimalPipe(inject(LOCALE_ID));
  private readonly store = inject(Store);
  private readonly mapService = inject<MapService>(MAP_SERVICE);

  public readonly result = input.required<StatisticsResult>();
  public readonly showInteractiveElements = input(true);
  public readonly highlightedLayer = this.store.selectSignal(selectHighlightedLayer);
  public readonly pinnedLayer = this.store.selectSignal(selectPinnedLayer);
  public readonly highlightedLayerName = computed(() => {
    const highlighted = this.highlightedLayer();
    return highlighted?.topic === this.result().topic ? highlighted.layer : undefined;
  });
  public readonly pinnedLayerName = computed(() => {
    const pinned = this.pinnedLayer();
    return pinned?.topic === this.result().topic ? pinned.layer : undefined;
  });
  public readonly marking = new ResultMarkingController<StatisticsResultLayer>({
    enabled: () => this.showInteractiveElements(),
    canMark: (layer) => !!layer.featureGeometry,
    hasPinned: () => this.pinnedLayer() !== undefined,
    isPinned: (layer) => this.pinnedLayerName() === layer.layer,
    preview: (layer) => this.store.dispatch(StatisticsActions.hoverLayer({topic: this.result().topic, layer: layer.layer})),
    clearPreview: () => this.store.dispatch(StatisticsActions.clearHover()),
    pin: (layer) => {
      if (!layer.featureGeometry) {
        return;
      }
      this.store.dispatch(StatisticsActions.highlightLayer({topic: this.result().topic, layer: layer.layer}));
      this.mapService.zoomToExtent(layer.featureGeometry);
    },
    unpin: () => this.store.dispatch(StatisticsActions.clearHighlight()),
  });
  public readonly hoverEnabled = this.marking.hoverEnabled;

  public readonly layerViews = computed(() =>
    this.result().layers.map((layer) => {
      const statusText = layer.status === 'ok' ? undefined : queryResultStatusTexts[layer.status];
      const tableSections =
        layer.status === 'ok'
          ? mapStatisticsDataToView(layer, (value) => this.decimalPipe.transform(value, '1.0-2') ?? value.toString())
          : [];
      const tableLabel = `Statistik zu ${layer.title}`;

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
          tableLabel: section.title === undefined ? tableLabel : `${tableLabel}: ${section.title}`,
        })),
      };
    }),
  );

  public toggleLayerHighlight(layer: StatisticsResultLayer) {
    this.marking.toggle(layer);
  }

  public onLayerHoverStart(layer: StatisticsResultLayer) {
    this.marking.hoverStart(layer);
  }

  public onLayerHoverEnd() {
    this.marking.hoverEnd();
  }

  public ngOnDestroy() {
    this.marking.destroy();
  }
}
