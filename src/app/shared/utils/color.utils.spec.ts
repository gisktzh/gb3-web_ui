import {ColorUtils} from './color.utils';
import {SymbolizationColor} from '../interfaces/symbolization.interface';

describe('ColorUtils', () => {
  it('converts an RGB value to RGBA correctly', () => {
    const hexColor = '#006699';
    const alpha = 0.6;

    const actual = ColorUtils.convertHexToSymbolizationColor(hexColor, alpha);
    const expected: SymbolizationColor = {
      r: 0,
      g: 102,
      b: 153,
      a: alpha,
    };
    expect(actual).toEqual(expected);
  });
});
