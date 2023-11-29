import {Map} from '../../../shared/interfaces/topic.interface';
import {FeatureInfoResult, FeatureInfoResultDisplay} from '../../../shared/interfaces/feature-info.interface';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {createGb2WmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';
import {selectFeatureInfosForDisplay} from './feature-info-result-display.selector';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';

let mockMaps: Map[];
let mockData: FeatureInfoResult[];
let mockItems: ActiveMapItem[];

describe('selectFeatureInfosForDisplay', () => {
  beforeEach(() => {
    mockMaps = [{id: 'test-map'} as Map];
    mockData = [
      {
        topic: 'test-map',
        layers: [
          {
            features: [{fid: 123, bbox: [1, 2, 3, 4], fields: [], geometry: {srs: 2056, type: 'Point', coordinates: []}}],
            layer: 'None',
            title: 'EmptyLayer',
          },
        ],
        isSingleLayer: false,
        metaDataLink: '',
      },
    ];
    mockItems = [createGb2WmsMapItemMock('test-map', 1, true, 0)];
  });

  it('aborts if a featureinfo returned no hits for any of its layers.', () => {
    mockData[0].layers = [];
    const actual = selectFeatureInfosForDisplay.projector(mockData, mockMaps, mockItems);
    expect(actual).toHaveSize(0);
  });

  it('aborts if the featureInfo endpoint returns a non-matchable topic ID', () => {
    mockData[0].topic = 'something else';
    const actual = selectFeatureInfosForDisplay.projector(mockData, mockMaps, mockItems);
    expect(actual).toHaveSize(0);
  });

  it("aborts if the featureInfo isn't part of the active map items anymore", () => {
    mockData[0].topic = 'same thing';
    mockMaps[0].id = 'same thing';
    const actual = selectFeatureInfosForDisplay.projector(mockData, mockMaps, mockItems);
    expect(actual).toHaveSize(0);
  });

  it('returns a FeatureInfoResultDisplay as singleLayer', () => {
    mockData[0].isSingleLayer = true;
    const actual = selectFeatureInfosForDisplay.projector(mockData, mockMaps, mockItems);
    const expected: FeatureInfoResultDisplay[] = [
      {
        id: Gb2WmsActiveMapItem.createSingleLayerId(mockMaps[0].id, mockData[0].layers[0].layer),
        title: mockData[0].layers[0].title,
        layers: mockData[0].layers,
        icon: undefined,
        isSingleLayer: true,
        metaDataLink: '',
        mapId: mockMaps[0].id,
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('returns a FeatureInfoResultDisplay as topic', () => {
    const actual = selectFeatureInfosForDisplay.projector(mockData, mockMaps, mockItems);
    const expected: FeatureInfoResultDisplay[] = [
      {
        id: mockItems[0].id,
        title: mockMaps[0].title,
        layers: mockData[0].layers,
        icon: undefined,
        isSingleLayer: false,
        metaDataLink: '',
        mapId: mockItems[0].id,
      },
    ];
    expect(actual).toEqual(expected);
  });
});
