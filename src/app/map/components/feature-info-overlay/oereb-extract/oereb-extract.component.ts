import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {OerebExtractResponse} from 'src/app/shared/interfaces/oereb-extract.interface';
import {MapOverlayListItemComponent} from '../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {MatIcon} from '@angular/material/icon';
import {ResizableInfoTableComponent, TableData} from '../feature-info-content/resizable-info-table.component';
import {TableCell} from '../feature-info-content/info-table-cell.component';
import {MatButton} from '@angular/material/button';
import {OerebExtractTheme} from 'src/app/map/interfaces/oereb-extract-theme.interface';
import {MapOerebExtractDataToView} from 'src/app/map/utils/map-oereb-extract-data-to-view.utils';
import {OerebInfoListMapOverlayComponent} from './oereb-info-list/oereb-info-list-map-overlay.component';
import {formatDateValue} from 'src/app/shared/utils/feature-info-field.utils';
import {OerebNotConcernedThemesList} from './oereb-not-concerned-themes-list/oereb-not-concerned-themes-list.component';

@Component({
  selector: 'oereb-extract',
  templateUrl: './oereb-extract.component.html',
  styleUrls: ['./oereb-extract.component.scss'],
  imports: [
    MapOverlayListItemComponent,
    MatIcon,
    MatButton,
    ResizableInfoTableComponent,
    OerebInfoListMapOverlayComponent,
    OerebNotConcernedThemesList,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class OerebExtractComponent {
  public readonly data = input.required<OerebExtractResponse>();

  public readonly oerebCadastreData = computed<TableData>(() => {
    return {
      tableRows: new Map<string, TableCell[]>(
        [
          ['Gemeinde', this.data().municipalityName],
          ['BFS-Nr.', this.data().municipalityCode.toString()],
          ['Grundstück-Nr.', this.data().parcelNumber],
          ['EGRIS_EGRID', this.data().egrid],
          ['Vollständigkeit', this.data().completeness],
          ['Fläche [m²]', this.data().area.toString()],
          ['Stand der Amtlichen Vermessung', formatDateValue(this.data().statusOfficialSurvey)],
        ].map(([l, v]) => [
          l,
          [
            {
              displayValue: v,
              cellType: 'text',
            },
          ],
        ]),
      ),
    };
  });

  public readonly kboAndSurveyorData = computed<TableData>(() => {
    const kbo = this.data().kbo;
    const surveyor = this.data().surveyor;

    return {
      tableRows: new Map<string, TableCell[]>([
        [
          'Zuständige Nachführungsstelle ÖREB-Kataster',
          [
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
        ],
        [
          'Zuständige Stelle Amtliche Vermessung',
          [
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
        ],
      ]),
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
}
