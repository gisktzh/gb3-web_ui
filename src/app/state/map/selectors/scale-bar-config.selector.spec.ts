import {selectScaleBarConfig} from './scale-bar-config.selector';
import {MapConstants} from '../../../shared/constants/map.constants';

describe('selectScaleBarConfig', () => {
  it('returns undefined for an undefined reference length', () => {
    const actual = selectScaleBarConfig.projector(undefined);
    expect(actual).toBeUndefined();
  });
  describe('unit selection', () => {
    [
      {value: 1000, expectedUnit: 'km'},
      {value: 999.999, expectedUnit: 'm'},
      {value: 1, expectedUnit: 'm'},
      {value: 0.99, expectedUnit: 'cm'},
    ].forEach(({value, expectedUnit}) => {
      it(`returns ${expectedUnit} for ${value}`, () => {
        const actual = selectScaleBarConfig.projector(value);
        expect(actual!.unit).toEqual(expectedUnit);
      });
    });
  });

  describe('centimeter handling', () => {
    describe('value calculation with fixed breaks', () => {
      [
        {value: 0.55, expectedValue: 50},
        {value: 0.869, expectedValue: 50},
        {value: 0.5, expectedValue: 50},
        {value: 0.49, expectedValue: 20},
        {value: 0.2, expectedValue: 20},
        {value: 0.19, expectedValue: 10},
        {value: 0.095, expectedValue: 10},
        {value: 0.09, expectedValue: 5},
        {value: 0.05, expectedValue: 5},
        {value: 0.045, expectedValue: 5},
        {value: 0.044, expectedValue: 2},
        {value: 0.015, expectedValue: 2},
        {value: 0.014, expectedValue: 1},
        {value: 0.01, expectedValue: 1},
        {value: 0, expectedValue: 1},
      ].forEach(({value, expectedValue}) => {
        it(`returns ${expectedValue} for ${value}`, () => {
          const actual = selectScaleBarConfig.projector(value);
          expect(actual!.value).toEqual(expectedValue);
        });
      });
    });

    it('calculates the correct scale bar width', () => {
      const value = 0.42; // this picks the 20cm scale
      const ratio = 20 / (value * 100);
      const expectedWidth = Math.round(MapConstants.MAX_SCALE_BAR_WIDTH_PX * ratio);

      const actual = selectScaleBarConfig.projector(value);

      expect(actual!.scaleBarWidthInPx).toEqual(expectedWidth);
    });
  });

  describe('meter and kilometer handling', () => {
    describe('value calculation with power-based rounding', () => {
      [
        {value: 11, expectedValue: 10},
        {value: 25, expectedValue: 20},
        {value: 150, expectedValue: 100},
        {value: 220, expectedValue: 200},
        {value: 320, expectedValue: 300},
        {value: 550, expectedValue: 500},
        {value: 650, expectedValue: 500},
        {value: 999, expectedValue: 500},
        {value: 1000, expectedValue: 1},
      ].forEach(({value, expectedValue}) => {
        it(`returns ${expectedValue} for ${value}`, () => {
          const actual = selectScaleBarConfig.projector(value);
          expect(actual!.value).toEqual(expectedValue);
        });
      });
    });

    it('calculates the correct scale bar width', () => {
      const value = 420.1; // this picks the 300m scale
      const ratio = 300 / value;
      const expectedWidth = Math.round(MapConstants.MAX_SCALE_BAR_WIDTH_PX * ratio);

      const actual = selectScaleBarConfig.projector(value);

      expect(actual!.scaleBarWidthInPx).toEqual(expectedWidth);
    });
  });
});
