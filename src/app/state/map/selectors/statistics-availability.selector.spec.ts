import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {statisticsMapQueries} from '../../../shared/configs/statistics.config';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {Map} from '../../../shared/interfaces/topic.interface';
import {createDrawingMapItemMock, createGb2WmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';
import {selectIsStatisticsAvailable} from './statistics-availability.selector';
import {selectStatisticsQueries} from './statistics-queries.selector';

describe('selectIsStatisticsAvailable', () => {
  function mapItem(topic = 'StatBeschaeftigteZH', layer = 'stat-ent-p') {
    const item = createGb2WmsMapItemMock(topic, 1);
    item.settings.layers[0].layer = layer;
    return item;
  }

  it.each(Object.entries(statisticsMapQueries))('enables statistics for %s', (topic, queries) => {
    const item = mapItem(topic, queries[0].layer);
    expect(selectIsStatisticsAvailable({activeMapItem: {items: [item]}})).toBe(true);
  });

  it.each(['hidden-map', 'hidden-layer'])('keeps %s available without querying it', (reason) => {
    const item = mapItem();
    if (reason === 'hidden-map') item.visible = false;
    if (reason === 'hidden-layer') item.settings.layers[0].visible = false;
    const state = {activeMapItem: {items: [item]}};
    expect(selectIsStatisticsAvailable(state)).toBe(true);
    expect(selectStatisticsQueries(state)).toEqual([]);
  });

  it('excludes temporary supported items', () => {
    const item = mapItem();
    item.isTemporary = true;
    expect(selectIsStatisticsAvailable({activeMapItem: {items: [item]}})).toBe(false);
  });

  it('excludes unsupported topics, unsupported layers, drawings, and empty maps', () => {
    expect(
      selectIsStatisticsAvailable({
        activeMapItem: {
          items: [
            mapItem('OtherTopic'),
            mapItem('StatBeschaeftigteZH', 'other-layer'),
            createDrawingMapItemMock(UserDrawingLayer.Drawings),
          ],
        },
      }),
    ).toBe(false);
    expect(selectIsStatisticsAvailable({activeMapItem: {items: []}})).toBe(false);
  });

  it('supports individually added layers using their topic rather than item id', () => {
    const item = mapItem();
    const map: Map = {
      id: item.settings.mapId,
      title: item.title,
      uuid: null,
      printTitle: '',
      icon: '',
      organisation: null,
      gb2Url: null,
      keywords: [],
      wmsUrl: '',
      layers: item.settings.layers,
      minScale: null,
      notice: null,
      opacity: 1,
      timeSliderConfiguration: undefined,
      initialTimeSliderExtent: undefined,
    };
    const single = new Gb2WmsActiveMapItem(map, item.settings.layers[0]);
    expect(single.id).not.toBe(map.id);
    expect(selectIsStatisticsAvailable({activeMapItem: {items: [single]}})).toBe(true);
  });

  it('stays available until the last supported item is removed', () => {
    const first = mapItem();
    const second = mapItem('StatBevoelkerungZH', 'stat-bev-p');
    expect(selectIsStatisticsAvailable({activeMapItem: {items: [first, second]}})).toBe(true);
    expect(selectIsStatisticsAvailable({activeMapItem: {items: [second]}})).toBe(true);
    expect(selectIsStatisticsAvailable({activeMapItem: {items: []}})).toBe(false);
  });
});
