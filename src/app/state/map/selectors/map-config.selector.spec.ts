import {selectCenterReadable, selectRoundedScale} from './map-config.selector';

describe('map config selector', () => {
  describe('selectRoundedScale', () => {
    it('rounds a given scale down correctly', () => {
      const selectScaleMock = 1.234;
      const expectedScale = 1;

      expect(selectRoundedScale.projector(selectScaleMock)).toBe(expectedScale);
    });

    it('rounds a given scale up correctly', () => {
      const selectScaleMock = 1.6;
      const expectedScale = 2;

      expect(selectRoundedScale.projector(selectScaleMock)).toBe(expectedScale);
    });

    it('does not touch already rounded scales', () => {
      const selectScaleMock = 3;
      const expectedScale = 3;

      expect(selectRoundedScale.projector(selectScaleMock)).toBe(expectedScale);
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
