import {describe, expect, it, vi} from 'vitest';
import {StatisticsResultLayer} from '../../shared/interfaces/statistics.interface';
import {mapStatisticsDataToView} from './map-statistics-data-to-view.utils';

function createLayer(overrides: Partial<StatisticsResultLayer> = {}): StatisticsResultLayer {
  return {
    layer: 'test-layer',
    title: 'Test layer',
    columns: ['Summe'],
    rows: [],
    status: 'ok',
    ...overrides,
  };
}

describe('mapStatisticsDataToView', () => {
  it('maps ungrouped rows to one untitled table and preserves duplicate labels', () => {
    const formatNumber = vi.fn((value: number) => `formatted-${value}`);
    const layer = createLayer({
      columns: ['2025', '2026'],
      rows: [
        {
          label: 'Duplicate',
          isGroupHeader: false,
          values: [
            {value: 1, unit: null},
            {value: 2.5, unit: 'ha'},
          ],
        },
        {
          label: 'Duplicate',
          isGroupHeader: false,
          values: [
            {value: null, unit: null},
            {value: 0, unit: '%'},
          ],
        },
      ],
    });

    expect(mapStatisticsDataToView(layer, formatNumber)).toEqual([
      {
        data: {
          headers: [{displayValue: '2025'}, {displayValue: '2026'}],
          rows: [
            {
              label: 'Duplicate',
              cells: [
                {cellType: 'text', displayValue: 'formatted-1'},
                {cellType: 'text', displayValue: 'formatted-2.5 ha'},
              ],
            },
            {
              label: 'Duplicate',
              cells: [
                {cellType: 'text', displayValue: '–'},
                {cellType: 'text', displayValue: 'formatted-0 %'},
              ],
            },
          ],
        },
      },
    ]);
    expect(formatNumber).toHaveBeenCalledTimes(3);
  });

  it('turns group headers into ordered named sections', () => {
    const layer = createLayer({
      rows: [
        {label: 'Leading', isGroupHeader: false, values: [{value: 1, unit: null}]},
        {label: 'First group', isGroupHeader: true, values: []},
        {label: 'First row', isGroupHeader: false, values: [{value: 2, unit: null}]},
        {label: 'Second group', isGroupHeader: true, values: []},
        {label: 'Second row', isGroupHeader: false, values: [{value: 3, unit: null}]},
      ],
    });

    const result = mapStatisticsDataToView(layer, String);

    expect(result.map(({title, data}) => ({title, labels: data.rows.map((row) => row.label)}))).toEqual([
      {title: undefined, labels: ['Leading']},
      {title: 'First group', labels: ['First row']},
      {title: 'Second group', labels: ['Second row']},
    ]);
  });

  it('keeps cells aligned to the declared columns when a row has the wrong number of values', () => {
    const layer = createLayer({
      columns: ['First', 'Second'],
      rows: [
        {label: 'Missing value', isGroupHeader: false, values: [{value: 1, unit: null}]},
        {
          label: 'Extra value',
          isGroupHeader: false,
          values: [
            {value: 2, unit: null},
            {value: 3, unit: null},
            {value: 4, unit: null},
          ],
        },
      ],
    });

    expect(mapStatisticsDataToView(layer, String)[0]?.data.rows).toEqual([
      {
        label: 'Missing value',
        cells: [
          {cellType: 'text', displayValue: '1'},
          {cellType: 'text', displayValue: '–'},
        ],
      },
      {
        label: 'Extra value',
        cells: [
          {cellType: 'text', displayValue: '2'},
          {cellType: 'text', displayValue: '3'},
        ],
      },
    ]);
  });

  it('keeps empty named groups while returning no section for an empty layer', () => {
    const layer = createLayer({
      rows: [
        {label: 'Empty group', isGroupHeader: true, values: []},
        {label: 'Also empty', isGroupHeader: true, values: []},
      ],
    });

    expect(mapStatisticsDataToView(layer, String)).toEqual([
      {title: 'Empty group', data: {headers: [{displayValue: 'Summe'}], rows: []}},
      {title: 'Also empty', data: {headers: [{displayValue: 'Summe'}], rows: []}},
    ]);
    expect(mapStatisticsDataToView(createLayer(), String)).toEqual([]);
  });
});
