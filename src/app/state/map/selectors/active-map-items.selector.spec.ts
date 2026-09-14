import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {Map} from '../../../shared/interfaces/topic.interface';
import {DrawingLayerPrefix, UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {
  selectAllItems,
  selectGb2WmsActiveMapItemsWithMapNotices,
  selectItems,
  selectTemporaryMapItems,
  selectTopicIdsForUrl,
} from './active-map-items.selector';
import {ActiveMapItemState} from '../states/active-map-item.state';
import {createExternalWmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';

const drawingsActiveMapItem = ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Drawings, DrawingLayerPrefix.Drawing);
const measurementsActiveMapItem = ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Measurements, DrawingLayerPrefix.Drawing);
const gb2ActiveMapItem = ActiveMapItemFactory.createGb2WmsMapItem({} as Map);
const temporaryGb2ActiveMapItem = ActiveMapItemFactory.createTemporaryGb2WmsMapItem({} as Map);
const gb2ActiveMapItemWithNotice = ActiveMapItemFactory.createGb2WmsMapItem({notice: 'I am a notice!'} as Map);
const temporaryGb2ActiveMapItemWithNotice = ActiveMapItemFactory.createTemporaryGb2WmsMapItem({notice: 'I am a notice!'} as Map);

describe('activeMapItemsSelector', () => {
  describe('selectAllItems', () => {
    it('returns all items', () => {
      const activeMapItemState: ActiveMapItemState = {
        items: [
          drawingsActiveMapItem,
          measurementsActiveMapItem,
          gb2ActiveMapItem,
          temporaryGb2ActiveMapItem,
          gb2ActiveMapItemWithNotice,
          temporaryGb2ActiveMapItemWithNotice,
        ],
      };

      const actual = selectAllItems.projector(activeMapItemState);

      expect(actual).toEqual([
        drawingsActiveMapItem,
        measurementsActiveMapItem,
        gb2ActiveMapItem,
        temporaryGb2ActiveMapItem,
        gb2ActiveMapItemWithNotice,
        temporaryGb2ActiveMapItemWithNotice,
      ]);
    });
  });

  describe('selectNonTemporaryActiveMapItems', () => {
    it('returns only items which are not temporary', () => {
      const activeMapItems = [
        drawingsActiveMapItem,
        measurementsActiveMapItem,
        gb2ActiveMapItem,
        temporaryGb2ActiveMapItem,
        gb2ActiveMapItemWithNotice,
        temporaryGb2ActiveMapItemWithNotice,
      ];

      const actual = selectItems.projector(activeMapItems);

      expect(actual).toEqual([drawingsActiveMapItem, measurementsActiveMapItem, gb2ActiveMapItem, gb2ActiveMapItemWithNotice]);
    });
  });

  describe('selectGb2WmsActiveMapItemsWithMapNotices', () => {
    it('returns (non-temporary) gb2wms items with notices attached only', () => {
      const activeMapItems = [drawingsActiveMapItem, measurementsActiveMapItem, gb2ActiveMapItem, gb2ActiveMapItemWithNotice];

      const actual = selectGb2WmsActiveMapItemsWithMapNotices.projector(activeMapItems);

      expect(actual).toEqual([gb2ActiveMapItemWithNotice]);
    });
  });

  describe('selectTopicIdsForUrl', () => {
    it('returns deduplicated topic ids in active item order', () => {
      const firstTopic = ActiveMapItemFactory.createGb2WmsMapItem({id: 'first'} as Map);
      const duplicateFirstTopic = ActiveMapItemFactory.createGb2WmsMapItem({id: 'first'} as Map);
      const secondTopic = ActiveMapItemFactory.createGb2WmsMapItem({id: 'second'} as Map);

      const actual = selectTopicIdsForUrl.projector([firstTopic, duplicateFirstTopic, secondTopic]);

      expect(actual).toEqual(['first', 'second']);
    });

    it('excludes temporary topics, single layers, drawings and external services', () => {
      const map = {id: 'topic', layers: [{layer: 'single'}]} as Map;
      const topic = ActiveMapItemFactory.createGb2WmsMapItem(map);
      const temporaryTopic = ActiveMapItemFactory.createTemporaryGb2WmsMapItem({id: 'temporary'} as Map);
      const singleLayer = ActiveMapItemFactory.createGb2WmsMapItem(map, map.layers[0]);
      const externalService = createExternalWmsMapItemMock('https://example.com/wms', 'external', []);

      const actual = selectTopicIdsForUrl.projector([
        topic,
        temporaryTopic,
        singleLayer,
        drawingsActiveMapItem,
        measurementsActiveMapItem,
        externalService,
      ]);

      expect(actual).toEqual(['topic']);
    });
  });

  describe('selectTemporaryMapItems', () => {
    it('returns temporary items only', () => {
      const activeMapItems = [
        temporaryGb2ActiveMapItem,
        drawingsActiveMapItem,
        measurementsActiveMapItem,
        gb2ActiveMapItem,
        gb2ActiveMapItemWithNotice,
      ];

      const actual = selectTemporaryMapItems.projector(activeMapItems);

      expect(actual).toEqual([temporaryGb2ActiveMapItem]);
    });
  });
});
