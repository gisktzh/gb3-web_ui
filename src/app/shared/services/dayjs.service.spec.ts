import {TestBed} from '@angular/core/testing';
import {TIME_SERVICE} from '../../app.module';
import {DayjsService} from './dayjs.service';

describe('DayjsService', () => {
  let dayjsService: DayjsService;
  // todo override
  beforeEach(() => {
    TestBed.configureTestingModule({providers: [{provide: TIME_SERVICE, useClass: DayjsService}]});
    dayjsService = TestBed.inject(TIME_SERVICE) as DayjsService;
  });

  it('should be created', () => {
    expect(dayjsService).toBeTruthy();
  });

  describe('getDateFromString', () => {
    it('returns the date object from a string', () => {
      expect(dayjsService.getDateFromString('2023-10-01')).toEqual(new Date(2023, 9, 1));
    });

    it('returns the date object from a string with a format', () => {
      expect(dayjsService.getDateFromString('2023-10-01', 'YYYY-MM-DD')).toEqual(new Date(2023, 9, 1));
    });
  });

  describe('getDateAsFormattedString', () => {
    it('returns the date as a formatted string', () => {
      const date = new Date(2023, 9, 1); // October 1, 2023
      expect(dayjsService.getDateAsFormattedString(date, 'YYYY-MM-DD')).toBe('2023-10-01');
    });
  });

  describe('getDateAsUTCString', () => {
    it('returns the UTC date as a formatted string', () => {
      const date = new Date(Date.UTC(2023, 9, 1)); // October 1, 2023 UTC
      expect(dayjsService.getDateAsUTCString(date, 'YYYY-MM-DD')).toBe('2023-10-01');
    });
  });

  describe('getUnixDate', () => {
    it('returns the date object from a Unix timestamp', () => {
      const expectedDate = new Date(Date.UTC(2000, 0, 1));
      // 946684800 is the Unix timestamp for 2000-01-01T00:00:00.000Z (from https://timestampgenerator.com/946684800/+00:00)
      expect(dayjsService.getDateFromUnixTimestamp(946684800).getTime()).toEqual(expectedDate.getTime());
    });
  });

  describe('getUTCDateFromString', () => {
    it('parses the UTC date from a string', () => {
      expect(dayjsService.getUTCDateFromString('2023-10-01', 'YYYY-MM-DD')).toEqual(new Date(Date.UTC(2023, 9, 1)));
      expect(dayjsService.getUTCDateFromString('2023-10-01')).toEqual(new Date(Date.UTC(2023, 9, 1)));
    });
  });

  describe('isDate', () => {
    it('validates the date string', () => {
      expect(dayjsService.isDate('2023-10-01')).toBe(true);
      expect(dayjsService.isDate('invalid-date')).toBe(false);
    });
  });

  describe('calculateDifferenceBetweenDates', () => {
    it('calculates the difference between two dates', () => {
      const date1 = new Date(2023, 9, 1);
      const date2 = new Date(2023, 9, 2);
      expect(dayjsService.calculateDifferenceBetweenDates(date1, date2)).toBe(86400000); // 1 day in milliseconds
    });
  });
});
