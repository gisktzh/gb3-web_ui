import {DateUnit} from '../types/date-unit.type';

export interface TimeService {
  /**
   * Given a date and a unit, this method returns the partial value of the given date.
   */
  createPartialFromString: (date: string, unit: DateUnit) => number;
  /**
   * Creates a date object from a string; with an optional format in ISO 8601.
   */
  createDateFromString: (date: string, format?: string) => Date;
  /**
   * Creates a date object from a Unix timestamp.
   */
  createDateFromUnixTimestamp: (timestamp: number) => Date;
  /**
   * Creates a date object from a string in UTC; with an optional format in ISO 8601.
   */
  createUTCDateFromString: (date: string, format?: string) => Date;
  /**
   * Returns the date as a formatted string according to the given format in ISO 8601.
   */
  getDateAsFormattedString: (date: Date, format: string) => string;
  /**
   * Converts a date into UTC and returns it as (optionally formatted) string.
   */
  getDateAsUTCString: (date: Date, format?: string) => string;
  /**
   * Returns the difference between two dates in full days. Everything smaller (hours, minutes, seconds) is ignored.
   */
  calculateDifferenceBetweenDates: (firstDate: Date, secondDate: Date) => number;
  /**
   * Checks whether the given string is a valid date.
   */
  isDate: (value: string) => boolean;
  /**
   * Returns `true` if the given string range is exactly one of a single time unit (year, month, ...).
   *
   * @example
   * `P1Y1M` is a range of one year AND one month which is more than one time unit; therefore is the result `false`
   * `P2Y` is a range of two years which is more than one of a single time unit; therefore is the result `false`
   * `P1D` is a range of one day which is exactly one of a single time unit; therefore the result is `true`
   */
  isStringSingleTimeUnitRange: (range: string) => boolean;
  /**
   * Adds the range to the given date as exact as possible.
   *
   * @remarks
   * It will add values of a specific unit to the date in case that
   * the range contains only values of one specific unit (e.g. 'years'). This has the advantage that it does not use
   * a generic solution which would be 365 days in case of a year.
   * */
  addRangeToDate: (date: Date, range: string) => Date;
  /**
   * Subtracts the range from the given date as exact as possible.
   *
   * @remarks
   * It will subtract values of a specific unit from the date in case that
   * the range contains only values of one specific unit (e.g. 'years'). This has the advantage that it does not use
   * a generic solution which would be 365 days in case of a year.
   * */
  subtractRangeFromDate: (date: Date, range: string) => Date;
  /**
   * Returns an ISO 8601 range in milliseconds.
   */
  getISORangeInMilliseconds: (range: string) => number;
  /**
   * Adds a range of 1 of the given unit to the date.
   * @param date
   * @param unit
   */
  addMinimalRangeToDate: (date: Date, unit: string) => Date;
}
