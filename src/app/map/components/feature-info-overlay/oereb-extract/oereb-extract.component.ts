import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {OerebExtractResponse, OerebExtractValue} from 'src/app/shared/interfaces/oereb-extract.interface';
import {MapOverlayListItemComponent} from '../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {MatIcon} from '@angular/material/icon';
import {ResizableInfoTableComponent, TableData} from '../feature-info-content/resizable-info-table.component';
import {TableCell, TextTableCell, UrlTableCell} from '../feature-info-content/info-table-cell.component';
import {NotConcernedTheme} from 'src/app/shared/models/gb3-api-generated.interfaces';
import {MatButton} from '@angular/material/button';

type ListItem = {displayValue: string} & (
  | {itemType: 'text'}
  | {itemType: 'url'; url: string}
  | {itemType: 'list'; items: ListItem[]}
  | {itemType: 'image'; url: string; src: string; alt: string; width: number; height: number}
);

interface Theme {
  name: string;
  generalInfo: ListItem[];
  restrictions: ListItem[];
}

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
    } as TableData;
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
    } as TableData;
  });

  public readonly staticExtractUrl = computed<string>(() => this.data().staticExtractUrl);

  public readonly concernedThemes = computed<Theme[]>(() => {
    return this.data().concernedThemes.map((theme) => ({
      name: theme.name,
      generalInfo: [
        {
          displayValue: 'Gesetzliche Grundlagen',
          itemType: 'list' as const,
          items: theme.legalProvisions.map<ListItem>((i) => this.mapOerebExtractValueToListItem(i)),
        },
        {
          displayValue: 'Rechtsvorschriften',
          itemType: 'list' as const,
          items: theme.laws.map<ListItem>((i) => this.mapOerebExtractValueToListItem(i)),
        },
        {
          displayValue: 'Weitere Hinweise',
          itemType: 'list' as const,
          items: theme.hints.map<ListItem>((i) => this.mapOerebExtractValueToListItem(i)),
        },
        {
          displayValue: 'Zuständige Stellen',
          itemType: 'list' as const,
          items: theme.resonsibleOffices.map<ListItem>((i) => this.mapOerebExtractValueToListItem(i)),
        },
      ].filter((i) => i.items.length > 0),
      restrictions: theme.restrictions.map((r) => {
        const items: ListItem[] = [];

        if (r.illustration) {
          items.push({
            displayValue: 'Darstellung',
            itemType: 'list' as const,
            items: [
              {
                displayValue: r.illustration.alt,
                itemType: 'image' as const,
                url: r.illustration.url.href,
                src: r.illustration.src.href,
                alt: r.illustration.alt,
                width: 23,
                height: 13,
              },
            ],
          });
        }

        if ('areaM2' in r.measurement) {
          items.push({
            displayValue: 'Fläche',
            itemType: 'list' as const,
            items: [
              {
                displayValue: `${r.measurement.areaM2}m2`,
                itemType: 'text' as const,
              },
            ],
          });

          items.push({
            displayValue: 'Anteil',
            itemType: 'list' as const,
            items: [
              {
                displayValue: `${Math.round(r.measurement.percentage * 100)}%`,
                itemType: 'text' as const,
              },
            ],
          });
        } else if ('lineLength' in r.measurement) {
          items.push({
            displayValue: 'Länge',
            itemType: 'list' as const,
            items: [
              {
                displayValue: `${r.measurement.lineLength}m2`,
                itemType: 'text' as const,
              },
            ],
          });
        } else {
          items.push({
            displayValue: 'Anzahl Punkte',
            itemType: 'list' as const,
            items: [
              {
                displayValue: r.measurement.pointsCount.toString(),
                itemType: 'text' as const,
              },
            ],
          });
        }

        return {
          displayValue: r.name,
          itemType: 'list' as const,
          items,
        };
      }),
    }));
  });

  public readonly notConcernedThemes = computed(() => {
    return this.mapNotConcernedThemesToTableData(this.data().notConcernedThemes);
  });

  public readonly notAvailableThemes = computed(() => {
    return this.mapNotConcernedThemesToTableData(this.data().notAvailableThemes);
  });

  private mapOerebExtractValueToListItem(item: OerebExtractValue): ListItem {
    if (item.href) {
      return {
        displayValue: item.title,
        itemType: 'url',
        url: item.href,
      };
    }

    return {
      displayValue: item.title,
      itemType: 'text',
    };
  }

  private mapNotConcernedThemesToTableData(themes: NotConcernedTheme[]): TableData {
    const tableRows = new Map<string, TableCell[]>();

    themes.forEach((t) => {
      tableRows.set(t.name, [
        {
          displayValue: '',
          cellType: 'list',
          items: t.hints.map<UrlTableCell | TextTableCell>(
            (h) =>
              ({
                fid: 1,
                cellType: 'href' in h ? 'url' : 'text',
                displayValue: h.title,
                url: 'href' in h ? h.href : undefined,
              }) as UrlTableCell | TextTableCell,
          ),
        },
      ]);
    });

    return {
      tableRows,
    } as TableData;
  }
}
