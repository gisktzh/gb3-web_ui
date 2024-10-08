import {selectDataCatalogueItems} from './data-catalogue-items.selector';
import {
  DatasetOverviewMetadataItem,
  MapOverviewMetadataItem,
  OverviewMetadataItem,
  ProductOverviewMetadataItem,
} from '../../../shared/models/overview-search-result.model';
import {ActiveDataCatalogueFilterGroup} from '../../../shared/interfaces/data-catalogue-filter.interface';
import {OverviewSearchResultDisplayItem} from '../../../shared/interfaces/overview-search-resuilt-display.interface';

describe('selectDataCatalogueItems', () => {
  it('returns an empty list if no items, filters and search terms / results are available', () => {
    const actual = selectDataCatalogueItems.projector([], [], '', []);

    expect(actual).toEqual([]);
  });

  it('returns an empty list if no items are available (irrespective of a filter)', () => {
    const actual = selectDataCatalogueItems.projector([], [{key: 'uuid', values: ['does-not-matter']}], 'does-also-not-matter', [
      new MapOverviewMetadataItem('something', 'name', 'desc', 'dep').createDisplayRepresentationForList(),
    ]);

    expect(actual).toEqual([]);
  });

  it('returns all items if no filter or search term is available', () => {
    const items: OverviewMetadataItem[] = [
      new MapOverviewMetadataItem('1', 'Test', 'Test-2', 'Test-3'),
      new MapOverviewMetadataItem('2', 'TestTest', 'TestTest-2', 'TestTest-3'),
    ];
    const actual = selectDataCatalogueItems.projector(items, [], '', []);

    expect(actual).toEqual(items.map((item) => item.createDisplayRepresentationForList()));
  });

  describe('filter conditions: multiple filters (AND)', () => {
    describe('common-to-all-properties', () => {
      it('returns all items that match one of the filter values in each group', () => {
        const items: OverviewMetadataItem[] = [
          new MapOverviewMetadataItem('1', 'Test Match', 'Test-1', 'Test-1'), // should match
          new MapOverviewMetadataItem('1', 'Test Match', 'Test-1', 'Test-2'), // should not match
          new MapOverviewMetadataItem('2', 'Test in 2', 'Test-2', 'Test-2'), // should not match
          new MapOverviewMetadataItem('4', 'Test wird nicht matchen', 'Test-2', 'Test-1'), // should not match
          new ProductOverviewMetadataItem('1', 'Test Match', 'Test-2', 'Test-3'), // should match
        ];
        const filter: ActiveDataCatalogueFilterGroup[] = [
          {key: 'responsibleDepartment', values: ['Test-1', 'Test-3']},
          {key: 'name', values: ['Test Match', 'Test in 2']},
        ];
        const actual = selectDataCatalogueItems.projector(items, filter, '', []);

        expect(actual).toEqual([items[0].createDisplayRepresentationForList(), items[4].createDisplayRepresentationForList()]);
      });

      it('returns all items that match one of the filter values', () => {
        const items: OverviewMetadataItem[] = [
          new MapOverviewMetadataItem('1', 'Test', 'Test-2', 'Test-2'),
          new MapOverviewMetadataItem('2', 'Test', 'Test-2', 'Test-3'),
          new ProductOverviewMetadataItem('1', 'Test', 'Test-2', 'Test-4'),
        ];
        const filter: ActiveDataCatalogueFilterGroup[] = [{key: 'responsibleDepartment', values: ['Test-2', 'Test-3']}];
        const actual = selectDataCatalogueItems.projector(items, filter, '', []);

        expect(actual).toEqual([items[0].createDisplayRepresentationForList(), items[1].createDisplayRepresentationForList()]);
      });
    });
  });

  describe('filter conditions: single filter (OR)', () => {
    describe('common-to-all-property', () => {
      it('returns all items that match the filter value', () => {
        const items: OverviewMetadataItem[] = [
          new MapOverviewMetadataItem('1', 'Test', 'Test-2', 'Test-3'),
          new MapOverviewMetadataItem('2', 'Test', 'Test-2', 'Test-2'),
          new ProductOverviewMetadataItem('1', 'Test', 'Test-2', 'Test-3'),
        ];
        const filter: ActiveDataCatalogueFilterGroup[] = [{key: 'responsibleDepartment', values: ['Test-3']}];
        const actual = selectDataCatalogueItems.projector(items, filter, '', []);

        expect(actual).toEqual([items[0].createDisplayRepresentationForList(), items[2].createDisplayRepresentationForList()]);
      });

      it('returns all items that match one of the filter values', () => {
        const items: OverviewMetadataItem[] = [
          new MapOverviewMetadataItem('1', 'Test', 'Test-2', 'Test-2'),
          new MapOverviewMetadataItem('2', 'Test', 'Test-2', 'Test-3'),
          new ProductOverviewMetadataItem('1', 'Test', 'Test-2', 'Test-4'),
        ];
        const filter: ActiveDataCatalogueFilterGroup[] = [{key: 'responsibleDepartment', values: ['Test-2', 'Test-3']}];
        const actual = selectDataCatalogueItems.projector(items, filter, '', []);

        expect(actual).toEqual([items[0].createDisplayRepresentationForList(), items[1].createDisplayRepresentationForList()]);
      });
    });

    describe('common-to-some property', () => {
      it('does not return an item wich does not have the property on which a filter operates', () => {
        const items: OverviewMetadataItem[] = [new MapOverviewMetadataItem('1', 'Test', 'Test-2', 'Test-3')];
        const filter: ActiveDataCatalogueFilterGroup[] = [{key: 'outputFormat', values: ['output']}];
        const actual = selectDataCatalogueItems.projector(items, filter, '', []);

        expect(actual).toEqual([]);
      });

      it('returns an item which has a given property and matches the filter value', () => {
        const items: OverviewMetadataItem[] = [
          new DatasetOverviewMetadataItem('2', 'TestTest', 'TestTest-2', 'TestTest-3', ['output'], true),
          new DatasetOverviewMetadataItem('3', 'TestTest3', 'TestTest-32', 'Test3Test-3', ['output3'], false),
        ];
        const filter: ActiveDataCatalogueFilterGroup[] = [{key: 'outputFormat', values: ['output']}];
        const actual = selectDataCatalogueItems.projector(items, filter, '', []);

        expect(actual).toEqual([items[0].createDisplayRepresentationForList()]);
      });

      it('does return all matching items for all ', () => {
        const items: OverviewMetadataItem[] = [
          new DatasetOverviewMetadataItem('2', 'TestTest', 'TestTest-2', 'TestTest-3', ['output'], true),
          new DatasetOverviewMetadataItem('3', 'TestTest3', 'TestTest-32', 'Test3Test-3', ['output3'], false),
        ];
        const filter: ActiveDataCatalogueFilterGroup[] = [{key: 'outputFormat', values: ['output']}];
        const actual = selectDataCatalogueItems.projector(items, filter, '', []);

        expect(actual).toEqual([items[0].createDisplayRepresentationForList()]);
      });
    });
  });

  describe('filter conditions: search term (AND)', () => {
    describe('without other filters', () => {
      it('returns all items that match the search term results', () => {
        const items: OverviewMetadataItem[] = [
          new MapOverviewMetadataItem('1', 'Test Match', 'Test-1', 'Test-1'), // should not match
          new MapOverviewMetadataItem('1', 'Test Match', 'Test-1', 'Test-2'), // should not match
          new MapOverviewMetadataItem('2', 'Test in 2', 'Test-2', 'Test-2'), // should match
          new MapOverviewMetadataItem('4', 'Test wird nicht matchen', 'Test-2', 'Test-1'), // should match
          new ProductOverviewMetadataItem('1', 'Test Match', 'Test-2', 'Test-3'), // should not match
        ];
        const searchTermResults: OverviewSearchResultDisplayItem[] = [
          new MapOverviewMetadataItem('2', 'Test in 2', 'Test-2', 'Test-2').createDisplayRepresentationForList(),
          new MapOverviewMetadataItem('4', 'Test wird nicht matchen', 'Test-2', 'Test-1').createDisplayRepresentationForList(),
        ];
        const actual = selectDataCatalogueItems.projector(items, [], 'a search term', searchTermResults);

        expect(actual).toEqual([items[2].createDisplayRepresentationForList(), items[3].createDisplayRepresentationForList()]);
      });
    });

    describe('in combination with other filters', () => {
      it('returns all items that match the search term results and the filters', () => {
        const items: OverviewMetadataItem[] = [
          new MapOverviewMetadataItem('1', 'Test Match', 'Test-1', 'Test-1'), // should match
          new MapOverviewMetadataItem('1', 'Test Match', 'Test-1', 'Test-2'), // should not match
          new MapOverviewMetadataItem('2', 'Test in 2', 'Test-2', 'Test-2'), // should not match
          new MapOverviewMetadataItem('4', 'Test wird nicht matchen', 'Test-2', 'Test-1'), // should not match
          new ProductOverviewMetadataItem('1', 'Test Match', 'Test-2', 'Test-3'), // should match
        ];
        const filter: ActiveDataCatalogueFilterGroup[] = [
          {key: 'responsibleDepartment', values: ['Test-1', 'Test-3']},
          {key: 'name', values: ['Test Match', 'Test in 2']},
        ];
        const searchTermResults: OverviewSearchResultDisplayItem[] = [
          new ProductOverviewMetadataItem('1', 'Test Match', 'Test-2', 'Test-3').createDisplayRepresentationForList(),
        ];
        const actual = selectDataCatalogueItems.projector(items, filter, 'a search term', searchTermResults);

        expect(actual).toEqual([items[0].createDisplayRepresentationForList(), items[4].createDisplayRepresentationForList()]);
      });
    });
  });
});
