import {Map} from '../../../shared/interfaces/topic.interface';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {createGb2WmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {Legend, LegendDisplay} from '../../../shared/interfaces/legend.interface';
import {selectLegendItemsForDisplay} from './legend-result-display.selector';

let mockMaps: Map[];
let mockData: Legend[];
let mockItems: ActiveMapItem[];

describe('selectLegendItemsForDisplay', () => {
  beforeEach(() => {
    mockMaps = [{id: 'test-map'} as Map];
    mockData = [
      {
        topic: 'test-map',
        layers: [{layer: 'some layer', title: 'title of layer', metaDataLink: ''}],
        isSingleLayer: false,
        metaDataLink: '',
      },
    ];
    mockItems = [createGb2WmsMapItemMock('test-map', 1, true, 0)];
  });

  it('aborts if the legend endpoint returns a non-matchable topic ID', () => {
    mockData[0].topic = 'something else';
    const actual = selectLegendItemsForDisplay.projector(mockData, mockMaps, mockItems);
    expect(actual).toHaveSize(0);
  });

  it("aborts if the legend isn't part of the active map items anymore", () => {
    mockData[0].topic = 'same thing';
    mockMaps[0].id = 'same thing';
    const actual = selectLegendItemsForDisplay.projector(mockData, mockMaps, mockItems);
    expect(actual).toHaveSize(0);
  });

  it('returns a LegendDisplay as singleLayer', () => {
    mockData[0].isSingleLayer = true;
    const actual = selectLegendItemsForDisplay.projector(mockData, mockMaps, mockItems);
    const expected: LegendDisplay[] = [
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

  it('returns a LegendDisplay as topic', () => {
    const actual = selectLegendItemsForDisplay.projector(mockData, mockMaps, mockItems);
    const expected: LegendDisplay[] = [
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
