import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {OerebExtractResponse} from 'src/app/shared/interfaces/oereb-extract.interface';
import {MapOverlayListItemComponent} from '../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {MatIcon} from '@angular/material/icon';
import {ResizableInfoTableComponent, TableData} from '../feature-info-content/resizable-info-table.component';
import {TableCell} from '../feature-info-content/info-table-cell.component';
import {MatButton} from '@angular/material/button';
import {OerebExtractTheme} from 'src/app/map/interfaces/oereb-extract-theme.interface';
import {MapOerebExtractDataToView} from 'src/app/map/utils/map-oereb-extract-data-to-view.utils';

@Component({
  selector: 'oereb-extract',
  templateUrl: './oereb-extract.component.html',
  styleUrls: ['./oereb-extract.component.scss'],
  imports: [MapOverlayListItemComponent, MatIcon, MatButton, ResizableInfoTableComponent],
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
          'ÖREB-Kataster',
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
          'Email ÖREB',
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
    return MapOerebExtractDataToView.mapNotConcernedThemesToTableData(this.data().notConcernedThemes);
  });

  public readonly notAvailableThemes = computed(() => {
    return MapOerebExtractDataToView.mapNotConcernedThemesToTableData(this.data().notAvailableThemes);
  });
}
