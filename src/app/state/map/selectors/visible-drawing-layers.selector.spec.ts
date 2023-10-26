import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {selectVisibleDrawingLayers} from './visible-drawing-layers.selector';
import {DrawingActiveMapItem} from '../../../map/models/implementations/drawing.model';
import {createDrawingMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';

describe('selectVisibleDrawingLayers', () => {
  it('returns the layer type for visible layers only', () => {
    const layersMock: DrawingActiveMapItem[] = [
      createDrawingMapItemMock(UserDrawingLayer.Measurements),
      createDrawingMapItemMock(UserDrawingLayer.Drawings, false),
    ];

    const actual = selectVisibleDrawingLayers.projector(layersMock);

    expect(actual.length).toEqual(1);
    expect(actual[0]).toEqual(UserDrawingLayer.Measurements);
  });
});
