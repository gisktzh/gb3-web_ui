import {selectPrintFeatureInfoItems} from './print-feature-info-items.selector';
import {
  FeatureInfoQueryLocation,
  FeatureInfoResultDisplay,
  FeatureInfoResultLayer,
} from '../../../shared/interfaces/feature-info.interface';
import {FeatureInfoPrintConfiguration} from '../../../shared/interfaces/overlay-print.interface';

describe('selectPrintFeatureInfoItems', () => {
  it('returns the print configuration for a given state', () => {
    const mockFeatureInfos: FeatureInfoResultDisplay[] = [
      {
        topicId: 'Rivendell',
        layers: [{layer: 'Bruchtal'} as FeatureInfoResultLayer, {layer: 'Imladris'} as FeatureInfoResultLayer],
      } as FeatureInfoResultDisplay,
      {
        topicId: 'Isengard',
        layers: [
          {layer: 'Beautiful fortress in Nan Curunir'} as FeatureInfoResultLayer,
          {layer: 'Inhabited by a very nice Wizard'} as FeatureInfoResultLayer,
        ],
      } as FeatureInfoResultDisplay,
    ];
    const mockQueryLocation: FeatureInfoQueryLocation = {x: 42, y: 1337};
    const expected: FeatureInfoPrintConfiguration = {
      ...mockQueryLocation,
      items: [
        {topic: mockFeatureInfos[0].topicId, layers: [mockFeatureInfos[0].layers[0].layer, mockFeatureInfos[0].layers[1].layer]},
        {topic: mockFeatureInfos[1].topicId, layers: [mockFeatureInfos[1].layers[0].layer, mockFeatureInfos[1].layers[1].layer]},
      ],
    };

    const actual = selectPrintFeatureInfoItems.projector(mockFeatureInfos, mockQueryLocation);

    expect(actual).toEqual(expected);
  });
});
