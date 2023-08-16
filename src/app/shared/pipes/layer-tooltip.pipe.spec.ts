import {LayerTooltipPipe} from './layer-tooltip.pipe';
import {MapLayer} from '../interfaces/topic.interface';

describe('LayerTooltipPipe', () => {
  let pipe: LayerTooltipPipe;

  beforeEach(() => {
    pipe = new LayerTooltipPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('formats the tooltip correctly', () => {
    const mockLayer: MapLayer = {title: 'Mocklayer', minScale: 42, maxScale: 1337} as MapLayer;

    const result = pipe.transform(mockLayer);

    const expected = `${mockLayer.title} (Sichtbarkeit 1:${mockLayer.minScale} - 1:${mockLayer.maxScale})`;
    expect(result).toEqual(expected);
  });
});
