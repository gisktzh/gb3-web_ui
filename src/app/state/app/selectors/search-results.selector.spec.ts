import {
  selectFilteredFaqItems,
  selectFilteredLayerCatalogMaps,
  selectFilteredMetadataItems,
  selectFilteredSearchApiResultMatches,
} from './search-results.selector';
import {SearchFilterGroup} from '../../../shared/interfaces/search-filter-group.interface';
import {SearchIndex} from '../../../shared/services/apis/search/interfaces/search-index.interface';
import {SearchApiResultMatch} from '../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {Map} from '../../../shared/interfaces/topic.interface';
import {
  DatasetOverviewMetadataItem,
  MapOverviewMetadataItem,
  OverviewMetadataItem,
  ProductOverviewMetadataItem,
  ServiceOverviewMetadataItem,
} from '../../../shared/models/overview-metadata-item.model';
import {FaqCollection, FaqItem} from '../../../shared/interfaces/faq.interface';

describe('search-result selector', () => {
  describe('selectFilteredSearchApiResultMatches', () => {
    const filterGroupsMock: SearchFilterGroup[] = [
      {
        label: 'Group1',
        useDynamicActiveMapItemsFilter: false,
        filters: [
          {label: 'Filter1-addresses Label', isActive: false, type: 'addresses'},
          {label: 'Filter2-places Label', isActive: true, type: 'places'},
          {label: 'Filter3-maps Label', isActive: false, type: 'maps'},
        ],
      },
      {label: 'Group2', useDynamicActiveMapItemsFilter: true, filters: []},
    ];

    const searchIndexesMock: SearchIndex[] = [
      {indexName: 'Index1', indexType: 'activeMapItems', active: true, label: 'Index One'},
      {indexName: 'Index2', indexType: 'activeMapItems', active: true, label: 'Index Two'},
    ];

    const searchMatchesMock: SearchApiResultMatch[] = [
      {
        indexType: 'places',
        indexName: 'Place',
        displayString: 'Places One Match',
        geometry: {srs: 2056, type: 'Point', coordinates: [0, 0]},
        score: 1337,
      },
      {
        indexType: 'addresses',
        indexName: 'Address',
        displayString: 'Address One Match',
        geometry: {srs: 2056, type: 'Point', coordinates: [1, 1]},
        score: 42,
      },
      {
        indexType: 'activeMapItems',
        indexName: 'Index One',
        displayString: 'Index One Match',
        geometry: {srs: 2056, type: 'Point', coordinates: [2, 2]},
        score: 9001,
      },
      {
        indexType: 'activeMapItems',
        indexName: 'Index Two',
        displayString: 'Index Two Match',
        geometry: {srs: 2056, type: 'Point', coordinates: [3, 3]},
        score: 666,
      },
    ];

    it('returns an empty list if no items, filters and special indexes are available', () => {
      const actual = selectFilteredSearchApiResultMatches.projector([], [], []);

      expect(actual).toEqual([]);
    });

    it('returns an empty list if no items are available (irrespective of a filter or special indexes)', () => {
      const actual = selectFilteredSearchApiResultMatches.projector([], filterGroupsMock, searchIndexesMock);

      expect(actual).toEqual([]);
    });

    it('returns all items if no filter is available (irrespective of special indexes)', () => {
      const actualWithoutSearchIndexes = selectFilteredSearchApiResultMatches.projector(searchMatchesMock, [], []);
      expect(actualWithoutSearchIndexes).toEqual(searchMatchesMock);

      const actualWithSearchIndexes = selectFilteredSearchApiResultMatches.projector(searchMatchesMock, [], searchIndexesMock);
      expect(actualWithSearchIndexes).toEqual(searchMatchesMock);
    });

    it('returns only filtered items if filters are available', () => {
      const actual = selectFilteredSearchApiResultMatches.projector(searchMatchesMock, filterGroupsMock, []);
      const expectedSearchMatches = searchMatchesMock.filter(
        (match) => filterGroupsMock.flatMap((group) => group.filters).find((filter) => filter.type === match.indexType)?.isActive === true,
      );

      expect(actual).toEqual(expectedSearchMatches);
    });

    it('returns only filtered items (including dynamically created ones)', () => {
      const dynamicFilterGroups: SearchFilterGroup[] = [
        {
          label: 'Group1',
          useDynamicActiveMapItemsFilter: false,
          filters: [
            {label: 'Filter1-addresses Label', isActive: false, type: 'addresses'},
            {label: 'Filter2-places Label', isActive: true, type: 'places'},
            {label: 'Filter3-maps Label', isActive: false, type: 'maps'},
          ],
        },
        {
          label: 'Group2',
          useDynamicActiveMapItemsFilter: true,
          filters: [
            {label: 'Index One Label', isActive: false, type: 'activeMapItems'},
            {label: 'Index Two Label', isActive: true, type: 'activeMapItems'},
          ],
        },
      ];
      const actual = selectFilteredSearchApiResultMatches.projector(searchMatchesMock, dynamicFilterGroups, searchIndexesMock);
      const expectedSearchMatches = searchMatchesMock.filter(
        (match) =>
          dynamicFilterGroups.flatMap((group) => group.filters).find((filter) => filter.type === match.indexType)?.isActive === true,
      );

      expect(actual).toEqual(expectedSearchMatches);
    });

    it('returns all items if all filters are active (including dynamically created ones)', () => {
      const dynamicFilterGroups: SearchFilterGroup[] = [
        {
          label: 'Group1',
          useDynamicActiveMapItemsFilter: false,
          filters: [
            {label: 'Filter1-addresses', isActive: true, type: 'addresses'},
            {label: 'Filter2-places', isActive: true, type: 'places'},
            {label: 'Filter3-maps', isActive: true, type: 'maps'},
          ],
        },
        {
          label: 'Group2',
          useDynamicActiveMapItemsFilter: true,
          filters: [
            {label: 'Index One', isActive: true, type: 'activeMapItems'},
            {label: 'Index Two', isActive: true, type: 'activeMapItems'},
          ],
        },
      ];
      const actual = selectFilteredSearchApiResultMatches.projector(searchMatchesMock, dynamicFilterGroups, searchIndexesMock);
      const expectedSearchMatches = searchMatchesMock;

      expect(actual).toEqual(expectedSearchMatches);
    });

    it('returns all items if no matching dynamically created filter is found', () => {
      const dynamicFilterGroups: SearchFilterGroup[] = [
        {
          label: 'Group1',
          useDynamicActiveMapItemsFilter: false,
          filters: [
            {label: 'Filter1-addresses Label', isActive: false, type: 'addresses'},
            {label: 'Filter2-places Label', isActive: false, type: 'places'},
            {label: 'Filter3-maps Label', isActive: false, type: 'maps'},
          ],
        },
        {
          label: 'Group2',
          useDynamicActiveMapItemsFilter: true,
          filters: [],
        },
      ];
      const actual = selectFilteredSearchApiResultMatches.projector(searchMatchesMock, dynamicFilterGroups, searchIndexesMock);

      expect(actual).toEqual(searchMatchesMock);
    });
  });

  describe('selectFilteredLayerCatalogMaps', () => {
    const filterGroupsMock: SearchFilterGroup[] = [
      {
        label: 'Group1',
        useDynamicActiveMapItemsFilter: false,
        filters: [{label: 'Filter-maps Label', isActive: true, type: 'maps'}],
      },
      {label: 'Group2', useDynamicActiveMapItemsFilter: true, filters: []},
    ];

    const simpleSearchTerm = '12searchTerm';
    const complexSearchTerm = '. 12 * seArch_ term TeRM';

    function createMapsMock(searchTerm: string): Map[] {
      return [
        {
          // matching by keywords
          id: 'id1',
          title: 'if you read this you lose',
          keywords: [searchTerm.toLowerCase(), 'another keyword'],
          wmsUrl: '',
          notice: null,
          uuid: null,
          icon: '',
          organisation: null,
          gb2Url: null,
          minScale: null,
          layers: [],
          printTitle: '',
          opacity: 1,
        },
        {
          // matching by title
          id: 'id2',
          title: `beginning of title ${searchTerm.toUpperCase()} end of title`,
          keywords: ['lol', 'rofl', 'kek'],
          wmsUrl: '',
          notice: null,
          uuid: null,
          icon: '',
          organisation: null,
          gb2Url: null,
          minScale: null,
          layers: [],
          printTitle: '',
          opacity: 1,
        },
        {
          // not matching
          id: 'id3',
          title: 'j.r.r.tolkin or something',
          keywords: ['to be', 'not to be'],
          wmsUrl: '',
          notice: null,
          uuid: null,
          icon: '',
          organisation: null,
          gb2Url: null,
          minScale: null,
          layers: [],
          printTitle: '',
          opacity: 1,
        },
        {
          // matching by title and keywords
          id: 'id4',
          title: `beginning of title ${searchTerm} end of title`,
          keywords: ['buddle of rum', searchTerm],
          wmsUrl: '',
          notice: null,
          uuid: null,
          icon: '',
          organisation: null,
          gb2Url: null,
          minScale: null,
          layers: [],
          printTitle: '',
          opacity: 1,
        },
        {
          // partially matching by title
          id: 'id5',
          title: `${searchTerm.slice(0, searchTerm.length / 2)}`,
          keywords: ['matchingString', 'keywords'],
          wmsUrl: '',
          notice: null,
          uuid: null,
          icon: '',
          organisation: null,
          gb2Url: null,
          minScale: null,
          layers: [],
          printTitle: '',
          opacity: 1,
        },
      ];
    }

    it('returns an empty list if no items, filters are available and the search term is empty', () => {
      const actual = selectFilteredLayerCatalogMaps.projector('', [], []);

      expect(actual).toEqual([]);
    });

    it('returns an empty list if no items are available (irrespective of a search term or a filter)', () => {
      const actualWithSearchTermAndFilters = selectFilteredLayerCatalogMaps.projector('any filter', [], filterGroupsMock);
      expect(actualWithSearchTermAndFilters).toEqual([]);

      const actualWithSearch = selectFilteredLayerCatalogMaps.projector('any filter', [], []);
      expect(actualWithSearch).toEqual([]);

      const actualFilters = selectFilteredLayerCatalogMaps.projector('', [], filterGroupsMock);
      expect(actualFilters).toEqual([]);
    });

    it('returns an empty list if the search term is empty (irrespective of a filter)', () => {
      const searchTerm = simpleSearchTerm;
      const mapsMock = createMapsMock(searchTerm);
      const actual = selectFilteredLayerCatalogMaps.projector('', mapsMock, []);

      expect(actual).toEqual([]);
    });

    it('returns only filtered items if no filters but simple search terms are available', () => {
      const searchTerm = simpleSearchTerm;
      const mapsMock = createMapsMock(searchTerm);
      const actual = selectFilteredLayerCatalogMaps.projector(searchTerm, mapsMock, []);
      const expected: Map[] = [mapsMock[0], mapsMock[1], mapsMock[3]];

      expect(actual).toEqual(expected);
    });

    it('returns only filtered items if no filters but complex search terms are available', () => {
      const searchTerm = complexSearchTerm;
      const mapsMock = createMapsMock(searchTerm);
      const actual = selectFilteredLayerCatalogMaps.projector(searchTerm, mapsMock, []);
      const expected: Map[] = [mapsMock[0], mapsMock[1], mapsMock[3]];

      expect(actual).toEqual(expected);
    });

    it('returns an empty list if search terms are matching but a map filter is not active', () => {
      const searchTerm = simpleSearchTerm;
      const mapsMock = createMapsMock(searchTerm);
      const actual = selectFilteredLayerCatalogMaps.projector(searchTerm, mapsMock, [
        {
          label: 'test',
          useDynamicActiveMapItemsFilter: false,
          filters: [
            {label: 'other-filter', isActive: true, type: 'metadata-products'},
            {label: 'maps-filter', isActive: false, type: 'maps'},
          ],
        },
      ]);

      expect(actual).toEqual([]);
    });

    it('returns only filtered items if filters and simple search terms are available', () => {
      const searchTerm = simpleSearchTerm;
      const mapsMock = createMapsMock(searchTerm);
      const actual = selectFilteredLayerCatalogMaps.projector(searchTerm, mapsMock, [
        {
          label: 'test',
          useDynamicActiveMapItemsFilter: false,
          filters: [
            {label: 'other-filter', isActive: false, type: 'metadata-products'},
            {label: 'test', isActive: true, type: 'maps'},
          ],
        },
      ]);
      const expected: Map[] = [mapsMock[0], mapsMock[1], mapsMock[3]];

      expect(actual).toEqual(expected);
    });
  });

  describe('selectFilteredMetadataItems', () => {
    const filteredSearchApiResultMatchesMock: SearchApiResultMatch[] = [
      {indexType: 'places', score: 1, displayString: 'one', geometry: {srs: 2056, type: 'Point', coordinates: [0, 0]}},
      {indexType: 'addresses', score: 2, displayString: 'two', geometry: {srs: 2056, type: 'Point', coordinates: [0, 0]}},
      {indexType: 'unknown', score: 3},
      {indexType: 'metadata-maps', score: 4, uuid: '1234-rofl-yolo-swag'},
      {indexType: 'metadata-products', score: 5, uuid: '9876-5432-1one-four'},
      {indexType: 'metadata-datasets', score: 6, uuid: 'aaaa-bbbb-cccc-dddd'},
    ];

    const itemsMock: OverviewMetadataItem[] = [
      new MapOverviewMetadataItem('1234-rofl-yolo-swag', 'one', 'desc', 'dep'), // should match
      new MapOverviewMetadataItem('nope-nope-nope-nope', 'two', 'desc', 'dep'), // should not match
      new ProductOverviewMetadataItem('nope-rofl-yolo-swag', 'three', 'desc', 'dep'), // should not match
      new DatasetOverviewMetadataItem('aaaa-bbbb-cccc-dddd', 'four', 'desc', 'dep', 'format'), // should match
      new ServiceOverviewMetadataItem('nada-bbbb-cccc-dddd', 'five', 'desc', 'dep'), // should not match
    ];

    it('returns an empty list if no items and filtered values are available', () => {
      const actual = selectFilteredMetadataItems.projector([], []);
      expect(actual).toEqual([]);
    });

    it('returns an empty list if no items are available', () => {
      const actual = selectFilteredMetadataItems.projector(filteredSearchApiResultMatchesMock, []);

      expect(actual).toEqual([]);
    });

    it('returns an empty list if no filtered values are available', () => {
      const actual = selectFilteredMetadataItems.projector([], itemsMock);

      expect(actual).toEqual([]);
    });

    it('returns only filtered items if items and filtered values are available', () => {
      const actual = selectFilteredMetadataItems.projector(filteredSearchApiResultMatchesMock, itemsMock);
      const expected: OverviewMetadataItem[] = [itemsMock[0], itemsMock[3]];

      expect(actual).toEqual(expected);
    });
  });

  describe('selectFilteredFaqItems', () => {
    const filterGroupsMock: SearchFilterGroup[] = [
      {
        label: 'Group1',
        useDynamicActiveMapItemsFilter: false,
        filters: [{label: 'Filter-faqs Label', isActive: true, type: 'faqs'}],
      },
      {label: 'Group2', useDynamicActiveMapItemsFilter: true, filters: []},
    ];

    const simpleSearchTerm = '12searchTerm';
    const complexSearchTerm = '. 12 * seArch_ term TeRM';

    function createFaqCollectionsMock(searchTerm: string): FaqCollection[] {
      return [
        {
          category: 'category one',
          items: [
            {
              // no match
              question: 'What is the answer to life, the universe, and everything?',
              answer: '42',
            },
            {
              // match in question
              question: `beginning of question ${searchTerm.toUpperCase()} end of question`,
              answer: '6 x 9',
            },
          ],
        },
        {
          category: 'category two',
          items: [
            {
              // match in answer
              question: 'What does the fox say?',
              answer: `beginning of answer ${searchTerm.toLowerCase()} end of answer`,
            },
            {
              // match in both: answer and question
              question: `beginning of question ${searchTerm} end of question`,
              answer: `beginning of answer ${searchTerm} end of answer`,
            },
            {
              // partial match in question
              question: `beginning of question ${searchTerm.slice(0, searchTerm.length / 2)} end of question`,
              answer: 'an example answer',
            },
          ],
        },
      ];
    }

    it('returns an empty list if no items, filters are available and the search term is empty', () => {
      const actual = selectFilteredFaqItems.projector('', [], []);

      expect(actual).toEqual([]);
    });

    it('returns an empty list if no items are available (irrespective of a search term or a filter)', () => {
      const actualWithSearchTermAndFilters = selectFilteredFaqItems.projector('any filter', [], filterGroupsMock);
      expect(actualWithSearchTermAndFilters).toEqual([]);

      const actualWithSearch = selectFilteredFaqItems.projector('any filter', [], []);
      expect(actualWithSearch).toEqual([]);

      const actualFilters = selectFilteredFaqItems.projector('', [], filterGroupsMock);
      expect(actualFilters).toEqual([]);
    });

    it('returns an empty list if the search term is empty (irrespective of a filter)', () => {
      const searchTerm = simpleSearchTerm;
      const faqsMock = createFaqCollectionsMock(searchTerm);
      const actual = selectFilteredFaqItems.projector('', faqsMock, []);

      expect(actual).toEqual([]);
    });

    it('returns only filtered items if no filters but simple search terms are available', () => {
      const searchTerm = simpleSearchTerm;
      const faqsMock = createFaqCollectionsMock(searchTerm);
      const actual = selectFilteredFaqItems.projector(searchTerm, faqsMock, []);
      const expected: FaqItem[] = [faqsMock[0].items[1], faqsMock[1].items[0], faqsMock[1].items[1]];

      expect(actual).toEqual(expected);
    });

    it('returns only filtered items if no filters but complex search terms are available', () => {
      const searchTerm = complexSearchTerm;
      const faqsMock = createFaqCollectionsMock(searchTerm);
      const actual = selectFilteredFaqItems.projector(searchTerm, faqsMock, []);
      const expected: FaqItem[] = [faqsMock[0].items[1], faqsMock[1].items[0], faqsMock[1].items[1]];

      expect(actual).toEqual(expected);
    });

    it('returns an empty list if search terms are matching but a faq filter is not active', () => {
      const searchTerm = simpleSearchTerm;
      const faqsMock = createFaqCollectionsMock(searchTerm);
      const actual = selectFilteredFaqItems.projector(searchTerm, faqsMock, [
        {
          label: 'test',
          useDynamicActiveMapItemsFilter: false,
          filters: [
            {label: 'other-filter', isActive: true, type: 'metadata-products'},
            {label: 'faqs-filter', isActive: false, type: 'faqs'},
          ],
        },
      ]);

      expect(actual).toEqual([]);
    });

    it('returns only filtered items if filters and simple search terms are available', () => {
      const searchTerm = simpleSearchTerm;
      const faqsMock = createFaqCollectionsMock(searchTerm);
      const actual = selectFilteredFaqItems.projector(searchTerm, faqsMock, [
        {
          label: 'test',
          useDynamicActiveMapItemsFilter: false,
          filters: [
            {label: 'other-filter', isActive: false, type: 'metadata-products'},
            {label: 'test', isActive: true, type: 'faqs'},
          ],
        },
      ]);
      const expected: FaqItem[] = [faqsMock[0].items[1], faqsMock[1].items[0], faqsMock[1].items[1]];

      expect(actual).toEqual(expected);
    });
  });
});
