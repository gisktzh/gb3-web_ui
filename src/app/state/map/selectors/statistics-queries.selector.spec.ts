import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {createDrawingMapItemMock, createGb2WmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';
import {statisticsMapQueries} from '../../../shared/configs/statistics.config';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {selectStatisticsQueries} from './statistics-queries.selector';

describe('selectStatisticsQueries', () => {
  function mapItem(topic: string, layer: string): Gb2WmsActiveMapItem {
    const item = createGb2WmsMapItemMock(topic, 1);
    Object.assign(item.settings.layers[0], {layer, minScale: 10, maxScale: 10000, queryable: false});
    return item;
  }

  it('selects all three configured topics independently of feature-info queryability', () => {
    const items = [
      mapItem('StatBevoelkerungZH', 'stat-bev-p'),
      mapItem('StatBeschaeftigteZH', 'stat-ent-p'),
      mapItem('StatGebaeudeZH', 'stat-geb-p'),
    ];
    expect(selectStatisticsQueries.projector(items, 1000)).toEqual(
      items.flatMap((item) => statisticsMapQueries[item.id].map((query) => ({topic: item.id, ...query}))),
    );
  });

  it.each(['hidden-map', 'hidden-layer', 'temporary', 'below-scale', 'above-scale', 'minimum-scale', 'maximum-scale'])(
    'excludes %s layers',
    (reason) => {
      const item = mapItem('StatBeschaeftigteZH', 'stat-ent-p');
      let scale = 1000;
      if (reason === 'hidden-map') item.visible = false;
      if (reason === 'hidden-layer') item.settings.layers[0].visible = false;
      if (reason === 'temporary') item.isTemporary = true;
      if (reason === 'below-scale') scale = 1;
      if (reason === 'above-scale') scale = 20000;
      if (reason === 'minimum-scale') scale = 10;
      if (reason === 'maximum-scale') scale = 10000;
      expect(selectStatisticsQueries.projector([item], scale)).toEqual([]);
    },
  );

  it('excludes unsupported topics, unsupported sublayers, and drawing layers', () => {
    const items = [
      mapItem('OtherTopic', 'stat-ent-p'),
      mapItem('StatBeschaeftigteZH', 'other-layer'),
      createDrawingMapItemMock(UserDrawingLayer.Drawings),
    ];
    expect(selectStatisticsQueries.projector(items, 1000)).toEqual([]);
  });

  it('supports individually added layers and deduplicates full-map/single-layer requests', () => {
    const full = mapItem('StatBeschaeftigteZH', 'stat-ent-p');
    const single = mapItem('StatBeschaeftigteZH', 'stat-ent-p');
    const individual = new Gb2WmsActiveMapItem(
      {
        id: single.id,
        title: single.title,
        uuid: null,
        printTitle: '',
        icon: '',
        organisation: null,
        gb2Url: null,
        keywords: [],
        wmsUrl: '',
        layers: single.settings.layers,
        minScale: null,
        notice: null,
        opacity: 1,
        timeSliderConfiguration: undefined,
        initialTimeSliderExtent: undefined,
      },
      single.settings.layers[0],
    );
    const expected = [{topic: full.id, ...statisticsMapQueries[full.id][0]}];
    expect(selectStatisticsQueries.projector([individual], 1000)).toEqual(expected);
    expect(selectStatisticsQueries.projector([full, individual], 1000)).toEqual(expected);
  });
});
