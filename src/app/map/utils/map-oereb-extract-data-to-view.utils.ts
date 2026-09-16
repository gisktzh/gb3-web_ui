import {NotConcernedTheme} from 'src/app/shared/models/gb3-api-generated.interfaces';
import {TableCell, TextTableCell, UrlTableCell} from '../components/feature-info-overlay/feature-info-content/info-table-cell.component';
import {OerebConcernedTheme, OerebExtractValue} from 'src/app/shared/interfaces/oereb-extract.interface';
import {OerebExtractListItem} from '../types/oereb-extract-list-item.type';
import {OerebExtractTheme} from '../interfaces/oereb-extract-theme.interface';
import {TableData} from '../components/feature-info-overlay/feature-info-content/resizable-info-table.component';

export class MapOerebExtractDataToView {
  public static mapOerebExtractApiThemeToDisplayableTheme(theme: OerebConcernedTheme): OerebExtractTheme {
    return {
      name: theme.name,
      generalInfo: [
        {
          displayValue: 'Gesetzliche Grundlagen',
          itemType: 'list' as const,
          items: theme.legalProvisions.map<OerebExtractListItem>((i) => MapOerebExtractDataToView.mapOerebExtractValueToListItem(i)),
        },
        {
          displayValue: 'Rechtsvorschriften',
          itemType: 'list' as const,
          items: theme.laws.map<OerebExtractListItem>((i) => MapOerebExtractDataToView.mapOerebExtractValueToListItem(i)),
        },
        {
          displayValue: 'Weitere Hinweise',
          itemType: 'list' as const,
          items: theme.hints.map<OerebExtractListItem>((i) => MapOerebExtractDataToView.mapOerebExtractValueToListItem(i)),
        },
        {
          displayValue: 'Zuständige Stellen',
          itemType: 'list' as const,
          items: theme.responsibleOffices.map<OerebExtractListItem>((i) => MapOerebExtractDataToView.mapOerebExtractValueToListItem(i)),
        },
      ].filter((i) => i.items.length > 0),
      restrictions: theme.restrictions.map((r) => {
        const items: OerebExtractListItem[] = [];

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
                displayValue: `${r.measurement.lineLength}m`,
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
    };
  }

  public static mapOerebExtractValueToListItem(item: OerebExtractValue): OerebExtractListItem {
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

  public static mapNotConcernedThemesToTableData(themes: NotConcernedTheme[]): TableData {
    const tableRows = new Map<string, TableCell[]>();

    themes.forEach((t) => {
      tableRows.set(t.name, [
        {
          displayValue: '',
          cellType: 'list',
          items: t.hints.map<UrlTableCell | TextTableCell>((h) => {
            if ('href' in h) {
              return {
                cellType: 'url',
                displayValue: h.title,
                url: h.href,
              };
            }

            return {
              cellType: 'text',
              displayValue: h.title,
            };
          }),
        },
      ]);
    });

    return {
      tableRows,
    };
  }
}
