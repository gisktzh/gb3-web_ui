import {NotConcernedTheme} from 'src/app/shared/models/gb3-api-generated.interfaces';
import {OerebConcernedTheme, OerebExtractValue} from 'src/app/shared/interfaces/oereb-extract.interface';
import {OerebExtractListItem} from '../types/oereb-extract-list-item.type';
import {OerebExtractTheme} from '../interfaces/oereb-extract-theme.interface';

export class MapOerebExtractDataToView {
  public static mapOerebExtractApiThemeToDisplayableTheme(theme: OerebConcernedTheme): OerebExtractTheme {
    const themeHints = theme.hints.map<OerebExtractListItem>((i) => MapOerebExtractDataToView.mapOerebExtractValueToListItem(i));

    return {
      name: theme.name,
      generalInfo: {
        itemLabel: 'Allgemeine Informationen',
        itemType: 'list' as const,
        items: [
          {
            itemLabel: 'Gesetzliche Grundlagen',
            itemType: 'list' as const,
            items: theme.laws.map<OerebExtractListItem>((i) => MapOerebExtractDataToView.mapOerebExtractValueToListItem(i)),
          },
          {
            itemLabel: 'Rechtsvorschriften',
            itemType: 'list' as const,
            items: theme.legalProvisions.map<OerebExtractListItem>((i) => MapOerebExtractDataToView.mapOerebExtractValueToListItem(i)),
          },
          {
            itemLabel: 'Weitere Hinweise',
            itemType: 'list' as const,
            items:
              themeHints.length > 0
                ? themeHints
                : [
                    {
                      itemLabel: 'Keine weiteren Hinweise',
                      text: 'Keine weiteren Hinweise',
                      itemType: 'text' as const,
                    },
                  ],
          },
          {
            itemLabel: 'Zuständige Stellen',
            itemType: 'list' as const,
            items: theme.responsibleOffices.map<OerebExtractListItem>((i) => MapOerebExtractDataToView.mapOerebExtractValueToListItem(i)),
          },
        ],
      },
      restrictions: theme.restrictions.map((r) => {
        const items: OerebExtractListItem[] = [];

        items.push({
          itemLabel: 'Rechtsstatus',
          itemType: 'text' as const,
          text: r.legalStatus,
        });

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

  public static mapNotConcernedThemesToListData(themes: NotConcernedTheme[]): OerebExtractListItem[] {
    return themes.map((theme) => {
      if (theme.hints.length === 0) {
        return {
          itemLabel: theme.name,
          text: theme.name,
          itemType: 'text',
        };
      }

      return {
        itemLabel: theme.name,
        itemType: 'list',
        items: theme.hints.map((hint) => MapOerebExtractDataToView.mapOerebExtractValueToListItem(hint)),
      };
    });
  }
}
