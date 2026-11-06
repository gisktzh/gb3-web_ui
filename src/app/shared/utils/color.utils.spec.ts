import {ColorUtils} from './color.utils';
import {SymbolizationColor} from '../interfaces/symbolization.interface';
import {InvalidHexFormat, InvalidRGBFormat} from '../errors/color-format-conversion.errors';

describe('ColorUtils', () => {
  describe('convertHexToSymbolizationColor', () => {
    it.each(['#006699', '006699', '#6699'])('converts RGBA value %s correctly', (hexColor) => {
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

    it.each([
      {hexColor: '#006699', alpha: 1.6},
      {hexColor: '#00669999', alpha: undefined},
      {hexColor: '#QQ6699', alpha: undefined},
    ])('throws an error for hexColor %s and alpha value %s', ({hexColor, alpha}) => {
      expect(() => ColorUtils.convertHexToSymbolizationColor(hexColor, alpha)).toThrow(new InvalidHexFormat());
    });
  });

  describe('convertSymbolizationColorToHex', () => {
    it('converts a RGBA value to HEX correctly', () => {
      const rgba: SymbolizationColor = {r: 0, g: 102, b: 153, a: 0.6};

      const actual = ColorUtils.convertSymbolizationColorToHex(rgba);
      const expected = {hexColor: '#006699', alpha: 0.6};

      expect(actual).toEqual(expected);
    });
    it('throws an error if the rgb values are not valid', () => {
      const rgba: SymbolizationColor = {r: 256, g: 102, b: 153, a: 0.6};
      expect(() => ColorUtils.convertSymbolizationColorToHex(rgba)).toThrow(new InvalidRGBFormat());
    });
  });
});
