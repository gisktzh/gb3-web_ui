import {Map, MapLayer, Topic} from '../../../shared/interfaces/topic.interface';
import {selectFilteredLayerCatalog} from './filtered-layer-catalog.selector';

const mockMaps: Map[] = [
  {id: 'test-map-1-id', title: 'test-map-1-title', keywords: ['map-1-key'], layers: [] as MapLayer[]} as Map,
  {id: 'test-map-2-id', title: 'test-map-2-title', keywords: ['map-2-key'], layers: [] as MapLayer[]} as Map,
  {id: 'test-map-3-id', title: 'test-map-3-title', keywords: ['map-3-key'], layers: [] as MapLayer[]} as Map,
  {id: 'test-map-4-id', title: 'test-map-4-title', keywords: ['map-4-key'], layers: [] as MapLayer[]} as Map,
];

describe('selectFilteredLayerCatalog', () => {
  let topics: Topic[];
  beforeEach(() => {
    topics = [
      {
        title: 'test-topic-1',
        maps: [mockMaps[0], mockMaps[1]],
      },
      {
        title: 'test-topic-2',
        maps: [mockMaps[2], mockMaps[3]],
      },
      {
        title: 'test-topic-3',
        maps: [],
      },
    ];
  });

  it('returns all topics when using an empty filter string', () => {
    const actual = selectFilteredLayerCatalog.projector('', topics);
    const expected = topics;

    expect(actual).toEqual(expected);
  });

  it('returns an empty array if nothing matches', () => {
    const actual = selectFilteredLayerCatalog.projector('nothing', topics);
    const expected: Topic[] = [];

    expect(actual).toEqual(expected);
  });

  it('returns the filtered topics/maps for the matching title', () => {
    const actual = selectFilteredLayerCatalog.projector(mockMaps[0].title, topics);
    const expected = [
      {
        title: 'test-topic-1',
        maps: [mockMaps[0]],
      },
    ];

    expect(actual).toEqual(expected);
  });

  it('returns the filtered topics/maps for the matching keyword', () => {
    const actual = selectFilteredLayerCatalog.projector(mockMaps[1].keywords[0], topics);
    const expected = [
      {
        title: 'test-topic-1',
        maps: [mockMaps[1]],
      },
    ];

    expect(actual).toEqual(expected);
  });

  it('returns the filtered topics/maps for the matching id', () => {
    const actual = selectFilteredLayerCatalog.projector(mockMaps[2].id, topics);
    const expected = [
      {
        title: 'test-topic-2',
        maps: [mockMaps[2]],
      },
    ];

    expect(actual).toEqual(expected);
  });

  it('returns the filtered topics/maps for the partially filter string', () => {
    const actual = selectFilteredLayerCatalog.projector('MAP-4', topics);
    const expected = [
      {
        title: 'test-topic-2',
        maps: [mockMaps[3]],
      },
    ];

    expect(actual).toEqual(expected);
  });
});
