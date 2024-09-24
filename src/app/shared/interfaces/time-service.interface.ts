export interface TimeService {
  getDateFromString: (date: string, format?: string) => Date; // todo: create a type for the format

  getDateAsFormattedString: (date: Date, format: string) => string; // todo: create a type for the format

  /**
   * Converts a date into UTC and returns it as (optionally formatted) string.
   * @param date
   * @param format
   */
  getDateAsUTCString: (date: Date, format?: string) => string; // todo: create a type for the format

  getDateFromUnixTimestamp: (timestamp: number) => Date;

  /**
   * Returns the difference between two dates in milliseconds.
   */
  calculateDifferenceBetweenDates: (firstDate: Date, secondDate: Date) => number;

  /**
   * Given a date and a unit, this method returns the partial value of the given date.
   * @param date
   * @param unit
   */
  getPartialFromString(date: string, unit: DateUnit): number; // todo: create a type for the unit

  isDate: (value: string) => boolean;

  getUTCDateFromString: (date: string, format?: string) => Date;

  /**
   * Returns `true` if the given string range is exactly one of a single time unit (year, month, ...).
   *
   * @example
   * `P1Y1M` is a duration of one year AND one month which is more than one time unit; therefore is the result `false`
   * `P2Y` is a duration of two years which is more than one of a single time unit; therefore is the result `false`
   * `P1D` is a duration of one day which is exactly one of a single time unit; therefore the result is `true`
   */
  isStringSingleTimeUnitRange: (range: string) => boolean;

  addRangeToDate: (date: Date, range: string) => Date;

  subtractRangeFromDate: (date: Date, range: string) => Date;

  getISORangeInMilliseconds: (range: string) => number;

  /**
   * Adds a range of 1 of the given unit to the date.
   * @param date
   * @param unit
   */
  addMinimalRangeToDate: (date: Date, unit: string) => Date;
}

export type DateUnit = 'days' | 'months' | 'years' | 'hours' | 'minutes' | 'seconds' | 'milliseconds';
