import {
  DatasetOverviewMetadataItem,
  MapOverviewMetadataItem,
  OverviewFaqItem,
  ProductOverviewMetadataItem,
  ServiceOverviewMetadataItem,
} from './overview-search-result.model';
import {DataCataloguePage} from '../enums/data-catalogue-page.enum';
import {MainPage} from '../enums/main-page.enum';
import {OGDAvailability} from '../enums/ogd-availability.enum';
import {SupportPage} from '../enums/support-page.enum';
import {OverviewSearchResultDisplayItem} from '../interfaces/overview-search-resuilt-display.interface';

const TEST_GUID = '1337';

function expectUrlForType(dataCataloguePage: DataCataloguePage): string {
  return `/${MainPage.Data}/${dataCataloguePage}/${TEST_GUID}`;
}

describe('OverviewMetadataItemModel', () => {
  [
    {
      group: 'ServiceOverviewMetadataItem',
      class: ServiceOverviewMetadataItem,
      expectedUrl: expectUrlForType(DataCataloguePage.Services),
      type: 'Geoservice',
    },
    {
      group: 'MapOverviewMetadataItem',
      class: MapOverviewMetadataItem,
      expectedUrl: expectUrlForType(DataCataloguePage.Maps),
      type: 'Karte',
    },
    {
      group: 'ProductOverviewMetadataItem',
      class: ProductOverviewMetadataItem,
      expectedUrl: expectUrlForType(DataCataloguePage.Products),
      type: 'Produkt',
    },
    {group: 'OverviewFaqItem', class: OverviewFaqItem, expectedUrl: `${MainPage.Support}/${SupportPage.Faq}`, type: 'Frage'},
  ].forEach((testCase) =>
    describe(testCase.group, () => {
      it(`creates the correct URL for ${testCase.group}`, () => {
        const testItem = new testCase.class(TEST_GUID, '', '', '');
        expect(testItem.relativeUrl).toEqual(testCase.expectedUrl);
      });

      it(`creates the correct OverviewSearchResultDisplayItem for ${testCase.group}`, () => {
        const testItem = new testCase.class(TEST_GUID, 'Gandalf', 'Amon Amarth', 'Isildur');

        const actual = testItem.createDisplayRepresentationForList();
        const expected: OverviewSearchResultDisplayItem = {
          relativeUrl: testCase.expectedUrl,
          uuid: TEST_GUID,
          title: 'Gandalf',
          fields: [
            {title: 'Typ', content: testCase.type},
            {title: 'Beschreibung', content: 'Amon Amarth', truncatable: true},
          ],
        };

        expect(actual).toEqual(expected);
      });
    }),
  );

  describe('DatasetOverviewMetadataItem', () => {
    it('creates the correct URL for DatasetOverviewMetadataItem', () => {
      const testItem = new DatasetOverviewMetadataItem(TEST_GUID, '', '', '', [''], true);
      expect(testItem.relativeUrl).toEqual(expectUrlForType(DataCataloguePage.Datasets));
    });

    it(`creates the correct OverviewSearchResultDisplayItem for DatasetOverviewMetadataItem`, () => {
      const testItem = new DatasetOverviewMetadataItem(TEST_GUID, 'Gandalf', 'Amon Amarth', 'Isildur', ['a', 'b'], true);

      const actual = testItem.createDisplayRepresentationForList();
      const expected: OverviewSearchResultDisplayItem = {
        relativeUrl: expectUrlForType(DataCataloguePage.Datasets),
        uuid: TEST_GUID,
        title: 'Gandalf',
        fields: [
          {title: 'Typ', content: 'Geodatensatz'},
          {title: 'Verfügbarkeit', content: OGDAvailability.OGD},
          {title: 'Beschreibung', content: 'Amon Amarth', truncatable: true},
        ],
      };

      expect(actual).toEqual(expected);
    });

    [
      {ogd: true, mapping: OGDAvailability.OGD},
      {ogd: false, mapping: OGDAvailability.NOGD},
    ].forEach((testCase) =>
      it(`creates the correct OGD mapping for DatasetOverviewMetadataItem if OGD is ${testCase.ogd}`, () => {
        const testItem = new DatasetOverviewMetadataItem(TEST_GUID, '', '', '', [''], testCase.ogd);
        expect(testItem.ogd).toEqual(testCase.mapping);
      }),
    );
  });
});
