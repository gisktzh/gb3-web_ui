import {EsriDefaultStrategy, EsriDefaultStrategyNotImplementedError} from './esri-default.strategy';
import Graphic from '@arcgis/core/Graphic';

describe('EsriDefaultStrategy', () => {
  it('start raises an error', () => {
    const strategy = new EsriDefaultStrategy();

    expect(() => strategy.start()).toThrow(new EsriDefaultStrategyNotImplementedError());
  });
  it('edit raises an error', () => {
    const strategy = new EsriDefaultStrategy();
    const graphic = new Graphic();
    expect(() => strategy.edit(graphic)).toThrow(new EsriDefaultStrategyNotImplementedError());
  });
  it('cancel raises an error', () => {
    const strategy = new EsriDefaultStrategy();

    expect(() => strategy.cancel()).toThrow(new EsriDefaultStrategyNotImplementedError());
  });
});
