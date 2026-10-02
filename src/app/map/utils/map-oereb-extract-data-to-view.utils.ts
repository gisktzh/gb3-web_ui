import {NotConcernedTheme} from 'src/app/shared/models/gb3-api-generated.interfaces';
import {TableData, TextTableCell, UrlTableCell} from '../components/feature-info-overlay/info-table/info-table.types';
import {OerebConcernedTheme, OerebExtractValue} from 'src/app/shared/interfaces/oereb-extract.interface';
import {OerebExtractListItem} from '../types/oereb-extract-list-item.type';
import {OerebExtractTheme} from '../interfaces/oereb-extract-theme.interface';

export class MapOerebExtractDataToView {
  public static mapOerebExtractApiThemeToDisplayableTheme(theme: OerebConcernedTheme): OerebExtractTheme {
    return {
      name: theme.name,
      generalInfo: {
        itemLabel: 'Allgemeine Informationen',
        itemType: 'list' as const,
        items: [
          {
            itemLabel: 'Gesetzliche Grundlagen',
            itemType: 'list' as const,
            items: theme.legalProvisions.map<OerebExtractListItem>((i) => MapOerebExtractDataToView.mapOerebExtractValueToListItem(i)),
          },
          {
            itemLabel: 'Rechtsvorschriften',
            itemType: 'list' as const,
            items: theme.laws.map<OerebExtractListItem>((i) => MapOerebExtractDataToView.mapOerebExtractValueToListItem(i)),
          },
          {
            itemLabel: 'Weitere Hinweise',
            itemType: 'list' as const,
            items: theme.hints.map<OerebExtractListItem>((i) => MapOerebExtractDataToView.mapOerebExtractValueToListItem(i)),
          },
          {
            itemLabel: 'Zuständige Stellen',
            itemType: 'list' as const,
            items: theme.responsibleOffices.map<OerebExtractListItem>((i) => MapOerebExtractDataToView.mapOerebExtractValueToListItem(i)),
          },
        ].filter((i) => i.items.length > 0),
      },
      restrictions: theme.restrictions.map((r) => {
        const items: OerebExtractListItem[] = [];

        if (r.illustration) {
          items.push({
            itemLabel: 'Darstellung',
            itemType: 'image' as const,
            url: r.illustration.url.href,
            src: r.illustration.src.href,
            alt: r.illustration.alt,
            width: 23,
            height: 13,
          });
        }

        if ('areaM2' in r.measurement) {
          items.push({
            itemLabel: 'Fläche',
            itemType: 'text' as const,
            text: `${r.measurement.areaM2}m2`,
          });

          items.push({
            itemLabel: 'Anteil',
            itemType: 'text' as const,
            text: `${Math.round(r.measurement.percentage * 100)}%`,
          });
        } else if ('lineLength' in r.measurement) {
          items.push({
            itemLabel: 'Länge',
            itemType: 'text' as const,
            text: `${r.measurement.lineLength}m`,
          });
        } else {
          items.push({
            itemLabel: 'Anzahl Punkte',
            itemType: 'text' as const,
            text: r.measurement.pointsCount.toString(),
          });
        }

        return {
          itemLabel: r.name,
          itemType: 'list' as const,
          items,
        };
      }),
    };
  }

  public static mapOerebExtractValueToListItem(item: OerebExtractValue): OerebExtractListItem {
    if (item.href) {
      return {
        itemLabel: item.title,
        itemType: 'url',
        url: item.href,
      };
    }

    return {
      itemLabel: item.title,
      text: item.title,
      itemType: 'text',
    };
  }

  public static mapNotConcernedThemesToTableData(themes: NotConcernedTheme[]): TableData {
    return {
      headers: [],
      rows: themes.map((theme) => ({
        label: theme.name,
        cells: [
          {
            displayValue: '',
            cellType: 'list',
            items: theme.hints.map<UrlTableCell | TextTableCell>((hint) => {
              if ('href' in hint) {
                return {
                  cellType: 'url',
                  displayValue: hint.title,
                  url: hint.href,
                };
              }

              return {
                cellType: 'text',
                displayValue: hint.title,
              };
            }),
          },
        ],
      })),
    };
  }
}
