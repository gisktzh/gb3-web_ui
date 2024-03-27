import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {Map} from '../../../shared/interfaces/topic.interface';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {selectAllItems, selectGb2WmsActiveMapItemsWithMapNotices, selectItems} from './active-map-items.selector';
import {ActiveMapItemState} from '../states/active-map-item.state';

const drawingsActiveMapItem = ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Drawings, 'test');
const measurementsActiveMapItem = ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Measurements, 'test');
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
});
