import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {selectActiveMapItemConfigurations} from './active-map-item-configuration.selector';
import {TimeExtentUtils} from '../../../shared/utils/time-extent.utils';
import {immerable} from 'immer';
import {AddToMapVisitor} from '../../../map/interfaces/add-to-map.visitor';
import {ActiveMapItemConfiguration} from '../../../shared/interfaces/active-map-item-configuration.interface';

describe('selectActiveMapItemConfiguration', () => {
  it('returns activeMapItemConfigurations from ActiveMapItmes', () => {
    const activeMapItemsMock: ActiveMapItem[] = [
      {
        id: 'StatGebAlterZH',
        opacity: 0.71,
        visible: true,
        isSingleLayer: false,
        title: 'Gebäudealter',
        mapImageUrl: null,
        geometadataUuid: null,
        loadingState: undefined,
        isTemporary: false,
        viewProcessState: undefined,
        [immerable]: true,
        addToMap(addToMapVisitor: AddToMapVisitor, position: number) {},
        settings: {
          type: 'gb2Wms',
          url: '',
          layers: [],
          mapId: '123',
          isNoticeMarkedAsRead: false,
          timeSliderExtent: {
            start: TimeExtentUtils.getUTCDate('1000-01-01T00:00:00.000Z'),
            end: TimeExtentUtils.getUTCDate('2020-01-01T00:00:00.000Z'),
          },
          filterConfigurations: [
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
          [immerable]: true,
        },
      },
    ];

    const actual = selectActiveMapItemConfigurations.projector(activeMapItemsMock);
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
        timeExtent: {
          start: TimeExtentUtils.getUTCDate('1000-01-01T00:00:00.000Z'),
          end: TimeExtentUtils.getUTCDate('2020-01-01T00:00:00.000Z'),
        },
      },
    ];

    // expect(actual).toEqual(expected);
  });
});
