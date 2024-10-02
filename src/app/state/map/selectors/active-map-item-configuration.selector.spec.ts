import {selectActiveMapItemConfigurations} from './active-map-item-configuration.selector';
import {ActiveMapItemConfiguration} from '../../../shared/interfaces/active-map-item-configuration.interface';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {Map} from '../../../shared/interfaces/topic.interface';

describe('selectActiveMapItemConfiguration', () => {
  it('returns activeMapItemConfigurations from ActiveMapItmes', () => {
    const gb2ActiveMapItem = ActiveMapItemFactory.createGb2WmsMapItem(
      {
        id: 'StatGebAlterZH',
        mapId: 'StatGebAlterZH',
        layers: [],
        timeSliderConfiguration: {
          name: 'Aktueller Gebäudebestand nach Baujahr',
          alwaysMaxRange: false,
          dateFormat: 'YYYY',
          description: 'Gebäude bis 2020',
          maximumDate: '2020',
          minimumDate: '1000',
          minimalRange: 'P1Y',
          sourceType: 'parameter',
          source: {
            startRangeParameter: 'FILTER_VON',
            endRangeParameter: 'FILTER_BIS',
            layerIdentifiers: ['geb-alter_wohnen', 'geb-alter_grau', 'geb-alter_2'],
          },
        },
      } as unknown as Map,
      undefined,
      true,
      0.71,
      undefined,
      [
        {
          parameter: 'FILTER_GEBART',
          name: 'Anzeigeoptionen nach Hauptnutzung',
          filterValues: [
            {
              name: 'Wohnen',
              isActive: true,
              values: [],
            },
            {
              name: 'Gewerbe und Verwaltung',
              isActive: false,
              values: [],
            },
            {
              name: 'Andere',
              isActive: false,
              values: [],
            },
          ],
        },
      ],
      false,
    );

    const actual = selectActiveMapItemConfigurations.projector([gb2ActiveMapItem]);
    const expected: ActiveMapItemConfiguration[] = [
      {
        id: 'StatGebAlterZH',
        mapId: 'StatGebAlterZH',
        layers: [],
        opacity: 0.71,
        visible: true,
        isSingleLayer: false,
        attributeFilters: [
          {
            parameter: 'FILTER_GEBART',
            name: 'Anzeigeoptionen nach Hauptnutzung',
            activeFilters: [
              {
                name: 'Wohnen',
                isActive: true,
              },
              {
                name: 'Gewerbe und Verwaltung',
                isActive: false,
              },
              {
                name: 'Andere',
                isActive: false,
              },
            ],
          },
        ],
        timeExtent: undefined,
      },
    ];

    expect(actual).toEqual(expected);
  });
});
