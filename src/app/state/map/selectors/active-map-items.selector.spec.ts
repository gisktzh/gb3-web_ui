import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {Map} from '../../../shared/interfaces/topic.interface';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {selectGb2WmsActiveMapItemsWithMapNotices, selectItems} from './active-map-items.selector';

const drawingsActiveMapItem = ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Drawings, 'test');
const measurementsActiveMapItem = ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Measurements, 'test');
const gb2ActiveMapItem = ActiveMapItemFactory.createGb2WmsMapItem({} as Map);
const temporaryGb2ActiveMapItem = ActiveMapItemFactory.createTemporaryGb2WmsMapItem({} as Map);
const gb2ActiveMapItemWithNotice = ActiveMapItemFactory.createGb2WmsMapItem({notice: 'I am a notice!'} as Map);

describe('activeMapItemsSelector', () => {
  let basicMockState: ActiveMapItem[];
  describe('selectGb2WmsActiveMapItemsWithMapNotices', () => {
    it('returns gb2wms items with notices attached only', () => {
      basicMockState = [drawingsActiveMapItem, measurementsActiveMapItem, gb2ActiveMapItem, gb2ActiveMapItemWithNotice];

      const actual = selectGb2WmsActiveMapItemsWithMapNotices.projector(basicMockState);

      expect(actual).toEqual([gb2ActiveMapItemWithNotice]);
    });
  });

  describe('selectNonTemporaryActiveMapItems', () => {
    it('returns only items which are not temporary', () => {
      basicMockState = [gb2ActiveMapItem, temporaryGb2ActiveMapItem, gb2ActiveMapItemWithNotice];

      const actual = selectItems.projector(basicMockState);

      expect(actual).toEqual([gb2ActiveMapItem, gb2ActiveMapItemWithNotice]);
    });
  });
});
