import {describe, expect, it} from 'vitest';
import {NotConcernedTheme} from 'src/app/shared/models/gb3-api-generated.interfaces';
import {OerebConcernedTheme, OerebExtractValue} from 'src/app/shared/interfaces/oereb-extract.interface';
import {MapOerebExtractDataToView} from './map-oereb-extract-data-to-view.utils';

function createConcernedTheme(overrides: Partial<OerebConcernedTheme> = {}): OerebConcernedTheme {
  return {
    id: 1,
    name: 'Test theme',
    legalProvisions: [],
    laws: [],
    hints: [],
    responsibleOffices: [],
    restrictions: [],
    ...overrides,
  };
}

describe('MapOerebExtractDataToView', () => {
  describe('mapOerebExtractApiThemeToDisplayableTheme', () => {
    it('should map the theme name', () => {
      const theme = createConcernedTheme();

      const result = MapOerebExtractDataToView.mapOerebExtractApiThemeToDisplayableTheme(theme);

      expect(result.name).toBe('Test theme');
    });

    it('should map all general information categories containing items', () => {
      const theme = createConcernedTheme({
        legalProvisions: [{title: 'Legal provision'}, {title: 'Legal provision link', href: 'https://example.com/legal'}],
        laws: [{title: 'Law'}],
        hints: [{title: 'Hint'}],
        responsibleOffices: [{title: 'Responsible office', href: 'https://example.com/office'}],
      });

      const result = MapOerebExtractDataToView.mapOerebExtractApiThemeToDisplayableTheme(theme);

      expect(result.generalInfo).toEqual({
        itemLabel: 'Allgemeine Informationen',
        itemType: 'list',
        items: [
          {
            itemLabel: 'Gesetzliche Grundlagen',
            itemType: 'list',
            items: [
              {
                itemLabel: 'Legal provision',
                itemType: 'text',
                text: 'Legal provision',
              },
              {
                itemLabel: 'Legal provision link',
                itemType: 'url',
                url: 'https://example.com/legal',
              },
            ],
          },
          {
            itemLabel: 'Rechtsvorschriften',
            itemType: 'list',
            items: [
              {
                itemLabel: 'Law',
                itemType: 'text',
                text: 'Law',
              },
            ],
          },
          {
            itemLabel: 'Weitere Hinweise',
            itemType: 'list',
            items: [
              {
                itemLabel: 'Hint',
                itemType: 'text',
                text: 'Hint',
              },
            ],
          },
          {
            itemLabel: 'Zuständige Stellen',
            itemType: 'list',
            items: [
              {
                itemLabel: 'Responsible office',
                itemType: 'url',
                url: 'https://example.com/office',
              },
            ],
          },
        ],
      });
    });

    it('should omit empty general information categories', () => {
      const theme = createConcernedTheme({
        legalProvisions: [],
        laws: [{title: 'A law'}],
        hints: [],
        responsibleOffices: [],
      });

      const result = MapOerebExtractDataToView.mapOerebExtractApiThemeToDisplayableTheme(theme);

      expect(result.generalInfo).toEqual({
        itemLabel: 'Allgemeine Informationen',
        itemType: 'list',
        items: [
          {
            itemLabel: 'Rechtsvorschriften',
            itemType: 'list',
            items: [
              {
                itemLabel: 'A law',
                itemType: 'text',
                text: 'A law',
              },
            ],
          },
        ],
      });
    });

    it('should return no general information when all categories are empty', () => {
      const theme = createConcernedTheme({
        legalProvisions: [],
        laws: [],
        hints: [],
        responsibleOffices: [],
      });

      const result = MapOerebExtractDataToView.mapOerebExtractApiThemeToDisplayableTheme(theme);

      expect(result.generalInfo).toEqual({
        itemLabel: 'Allgemeine Informationen',
        itemType: 'list',
        items: [],
      });
    });

    it('should map a restriction with an illustration and area measurement', () => {
      const theme = createConcernedTheme({
        restrictions: [
          {
            id: 1,
            name: 'Area restriction',
            illustration: {
              alt: 'Restriction illustration',
              src: {
                href: 'https://example.com/image.png',
              },
              url: {
                href: 'https://example.com/image-info',
              },
            },
            measurement: {
              areaM2: 123.45,
              percentage: 0.5678,
            },
          },
        ],
      });

      const result = MapOerebExtractDataToView.mapOerebExtractApiThemeToDisplayableTheme(theme);

      expect(result.restrictions).toEqual([
        {
          itemLabel: 'Area restriction',
          itemType: 'list',
          items: [
            {
              itemLabel: 'Darstellung',
              itemType: 'image',
              url: 'https://example.com/image-info',
              src: 'https://example.com/image.png',
              alt: 'Restriction illustration',
              width: 23,
              height: 13,
            },
            {
              itemLabel: 'Fläche',
              itemType: 'text',
              text: '123.45m2',
            },
            {
              itemLabel: 'Anteil',
              itemType: 'text',
              text: '57%',
            },
          ],
        },
      ]);
    });

    it('should map a restriction without illustration and line measurement', () => {
      const theme = createConcernedTheme({
        restrictions: [
          {
            id: 2,
            name: 'Line restriction',
            measurement: {
              lineLength: 42.5,
            },
          },
        ],
      });

      const result = MapOerebExtractDataToView.mapOerebExtractApiThemeToDisplayableTheme(theme);

      expect(result.restrictions).toEqual([
        {
          itemLabel: 'Line restriction',
          itemType: 'list',
          items: [
            {
              itemLabel: 'Länge',
              itemType: 'text',
              text: '42.5m',
            },
          ],
        },
      ]);
    });

    it('should map a restriction with a point measurement', () => {
      const theme = createConcernedTheme({
        restrictions: [
          {
            id: 3,
            name: 'Point restriction',
            measurement: {
              pointsCount: 7,
            },
          },
        ],
      });

      const result = MapOerebExtractDataToView.mapOerebExtractApiThemeToDisplayableTheme(theme);

      expect(result.restrictions).toEqual([
        {
          itemLabel: 'Point restriction',
          itemType: 'list',
          items: [
            {
              itemLabel: 'Anzahl Punkte',
              itemType: 'text',
              text: '7',
            },
          ],
        },
      ]);
    });

    it('should map zero values correctly', () => {
      const theme = createConcernedTheme({
        restrictions: [
          {
            id: 1,
            name: 'Zero area restriction',
            measurement: {
              areaM2: 0,
              percentage: 0,
            },
          },
          {
            id: 2,
            name: 'Zero line restriction',
            measurement: {
              lineLength: 0,
            },
          },
          {
            id: 3,
            name: 'Zero point restriction',
            measurement: {
              pointsCount: 0,
            },
          },
        ],
      });

      const result = MapOerebExtractDataToView.mapOerebExtractApiThemeToDisplayableTheme(theme);

      expect(result.restrictions).toEqual([
        {
          itemLabel: 'Zero area restriction',
          itemType: 'list',
          items: [
            {
              itemLabel: 'Fläche',
              itemType: 'text',
              text: '0m2',
            },
            {
              itemLabel: 'Anteil',
              itemType: 'text',
              text: '0%',
            },
          ],
        },
        {
          itemLabel: 'Zero line restriction',
          itemType: 'list',
          items: [
            {
              itemLabel: 'Länge',
              itemType: 'text',
              text: '0m',
            },
          ],
        },
        {
          itemLabel: 'Zero point restriction',
          itemType: 'list',
          items: [
            {
              itemLabel: 'Anzahl Punkte',
              itemType: 'text',
              text: '0',
            },
          ],
        },
      ]);
    });

    it('should round the percentage to the nearest whole percent', () => {
      const theme = createConcernedTheme({
        restrictions: [
          {
            id: 1,
            name: 'Rounding restriction',
            measurement: {
              areaM2: 10,
              percentage: 0.1254,
            },
          },
          {
            id: 2,
            name: 'Rounding restriction 2',
            measurement: {
              areaM2: 20,
              percentage: 0.1256,
            },
          },
        ],
      });

      const result = MapOerebExtractDataToView.mapOerebExtractApiThemeToDisplayableTheme(theme);

      expect(result.restrictions).toEqual([
        {
          itemLabel: 'Rounding restriction',
          itemType: 'list',
          items: [
            {
              itemLabel: 'Fläche',
              itemType: 'text',
              text: '10m2',
            },
            {
              itemLabel: 'Anteil',
              itemType: 'text',
              text: '13%',
            },
          ],
        },
        {
          itemLabel: 'Rounding restriction 2',
          itemType: 'list',
          items: [
            {
              itemLabel: 'Fläche',
              itemType: 'text',
              text: '20m2',
            },
            {
              itemLabel: 'Anteil',
              itemType: 'text',
              text: '13%',
            },
          ],
        },
      ]);
    });

    it('should preserve the order of restrictions', () => {
      const theme = createConcernedTheme({
        restrictions: [
          {
            id: 1,
            name: 'First',
            measurement: {
              pointsCount: 1,
            },
          },
          {
            id: 2,
            name: 'Second',
            measurement: {
              lineLength: 2,
            },
          },
          {
            id: 3,
            name: 'Third',
            measurement: {
              areaM2: 3,
              percentage: 0.03,
            },
          },
        ],
      });

      const result = MapOerebExtractDataToView.mapOerebExtractApiThemeToDisplayableTheme(theme);

      expect(result.restrictions.map((restriction) => restriction.itemLabel)).toEqual(['First', 'Second', 'Third']);
    });

    it('should return an empty restrictions array when there are no restrictions', () => {
      const theme = createConcernedTheme({
        restrictions: [],
      });

      const result = MapOerebExtractDataToView.mapOerebExtractApiThemeToDisplayableTheme(theme);

      expect(result.restrictions).toEqual([]);
    });
  });

  describe('mapOerebExtractValueToListItem', () => {
    it('should map a value without href to a text item', () => {
      const item: OerebExtractValue = {
        title: 'Some text',
      };

      const result = MapOerebExtractDataToView.mapOerebExtractValueToListItem(item);

      expect(result).toEqual({
        itemLabel: 'Some text',
        itemType: 'text',
        text: 'Some text',
      });
    });

    it('should map a value with href to a URL item', () => {
      const item: OerebExtractValue = {
        title: 'External information',
        href: 'https://example.com',
      };

      const result = MapOerebExtractDataToView.mapOerebExtractValueToListItem(item);

      expect(result).toEqual({
        itemLabel: 'External information',
        itemType: 'url',
        url: 'https://example.com',
      });
    });

    it('should map an empty href to a text item', () => {
      const item: OerebExtractValue = {
        title: 'Empty URL',
        href: '',
      };

      const result = MapOerebExtractDataToView.mapOerebExtractValueToListItem(item);

      expect(result).toEqual({
        itemLabel: 'Empty URL',
        itemType: 'text',
        text: 'Empty URL',
      });
    });
  });

  describe('mapNotConcernedThemesToTableData', () => {
    it('should map a theme with text and URL hints', () => {
      const themes: NotConcernedTheme[] = [
        {
          id: 1,
          name: 'Theme A',
          hints: [
            {
              title: 'Text hint',
            },
            {
              title: 'URL hint',
              href: 'https://example.com/hint',
            },
          ],
        },
      ];

      const result = MapOerebExtractDataToView.mapNotConcernedThemesToTableData(themes);

      expect(result).toEqual({
        headers: [],
        rows: [
          {
            label: 'Theme A',
            cells: [
              {
                displayValue: '',
                cellType: 'list',
                items: [
                  {
                    cellType: 'text',
                    displayValue: 'Text hint',
                  },
                  {
                    cellType: 'url',
                    displayValue: 'URL hint',
                    url: 'https://example.com/hint',
                  },
                ],
              },
            ],
          },
        ],
      });
    });

    it('should map a theme with no hints to an empty list cell', () => {
      const themes: NotConcernedTheme[] = [
        {
          id: 1,
          name: 'Theme A',
          hints: [],
        },
      ];

      const result = MapOerebExtractDataToView.mapNotConcernedThemesToTableData(themes);

      expect(result.rows).toEqual([
        {
          label: 'Theme A',
          cells: [
            {
              displayValue: '',
              cellType: 'list',
              items: [],
            },
          ],
        },
      ]);
    });

    it('should map multiple themes independently', () => {
      const themes: NotConcernedTheme[] = [
        {
          id: 1,
          name: 'Theme A',
          hints: [
            {
              title: 'Hint A',
            },
          ],
        },
        {
          id: 2,
          name: 'Theme B',
          hints: [
            {
              title: 'Hint B',
              href: 'https://example.com/b',
            },
          ],
        },
      ];

      const result = MapOerebExtractDataToView.mapNotConcernedThemesToTableData(themes);

      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toEqual({
        label: 'Theme A',
        cells: [
          {
            displayValue: '',
            cellType: 'list',
            items: [
              {
                cellType: 'text',
                displayValue: 'Hint A',
              },
            ],
          },
        ],
      });
      expect(result.rows[1]).toEqual({
        label: 'Theme B',
        cells: [
          {
            displayValue: '',
            cellType: 'list',
            items: [
              {
                cellType: 'url',
                displayValue: 'Hint B',
                url: 'https://example.com/b',
              },
            ],
          },
        ],
      });
    });

    it('should return an empty table when there are no themes', () => {
      const result = MapOerebExtractDataToView.mapNotConcernedThemesToTableData([]);

      expect(result).toEqual({
        headers: [],
        rows: [],
      });
    });

    it('should preserve themes with the same name as separate ordered rows', () => {
      const themes: NotConcernedTheme[] = [
        {
          id: 1,
          name: 'Duplicate',
          hints: [
            {
              title: 'First hint',
            },
          ],
        },
        {
          id: 2,
          name: 'Duplicate',
          hints: [
            {
              title: 'Second hint',
            },
          ],
        },
      ];

      const result = MapOerebExtractDataToView.mapNotConcernedThemesToTableData(themes);

      expect(result.rows).toEqual([
        {
          label: 'Duplicate',
          cells: [
            {
              displayValue: '',
              cellType: 'list',
              items: [
                {
                  cellType: 'text',
                  displayValue: 'First hint',
                },
              ],
            },
          ],
        },
        {
          label: 'Duplicate',
          cells: [
            {
              displayValue: '',
              cellType: 'list',
              items: [
                {
                  cellType: 'text',
                  displayValue: 'Second hint',
                },
              ],
            },
          ],
        },
      ]);
    });
  });
});
