import {ColorUtils} from './color.utils';
import {SymbolizationColor} from '../interfaces/symbolization.interface';
import {InvalidHexFormat, InvalidRGBFormat} from '../errors/color-format-conversion.errors';

describe('ColorUtils', () => {
  describe('convertHexToSymbolizationColor', () => {
    it('converts a Hex value to RGBA correctly', () => {
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
    it('converts a Hex value to RGBA correctly when leading # is missing', () => {
      const hexColor = '006699';
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
    it('converts a Hex value to RGBA correctly when format is short', () => {
      const hexColor = '#6699';
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
    it('throws an error for invalid alpha value', () => {
      const hexColor = '#006699';
      const alpha = 1.6;

      expect(() => ColorUtils.convertHexToSymbolizationColor(hexColor, alpha)).toThrow(new InvalidHexFormat());
    });
    it('throws an error when input is too long', () => {
      const hexColor = '#00669999';

      expect(() => ColorUtils.convertHexToSymbolizationColor(hexColor)).toThrow(new InvalidHexFormat());
    });
    it('throws an error for invalid Hex values', () => {
      const hexColor = '#QQ6699';
      expect(() => ColorUtils.convertHexToSymbolizationColor(hexColor)).toThrow(new InvalidHexFormat());
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
