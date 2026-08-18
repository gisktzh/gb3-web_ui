import {Component, computed, input} from '@angular/core';
import {OerebExtractResponse} from 'src/app/shared/interfaces/oereb-extract.interface';
import {MapOverlayListItemComponent} from '../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {MatIcon} from '@angular/material/icon';
import {ResizableInfoTableComponent, TableData} from '../feature-info-content/resizable-info-table.component';
import {ListTableCell, TableCell, TextTableCell, UrlTableCell} from '../feature-info-content/info-table-cell.component';
import {NotConcernedTheme} from 'src/app/shared/models/gb3-api-generated.interfaces';

@Component({
  selector: 'oereb-extract',
  templateUrl: './oereb-extract.component.html',
  styleUrls: ['./oereb-extract.component.scss'],
  imports: [MapOverlayListItemComponent, MatIcon, ResizableInfoTableComponent],
})
export class OerebExtractComponent {
  public readonly data = input.required<OerebExtractResponse>();

  public readonly oerebCadastreData = computed<TableData>(() => {
    const tableRows = new Map<string, TableCell[]>();
    tableRows.set('Gemeinde', [
      {
        fid: 1,
        displayValue: this.data().municipalityName,
        cellType: 'text',
      },
    ]);

    tableRows.set('BFS-Nr.', [
      {
        fid: 2,
        displayValue: this.data().municipalityCode.toString(),
        cellType: 'text',
      },
    ]);

    tableRows.set('Grundstück-Nr.', [
      {
        fid: 3,
        displayValue: this.data().parcelNumber,
        cellType: 'text',
      },
    ]);

    tableRows.set('EGRIS_EGRID', [
      {
        fid: 4,
        displayValue: this.data().egrid,
        cellType: 'text',
      },
    ]);

    return {
      tableHeaders: [
        {
          displayValue: 'Info',
          hasGeometry: false,
        },
      ],
      tableRows,
    } as TableData;
  });

  public readonly kboAndSurveyorData = computed<TableData>(() => {
    const tableRows = new Map<string, TableCell[]>();

    const kbo = this.data().kbo;
    const surveyor = this.data().surveyor;

    tableRows.set('ÖREB-Kataster', [
      kbo.href
        ? {
            fid: 5,
            displayValue: kbo.title,
            cellType: 'url',
            url: kbo.href,
          }
        : {
            fid: 5,
            displayValue: kbo.title,
            cellType: 'text',
          },
    ]);

    tableRows.set('Email ÖREB', [
      surveyor.href
        ? {
            fid: 5,
            displayValue: surveyor.title,
            cellType: 'url',
            url: surveyor.href,
          }
        : {
            fid: 5,
            displayValue: surveyor.title,
            cellType: 'text',
          },
    ]);

    return {
      tableHeaders: [
        {
          displayValue: 'Info',
          hasGeometry: false,
        },
      ],
      tableRows,
    } as TableData;
  });

  public readonly concernedThemes = computed(() => {
    return this.data().concernedThemes.map((theme) => {
      const generalInfoRows = new Map<string, TableCell[]>();
      generalInfoRows.set('Gesetzliche Grundlagen', [
        {
          cellType: 'list',
          items: theme.legalProvisions.map<UrlTableCell | TextTableCell>(
            (l) =>
              ({
                fid: 1,
                cellType: l.href ? 'url' : 'text',
                displayValue: l.title,
                url: l.href,
              }) as UrlTableCell | TextTableCell,
          ),
        } as ListTableCell,
      ]);

      generalInfoRows.set('Rechtsvorschriften', [
        {
          cellType: 'list',
          items: theme.laws.map<UrlTableCell | TextTableCell>(
            (l) =>
              ({
                fid: 1,
                cellType: l.href ? 'url' : 'text',
                displayValue: l.title,
                url: l.href,
              }) as UrlTableCell | TextTableCell,
          ),
        } as ListTableCell,
      ]);

      generalInfoRows.set('Weitere Hinweise', [
        {
          cellType: 'list',
          items: theme.hints.map<UrlTableCell | TextTableCell>(
            (l) =>
              ({
                fid: 1,
                cellType: l.href ? 'url' : 'text',
                displayValue: l.title,
                url: l.href,
              }) as UrlTableCell | TextTableCell,
          ),
        } as ListTableCell,
      ]);

      generalInfoRows.set('Zuständige Stellen', [
        {
          cellType: 'list',
          items: theme.resonsibleOffices.map<UrlTableCell | TextTableCell>(
            (l) =>
              ({
                fid: 1,
                cellType: l.href ? 'url' : 'text',
                displayValue: l.title,
                url: l.href,
              }) as UrlTableCell | TextTableCell,
          ),
        } as ListTableCell,
      ]);

      const restrictions = theme.restrictions.map((r) => {
        const restrictionRows = new Map<string, TableCell[]>();

        if (r.illustration) {
          restrictionRows.set('Darstellung', [
            {
              fid: 1,
              cellType: 'image',
              url: r.illustration.url.href,
              src: r.illustration.src.href,
              alt: r.illustration.alt,
              displayValue: r.illustration.alt,
              width: 23,
              height: 13,
            },
          ]);
        }

        if ('areaM2' in r.measurement) {
          restrictionRows.set('Fläche', [
            {
              fid: 1,
              cellType: 'text',
              displayValue: `${r.measurement.areaM2}m2`,
            },
          ]);
          restrictionRows.set('Anteil', [
            {
              fid: 1,
              cellType: 'text',
              displayValue: `${Math.round(r.measurement.percentage * 100)}%`,
            },
          ]);
        } else if ('lineLength' in r.measurement) {
          restrictionRows.set('Länge', [
            {
              fid: 1,
              cellType: 'text',
              displayValue: `${r.measurement.lineLength}m`,
            },
          ]);
        } else {
          restrictionRows.set('Anzahl Punkte', [
            {
              fid: 1,
              cellType: 'text',
              displayValue: r.measurement.pointsCount.toString(),
            },
          ]);
        }

        return {
          name: r.name,
          data: {
            tableHeaders: [
              {
                displayValue: 'Info',
                hasGeometry: false,
              },
            ],
            tableRows: restrictionRows,
          } as TableData,
        };
      });

      return {
        name: theme.name,
        generalInfo: {
          tableHeaders: [
            {
              displayValue: 'Info',
              hasGeometry: false,
            },
          ],
          tableRows: generalInfoRows,
        } as TableData,
        restrictions,
      };
    });
  });

  public readonly notConcernedThemes = computed(() => {
    return this.mapNotConcernedThemesToTableData(this.data().notConcernedThemes);
  });

  public readonly notAvailableThemes = computed(() => {
    return this.mapNotConcernedThemesToTableData(this.data().notAvailableThemes);
  });

  private mapNotConcernedThemesToTableData(themes: NotConcernedTheme[]): TableData {
    const tableRows = new Map<string, TableCell[]>();

    themes.forEach((t) => {
      tableRows.set(t.name, [
        {
          fid: 1,
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
      tableHeaders: [
        {
          displayValue: 'Info',
          hasGeometry: false,
        },
      ],
      tableRows,
    } as TableData;
  }
}
