import {selectCenterReadable, selectRoundedScale} from './map-config.selector';

describe('map config selector', () => {
  describe('selectRoundedScale', () => {
    it.each([
      {scale: 1.234, expected: 1},
      {scale: 1.6, expected: 2},
      {scale: 3, expected: 3},
    ])('rounds %s to %s', ({scale, expected}) => {
      expect(selectRoundedScale.projector(scale)).toBe(expected);
    });
  });

  describe('selectCenterReadable', () => {
    it('produces a human-readable string from a given x and y center', () => {
      const selectCenterMock = {x: 12.3, y: 16.6};
      const expectedString = '12 / 17';

      expect(selectCenterReadable.projector(selectCenterMock)).toBe(expectedString);
    });
  });
});
