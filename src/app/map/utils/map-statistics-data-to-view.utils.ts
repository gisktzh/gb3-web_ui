import {StatisticsResultLayer, StatisticsResultRow} from '../../shared/interfaces/statistics.interface';
import {TableData, TableHeader, TableRow, TextTableCell} from '../components/feature-info-overlay/info-table/info-table.types';

export interface StatisticsTableSection {
  title?: string;
  data: TableData;
}

export type StatisticsNumberFormatter = (value: number) => string;

const NULL_VALUE_PLACEHOLDER = '–';

function mapHeaders(columns: string[]): TableHeader[] {
  return columns.map((displayValue) => ({displayValue}));
}

function mapRow(row: StatisticsResultRow, columnCount: number, formatNumber: StatisticsNumberFormatter): TableRow {
  return {
    label: row.label,
    cells: Array.from({length: columnCount}, (_, columnIndex): TextTableCell => {
      const resultValue = row.values[columnIndex];

      return {
        cellType: 'text',
        displayValue:
          !resultValue || resultValue.value === null
            ? NULL_VALUE_PLACEHOLDER
            : `${formatNumber(resultValue.value)}${resultValue.unit ? ` ${resultValue.unit}` : ''}`,
      };
    }),
  };
}

/**
 * Splits the flat statistics API response into tables. Group-header rows start a named table and are not rendered as data rows.
 * Rows before the first group header remain in an untitled table so the API order and all data are preserved.
 */
export function mapStatisticsDataToView(layer: StatisticsResultLayer, formatNumber: StatisticsNumberFormatter): StatisticsTableSection[] {
  const headers = mapHeaders(layer.columns);
  const sections: StatisticsTableSection[] = [];
  let currentSection: StatisticsTableSection | undefined;

  for (const row of layer.rows) {
    if (row.isGroupHeader) {
      currentSection = {
        title: row.label,
        data: {headers, rows: []},
      };
      sections.push(currentSection);
      continue;
    }

    if (!currentSection) {
      currentSection = {data: {headers, rows: []}};
      sections.push(currentSection);
    }

    currentSection.data.rows.push(mapRow(row, headers.length, formatNumber));
  }

  return sections;
}
