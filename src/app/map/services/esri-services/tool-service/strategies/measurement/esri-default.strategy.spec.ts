import {EsriDefaultStrategy} from './esri-default.strategy';

describe('EsriDefaultStrategy', () => {
  it('start raises an error', () => {
    const strategy = new EsriDefaultStrategy();

    expect(() => strategy.start()).toThrow(new Error('Default Strategy is not implemented.'));
  });
  it('cancel raises an error', () => {
    const strategy = new EsriDefaultStrategy();

    expect(() => strategy.cancel()).toThrow(new Error('Default Strategy is not implemented.'));
  });
});
