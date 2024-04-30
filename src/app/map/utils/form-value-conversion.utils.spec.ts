import {FormValueConversionUtils} from './form-value-conversion.utils';

describe('ValueConversionUtils', () => {
  describe('getStringOrDefaultValue', () => {
    it('should return empty string if input is undefined', () => {
      const actual = FormValueConversionUtils.getStringOrDefaultValue(undefined);
      const expected = '';
      expect(actual).toEqual(expected);
    });
    it('should return empty string if input is null', () => {
      const actual = FormValueConversionUtils.getStringOrDefaultValue(null);
      const expected = '';
      expect(actual).toEqual(expected);
    });
    it('should return the input string if input is not null or undefined', () => {
      const actual = FormValueConversionUtils.getStringOrDefaultValue('input');
      const expected = 'input';
      expect(actual).toEqual(expected);
    });
  });

  describe('getNumberOrDefaultValue', () => {
    it('should return 0 if input is undefined', () => {
      const actual = FormValueConversionUtils.getNumberOrDefaultValue(undefined);
      const expected = 0;
      expect(actual).toEqual(expected);
    });
    it('should return 0 if input is null', () => {
      const actual = FormValueConversionUtils.getNumberOrDefaultValue(null);
      const expected = 0;
      expect(actual).toEqual(expected);
    });
    it('should return the input number if input is not null or undefined', () => {
      const actual = FormValueConversionUtils.getNumberOrDefaultValue(5);
      const expected = 5;
      expect(actual).toEqual(expected);
    });
  });

  describe('getBooleanOrDefaultValue', () => {
    it('should return false if input is undefined', () => {
      const actual = FormValueConversionUtils.getBooleanOrDefaultValue(undefined);
      const expected = false;
      expect(actual).toEqual(expected);
    });
    it('should return false if input is null', () => {
      const actual = FormValueConversionUtils.getBooleanOrDefaultValue(null);
      const expected = false;
      expect(actual).toEqual(expected);
    });
    it('should return the input boolean if input is not null or undefined', () => {
      const actual = FormValueConversionUtils.getBooleanOrDefaultValue(true);
      const expected = true;
      expect(actual).toEqual(expected);
    });
  });

  describe('getArrayOrDefaultValue', () => {
    it('should return empty array if input is undefined', () => {
      const actual = FormValueConversionUtils.getArrayOrDefaultValue(undefined);
      const expected: number[] = [];
      expect(actual).toEqual(expected);
    });
    it('should return empty array if input is null', () => {
      const actual = FormValueConversionUtils.getArrayOrDefaultValue(null);
      const expected: number[] = [];
      expect(actual).toEqual(expected);
    });
    it('should return the input array if input is not null or undefined', () => {
      const actual = FormValueConversionUtils.getArrayOrDefaultValue([1, 2, 3]);
      const expected = [1, 2, 3];
      expect(actual).toEqual(expected);
    });
  });
});
