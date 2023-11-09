import {FeatureInfoResultDisplay, FeatureInfoResultLayer} from '../../../shared/interfaces/feature-info.interface';
import {PrintableOverlayItem} from '../../../shared/interfaces/overlay-print.interface';
import {selectPrintLegendItems} from './print-legend-items.selector';

describe('selectPrintLegendItems', () => {
  it('returns the print configuration for a given state', () => {
    const mockFeatureInfos: FeatureInfoResultDisplay[] = [
      {
        id: 'Rivendell',
        layers: [{layer: 'Bruchtal'} as FeatureInfoResultLayer, {layer: 'Imladris'} as FeatureInfoResultLayer],
      } as FeatureInfoResultDisplay,
      {
        id: 'Isengard',
        layers: [
          {layer: 'Beautiful fortress in Nan Curunir'} as FeatureInfoResultLayer,
          {layer: 'Inhabited by a very nice Wizard'} as FeatureInfoResultLayer,
        ],
      } as FeatureInfoResultDisplay,
    ];
    const expected: PrintableOverlayItem[] = [
      {topic: mockFeatureInfos[0].id, layers: [mockFeatureInfos[0].layers[0].layer, mockFeatureInfos[0].layers[1].layer]},
      {topic: mockFeatureInfos[1].id, layers: [mockFeatureInfos[1].layers[0].layer, mockFeatureInfos[1].layers[1].layer]},
    ];

    const actual = selectPrintLegendItems.projector(mockFeatureInfos);

    expect(actual).toEqual(expected);
  });
});
