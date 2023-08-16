import {Map, Topic} from '../../../shared/interfaces/topic.interface';
import {selectMaps} from './maps.selector';

const mockMaps: Map[] = [{id: 'test-map-1'} as Map, {id: 'test-map-2'} as Map, {id: 'test-map-3'} as Map, {id: 'test-map-4'} as Map];

describe('selectMaps', () => {
  let basicMockState: Topic[];
  beforeEach(() => {
    basicMockState = [
      {
        title: 'test-1',
        maps: [mockMaps[0], mockMaps[1]],
      },
      {
        title: 'test-2',
        maps: [mockMaps[2], mockMaps[3]],
      },
      {
        title: 'test-3',
        maps: [],
      },
    ];
  });
  it('returns a list of all maps among all topics', () => {
    const actual = selectMaps.projector(basicMockState);

    expect(actual).toEqual(mockMaps);
  });
});
