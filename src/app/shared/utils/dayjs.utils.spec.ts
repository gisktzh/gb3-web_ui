import {DayjsUtils} from './dayjs.utils';
import dayjs from 'dayjs';

describe('DayjsUtils', () => {
  describe('getPartial', () => {
    it('returns the correct partial value', () => {
      expect(DayjsUtils.getPartial('2023-10-01', 'years')).toBe(2023);
      expect(DayjsUtils.getPartial('2023-10-01', 'month')).toBe(9); // month is 0-indexed
    });
  });

  describe('getDuration', () => {
    it('returns the duration object from a time string', () => {
      expect(DayjsUtils.getDuration('P1D').asSeconds()).toBe(86400);
    });
  });

  describe('getDurationWithUnit', () => {
    it('returns the duration object from a time and unit', () => {
      expect(DayjsUtils.getDurationWithUnit(1, 'year').asYears()).toBe(1);
    });
  });

  describe('addDuration', () => {
    it('adds the duration to the date', () => {
      const date = new Date(2023, 9, 1);
      const duration = dayjs.duration({days: 1});
      expect(DayjsUtils.addDuration(date, duration)).toEqual(new Date(2023, 9, 2));
    });
  });

  describe('subtractDuration', () => {
    it('subtracts the duration from the date', () => {
      const date = new Date(2023, 9, 1);
      const duration = dayjs.duration({days: 1});
      expect(DayjsUtils.subtractDuration(date, duration)).toEqual(new Date(2023, 8, 30));
    });
  });
});
