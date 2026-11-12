import {ChangeDetectionStrategy, Component, computed, inject, input, OnDestroy, ViewEncapsulation} from '@angular/core';
import {OerebExtractResponse} from 'src/app/shared/interfaces/oereb-extract.interface';
import {MapOverlayListItemComponent} from '../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {MatIcon} from '@angular/material/icon';
import {ResizableInfoTableComponent} from '../info-table/resizable-info-table.component';
import {TableData} from '../info-table/info-table.types';
import {MatButton} from '@angular/material/button';
import {OerebExtractTheme} from 'src/app/map/interfaces/oereb-extract-theme.interface';
import {MapOerebExtractDataToView} from 'src/app/map/utils/map-oereb-extract-data-to-view.utils';
import {OerebInfoListMapOverlayComponent} from './oereb-info-list/oereb-info-list-map-overlay.component';
import {formatDateValue} from 'src/app/shared/utils/feature-info-field.utils';
import {OerebNotConcernedThemesList} from './oereb-not-concerned-themes-list/oereb-not-concerned-themes-list.component';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {ResultMarkingController} from '../info-table/result-marking.controller';
import {MapService} from 'src/app/map/interfaces/map.service';
import {MAP_SERVICE} from 'src/app/app.tokens';
import {Store} from '@ngrx/store';
import {selectPinnedFeatureId} from 'src/app/state/map/reducers/feature-info.reducer';
import {InfoTableCellComponent} from '../info-table/info-table-cell.component';
import {FeatureInfoActions} from 'src/app/state/map/actions/feature-info.actions';

@Component({
  selector: 'oereb-extract',
  templateUrl: './oereb-extract.component.html',
  styleUrls: ['./oereb-extract.component.scss'],
  imports: [
    MapOverlayListItemComponent,
    MatIcon,
    MatButton,
    MatRadioButton,
    MatRadioGroup,
    ResizableInfoTableComponent,
    OerebInfoListMapOverlayComponent,
    OerebNotConcernedThemesList,
    InfoTableCellComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class OerebExtractComponent implements OnDestroy {
  public readonly data = input.required<OerebExtractResponse>();
  private readonly store = inject(Store);
  private readonly mapService = inject<MapService>(MAP_SERVICE);
  public readonly pinnedFeatureId = this.store.selectSignal(selectPinnedFeatureId);

  public readonly marking = new ResultMarkingController<'oereb_extract_feature'>({
    enabled: () => true,
    canMark: () => true,
    hasPinned: () => this.pinnedFeatureId() !== undefined,
    isPinned: () => this.pinnedFeatureId() === 'oereb_extract_feature',
    preview: () => this.highlightGeometry(),
    clearPreview: () => this.store.dispatch(FeatureInfoActions.clearHighlight()),
    pin: () => this.highlightGeometry(true, true),
    unpin: () => this.store.dispatch(FeatureInfoActions.clearHighlight()),
  });
  public readonly hoverEnabled = this.marking.hoverEnabled;
  public readonly geometry = computed(() => this.data().parcel);
  public readonly isHighlighted = computed(
    () => this.pinnedFeatureId() === 'oereb_extract_feature' || this.marking.hoveredKey() === 'oereb_extract_feature',
  );

  public readonly oerebCadastreData = computed<TableData>(() => {
    return {
      headers: [{displayValue: 'Resultat'}],
      rows: [
        ['Gemeinde', this.data().municipalityName],
        ['BFS-Nr.', this.data().municipalityCode.toString()],
        ['Grundstück-Nr.', this.data().parcelNumber],
        ['EGRIS_EGRID', this.data().egrid],
        ['Vollständigkeit', this.data().completeness],
        ['Fläche [m²]', this.data().area.toString()],
        ['Stand der Amtlichen Vermessung', formatDateValue(this.data().statusOfficialSurvey)],
      ].map(([label, value]) => ({
        label,
        cells: [
          {
            displayValue: value,
            cellType: 'text',
          },
        ],
      })),
    };
  });

  public readonly kboAndSurveyorData = computed<TableData>(() => {
    const kbo = this.data().kbo;
    const surveyor = this.data().surveyor;

    return {
      headers: [],
      rows: [
        {
          label: 'Zuständige Nachführungsstelle ÖREB-Kataster',
          cells: [
            kbo.href
              ? {
                  displayValue: kbo.title,
                  cellType: 'url',
                  url: kbo.href,
                }
              : {
                  displayValue: kbo.title,
                  cellType: 'text',
                },
          ],
        },
        {
          label: 'Zuständige Stelle Amtliche Vermessung',
          cells: [
            surveyor.href
              ? {
                  displayValue: surveyor.title,
                  cellType: 'url',
                  url: surveyor.href,
                }
              : {
                  displayValue: surveyor.title,
                  cellType: 'text',
                },
          ],
        },
      ],
    };
  });

  public readonly staticExtractUrl = computed<string>(() => this.data().staticExtractUrl);

  public readonly concernedThemes = computed<OerebExtractTheme[]>(() => {
    return this.data().concernedThemes.map(MapOerebExtractDataToView.mapOerebExtractApiThemeToDisplayableTheme);
  });

  public readonly notConcernedThemes = computed(() => {
    return MapOerebExtractDataToView.mapNotConcernedThemesToListData(this.data().notConcernedThemes);
  });

  public readonly notAvailableThemes = computed(() => {
    return MapOerebExtractDataToView.mapNotConcernedThemesToListData(this.data().notAvailableThemes);
  });

  public toggleHighlightForFeature() {
    this.marking.toggle('oereb_extract_feature');
  }

  private highlightGeometry(zoomToFeature: boolean = false, shouldPin: boolean = false) {
    const feature = this.geometry();
    this.store.dispatch(
      FeatureInfoActions.highlightFeature({
        feature,
        source: {sourceType: 'oereb_extract', mapItemId: null, layerName: null},
        pinnedFeatureId: shouldPin ? 'oereb_extract_feature' : undefined,
      }),
    );

    if (zoomToFeature) {
      this.mapService.zoomToExtent(feature);
    }
  }

  public onFeatureHoverStart() {
    this.marking.hoverStart('oereb_extract_feature');
  }

  public onFeatureHoverEnd() {
    this.marking.hoverEnd();
  }

  public onResizeHandlerResizeEnd() {
    this.marking.endResize();
  }

  public onResizeHandlerResizeStart() {
    this.marking.startResize();
  }

  public ngOnDestroy() {
    this.marking.destroy();
  }
}
