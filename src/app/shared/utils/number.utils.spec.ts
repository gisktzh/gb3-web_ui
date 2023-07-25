import {NumberUtils} from './number.utils';

describe('NumberUtils', () => {
  describe('rounding with decimals', () => {
    [
      {input: 1337.4444444, decimals: 0, expected: 1337},
      {input: 1337.4444444, decimals: 1, expected: 1337.4},
      {input: 1337.4444444, decimals: 5, expected: 1337.44444},
    ].forEach((testCase) => {
      it(`rounds value to ${testCase.decimals} decimals`, () => {
        expect(NumberUtils.roundToDecimals(testCase.input, testCase.decimals)).toBe(testCase.expected);
      });
    });
  });

  describe('rounding with no or invalid decimals', () => {
    [
      {input: 1337.4444444, decimals: undefined, expected: 1337},
      {input: 1337.4444444, decimals: -5, expected: 1337},
      {input: 1337.4444444, decimals: 0.5, expected: 1337},
      {input: 1337.4444444, decimals: 1.5, expected: 1337},
    ].forEach((testCase) => {
      it(`rounds ${testCase.decimals} decimal value to no decimal`, () => {
        expect(NumberUtils.roundToDecimals(testCase.input, testCase.decimals)).toBe(testCase.expected);
      });
    });
  });

  describe('edge cases', () => {
    it('has one less decimal if value is rounded up', () => {
      const input = 1337.595;
      const decimals = 2;
      const expected = 1337.6;

      expect(NumberUtils.roundToDecimals(input, decimals)).toBe(expected);
    });

    it("does not round if decimal count is higher than input's decimals", () => {
      const input = 1337.555555;
      const decimals = 42;
      const expected = input;

      expect(NumberUtils.roundToDecimals(input, decimals)).toBe(expected);
    });

    it("does not add decimals if specified decimals is higher than input's decimals", () => {
      const input = 1337.44444;
      const decimals = 42;
      const expected = input;

      expect(NumberUtils.roundToDecimals(input, decimals)).toBe(expected);
    });
  });
});
