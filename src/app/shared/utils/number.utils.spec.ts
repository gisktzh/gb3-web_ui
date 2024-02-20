import {NumberUtils} from './number.utils';

describe('NumberUtils', () => {
  describe('roundToDecimals', () => {
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
        expect(NumberUtils.roundToDecimals(input, decimals)).toBe(input);
      });

      it("does not add decimals if specified decimals is higher than input's decimals", () => {
        const input = 1337.44444;
        const decimals = 42;
        expect(NumberUtils.roundToDecimals(input, decimals)).toBe(input);
      });
    });
  });

  describe('tryExtractNumberFromMixedString', () => {
    describe('valid number extraction', () => {
      [
        {input: '1337', expected: 1337},
        {input: '1337.4', expected: 1337.4},
        {input: 'f1337.5', expected: 1337.5},
        {input: 'a.5', expected: 0.5},
        {input: '  1337.5', expected: 1337.5},
        {input: '  1337.5 fasd', expected: 1337.5},
        {input: '1 f 3 ___3 xx\nx7  ,,,. 5ww__1', expected: 1337.51},
        {input: '1337.51.51', expected: 1337.51},
        {input: '1337.f.51', expected: 1337},
        {input: '1337..51', expected: 1337},
      ].forEach((testCase) => {
        it(`converts ${testCase.input} to ${testCase.expected}`, () => {
          expect(NumberUtils.tryExtractNumberFromMixedString(testCase.input)).toBe(testCase.expected);
        });
      });
    });
    describe('invalid number extraction', () => {
      [{input: 'ff'}, {input: 'eins.zwei'}].forEach((testCase) => {
        it(`converts ${testCase.input} to undefined}`, () => {
          expect(NumberUtils.tryExtractNumberFromMixedString(testCase.input)).toBe(undefined);
        });
      });
    });
  });
});
