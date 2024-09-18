import {DayjsUtils} from './dayjs.utils';
import dayjs from 'dayjs';

describe('DayjsUtils', () => {
  describe('getPartial', () => {
    it('returns the correct partial value', () => {
      expect(DayjsUtils.getPartial('2023-10-01', 'years')).toBe(2023);
      expect(DayjsUtils.getPartial('2023-10-01', 'month')).toBe(9); // month is 0-indexed
    });
  });

  describe('getDateAsString', () => {
    it('returns the date as a formatted string', () => {
      const date = new Date(2023, 9, 1); // October 1, 2023
      expect(DayjsUtils.getDateAsString(date, 'YYYY-MM-DD')).toBe('2023-10-01');
    });
  });

  describe('getDate', () => {
    it('returns the date object from a string', () => {
      expect(DayjsUtils.getDate('2023-10-01', 'YYYY-MM-DD')).toEqual(new Date(2023, 9, 1));
      expect(DayjsUtils.getDate('2023-10-01')).toEqual(new Date(2023, 9, 1));
    });
  });

  describe('getUTCDateAsString', () => {
    it('returns the UTC date as a formatted string', () => {
      const date = new Date(Date.UTC(2023, 9, 1)); // October 1, 2023 UTC
      expect(DayjsUtils.getUTCDateAsString(date, 'YYYY-MM-DD')).toBe('2023-10-01');
    });
  });

  describe('getUnixDate', () => {
    it('returns the date object from a Unix timestamp', () => {
      const expectedDate = new Date(Date.UTC(2000, 0, 1));
      // 946684800 is the Unix timestamp for 2000-01-01T00:00:00.000Z (from https://timestampgenerator.com/946684800/+00:00)
      expect(DayjsUtils.getUnixDate(946684800).getTime()).toEqual(expectedDate.getTime());
    });
  });

  describe('parseUTCDate', () => {
    it('parses the UTC date from a string', () => {
      expect(DayjsUtils.parseUTCDate('2023-10-01', 'YYYY-MM-DD')).toEqual(new Date(Date.UTC(2023, 9, 1)));
      expect(DayjsUtils.parseUTCDate('2023-10-01')).toEqual(new Date(Date.UTC(2023, 9, 1)));
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

  describe('isValidDate', () => {
    it('validates the date string', () => {
      expect(DayjsUtils.isValidDate('2023-10-01')).toBe(true);
      expect(DayjsUtils.isValidDate('invalid-date')).toBe(false);
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

  describe('calculateDifferenceBetweenDates', () => {
    it('calculates the difference between two dates', () => {
      const date1 = new Date(2023, 9, 1);
      const date2 = new Date(2023, 9, 2);
      expect(DayjsUtils.calculateDifferenceBetweenDates(date1, date2)).toBe(86400000); // 1 day in milliseconds
    });
  });
});
