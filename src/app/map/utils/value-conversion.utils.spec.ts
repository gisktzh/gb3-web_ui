import {ValueConversionUtils} from './value-conversion.utils';

describe('ValueConversionUtils', () => {
  //write tests for the methods in ValueConversionUtils
  //getStringOrDefaultValue
  describe('getStringOrDefaultValue', () => {
    it('should return empty string if input is undefined', () => {
      const actual = ValueConversionUtils.getStringOrDefaultValue(undefined);
      const expected = '';
      expect(actual).toEqual(expected);
    });
    it('should return empty string if input is null', () => {
      const actual = ValueConversionUtils.getStringOrDefaultValue(null);
      const expected = '';
      expect(actual).toEqual(expected);
    });
    it('should return the input string if input is not null or undefined', () => {
      const actual = ValueConversionUtils.getStringOrDefaultValue('input');
      const expected = 'input';
      expect(actual).toEqual(expected);
    });
  });

  describe('getNumberOrDefaultValue', () => {
    it('should return 0 if input is undefined', () => {
      const actual = ValueConversionUtils.getNumberOrDefaultValue(undefined);
      const expected = 0;
      expect(actual).toEqual(expected);
    });
    it('should return 0 if input is null', () => {
      const actual = ValueConversionUtils.getNumberOrDefaultValue(null);
      const expected = 0;
      expect(actual).toEqual(expected);
    });
    it('should return the input number if input is not null or undefined', () => {
      const actual = ValueConversionUtils.getNumberOrDefaultValue(5);
      const expected = 5;
      expect(actual).toEqual(expected);
    });
  });

  describe('getBooleanOrDefaultValue', () => {
    it('should return false if input is undefined', () => {
      const actual = ValueConversionUtils.getBooleanOrDefaultValue(undefined);
      const expected = false;
      expect(actual).toEqual(expected);
    });
    it('should return false if input is null', () => {
      const actual = ValueConversionUtils.getBooleanOrDefaultValue(null);
      const expected = false;
      expect(actual).toEqual(expected);
    });
    it('should return the input boolean if input is not null or undefined', () => {
      const actual = ValueConversionUtils.getBooleanOrDefaultValue(true);
      const expected = true;
      expect(actual).toEqual(expected);
    });
  });

  describe('getArrayOrDefaultValue', () => {
    it('should return empty array if input is undefined', () => {
      const actual = ValueConversionUtils.getArrayOrDefaultValue(undefined);
      const expected: number[] = [];
      expect(actual).toEqual(expected);
    });
    it('should return empty array if input is null', () => {
      const actual = ValueConversionUtils.getArrayOrDefaultValue(null);
      const expected: number[] = [];
      expect(actual).toEqual(expected);
    });
    it('should return the input array if input is not null or undefined', () => {
      const actual = ValueConversionUtils.getArrayOrDefaultValue([1, 2, 3]);
      const expected = [1, 2, 3];
      expect(actual).toEqual(expected);
    });
  });
});
